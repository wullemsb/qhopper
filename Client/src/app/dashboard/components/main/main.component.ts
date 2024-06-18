import { SelectionModel } from '@angular/cdk/collections';
import { Component, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { delay, Subscription, take } from 'rxjs';
import { ConnectionModel } from '../../../shared/models/connection.model';
import { ConnectionService } from '../../../shared/services/connection.service';
import { MessageModel } from '../../models/message.model';
import { MessagesActionProgressModel } from '../../models/messages-action-progress.model';
import { QueueModel } from '../../models/queue.model';
import { VhostModel } from '../../models/vhost.model';
import { RabbitApiService } from '../../services/rabbit-api.service';
import { RefreshService } from '../../services/refresh.service';
import { GetMessagesDialog } from '../get-messages-dialog/get-messages-dialog.component';
import { MoveMessagesConfirmationDialog } from '../move-messages-confirmation-dialog/move-message-confirmation-dialog.component';
import { MoveMessagesProgressDialog } from '../move-messages-progress-dialog/move-messages-progress-dialog.component';
import { DeleteMessagesProgressDialog } from '../delete-messages-progress-dialog/delete-messages-progress-dialog.component';
import { DeleteMessagesConfirmationDialog } from '../delete-messages-confirmation-dialog/delete-messages-confirmation-dialog.component';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss'
})
export class MainComponent {
  vhosts: VhostModel[] = [];
  messages: MessageModel[] = [];
  currentQueue?: QueueModel;
  selectedMessages: SelectionModel<MessageModel> = new SelectionModel<MessageModel>(true, []);
  selectedConnection?: ConnectionModel;
  toastr = inject(ToastrService);

  messagesSubscription?: Subscription;
  refreshSubscription?: Subscription;

  constructor(private rabbitApiService: RabbitApiService, private refreshService: RefreshService, private connectionService: ConnectionService, public dialog: MatDialog) { }

  loadAPIData() {

    // Reset all
    this.vhosts = [];
    this.messages = [];
    console.log('Loading data from connection...')

    // Get the Vhosts with their queues
    this.rabbitApiService.getVhostsAndQueuesWithRefresh().subscribe(
      (vhosts: VhostModel[]) => {
        this.vhosts = vhosts;
      },
      (error) => {
        console.error('Error loading data:', error);
        this.toastr.error('Failed to load data from the host. Please check your connection and try again.');
      }
    );
  }

  fetchMessages(queue: QueueModel): void {

    // Open dialog to show messages are being retrieved
    const getMessagesDialogRef = this.dialog.open(
      GetMessagesDialog,
      {
        backdropClass: 'bdrop',
        disableClose: true,
      }
    );

    // Get observable to message retrieval operation
    let getMessagesObservable = this.rabbitApiService.getMessages(queue.vhostName, queue.name);

    // Perform message retrieval once
    let getMessagesOnceSubscription = getMessagesObservable.pipe(delay(500)).subscribe((messages) => {
      this.messages = messages;
      getMessagesDialogRef.close();
      this.messagesSubscription = this.refreshService.refreshObservable.pipe(take(1)).subscribe(() => {
        this.messagesSubscription = this.rabbitApiService.getMessages(queue.vhostName, queue.name).subscribe(
          {
            next: (messages) => {
              this.messages = messages.reverse();
            }
          }
        );
      });

    });

    getMessagesDialogRef.afterClosed().subscribe(result => {

      // Cancel pressed
      if (result) {
        getMessagesOnceSubscription.unsubscribe();
        this.selectedMessages.clear();
        return;
      }
    });
  }

  onCurrentQueueChange(queue: QueueModel): void {
    this.selectedMessages.clear();
    // Do nothing when reselecting same queue
    if (this.currentQueue && this.currentQueue.name == queue.name && this.currentQueue.vhostName == queue.vhostName) {
      return;
    }

    this.currentQueue = queue;
    // Unsubscribe from message retrieval subscription for a queue
    if (this.refreshSubscription != undefined) {
      this.refreshSubscription.unsubscribe();
    }
    // Open dialog to show messages are being retrieved
    const getMessagesDialogRef = this.dialog.open(
      GetMessagesDialog,
      {
        backdropClass: 'bdrop',
        disableClose: true,
      }
    );

    // Get observable to message retrieval operation
    let getMessagesObservable = this.rabbitApiService.getMessages(queue.vhostName, queue.name);
    // Perform message retrieval once
    this.toastr.info('Loading messages ...');
    let getRefreshOnceSubscription = getMessagesObservable.pipe(delay(500)).subscribe((messages) => {
      this.messages = messages;
      getMessagesDialogRef.close();
    });

    getMessagesDialogRef.afterClosed().subscribe(result => {
      // Cancel pressed
      if (result == true) {
        getRefreshOnceSubscription.unsubscribe();
        return;
      }
      this.toastr.success('Succesfully fetched messages.');
    });
  }

  onSelectedConnectionChange(selectedConnection: ConnectionModel) {
    const connection = this.connectionService.getConnection(selectedConnection);
    if (connection) {
      this.connectionService.setConnection(connection);
      this.rabbitApiService.updateHttpOptions();
      this.refreshService.stopAllActiveRefreshSubscriptions();
      this.loadAPIData();
    }
    this.currentQueue = undefined;
    this.selectedMessages.clear();
  }

  onMoveMessagesEvent(targetQueue: QueueModel): void {
    // Open dialog to confirm move operation
    const moveConfirmationDialogRef = this.dialog.open(
      MoveMessagesConfirmationDialog,
      {
        backdropClass: 'bdrop',
        disableClose: true,
      });

    moveConfirmationDialogRef.afterClosed().subscribe(result => {
      // Cancel pressed
      if (!result) {
        return;
      }

      // Start move operation and retrieve observable to monitor the progress
      let progressObservable = this.rabbitApiService.moveMessages(this.currentQueue!, targetQueue, this.selectedMessages.selected);

      // Variable to keep track of the latest progress update
      let latestProgress: MessagesActionProgressModel;

      // Take initial progress status from the observable
      progressObservable.pipe(take(1)).subscribe((initialProgress) => {

        // Open dialog to monitor move operation progress
        const moveMessagesProgressDialogRef = this.dialog.open(
          MoveMessagesProgressDialog,
          {
            backdropClass: 'bdrop',
            disableClose: true,
            data: {
              progressObservable: progressObservable,
              initialProgress: initialProgress
            },
          });

        // Subscribe to the progress updates to ensure the progress dialog updates and track the latest progress
        progressObservable.subscribe(progressUpdate => {
          latestProgress = progressUpdate;
        });

        // Clean up move operation after dialog is closed
        moveMessagesProgressDialogRef.afterClosed().subscribe(() => {
          latestProgress.stopOperation();
          this.updateQueueMessageCount(this.currentQueue!, targetQueue, latestProgress.amountOfMessagesProcessed);
          this.onCurrentQueueChange(targetQueue);
          this.selectedMessages.clear();
        });
      });
    });
  }

  onDeleteMessagesEvent(): void {
    // Open dialog to confirm delete operation
    const deleteConfirmationDialogRef = this.dialog.open(
      DeleteMessagesConfirmationDialog,
      {
        backdropClass: 'bdrop',
        disableClose: true,
      });

    deleteConfirmationDialogRef.afterClosed().subscribe(result => {
      // Cancel pressed
      if (!result) {
        return;
      }

      // Start delete operation and retrieve observable to monitor the progress
      let progressObservable = this.rabbitApiService.deleteMessages(this.currentQueue!, this.selectedMessages.selected);

      // Variable to keep track of the latest progress update
      let latestProgress: MessagesActionProgressModel;

      // Take initial progress status from the observable
      progressObservable.pipe(take(1)).subscribe((initialProgress) => {

        // Open dialog to monitor delete operation progress
        const deleteMessagesProgressDialogRef = this.dialog.open(
          DeleteMessagesProgressDialog,
          {
            backdropClass: 'bdrop',
            disableClose: true,
            data: {
              progressObservable: progressObservable,
              initialProgress: initialProgress
            },
          });

        // Subscribe to the progress updates to ensure the progress dialog updates and track the latest progress
        progressObservable.subscribe(progressUpdate => {
          latestProgress = progressUpdate;
        });

        // Clean up delete operation after dialog is closed
        deleteMessagesProgressDialogRef.afterClosed().subscribe(() => {
          latestProgress.stopOperation();
          this.updateQueueMessageCount(this.currentQueue!, undefined, latestProgress.amountOfMessagesProcessed);
          this.onCurrentQueueChange(this.currentQueue!);
          this.fetchMessages(this.currentQueue!);
          this.selectedMessages.clear();
        });
      });
    });
  }

  updateQueueMessageCount(currentQueue: QueueModel, targetQueue?: QueueModel, amount?: number) {
    if (targetQueue == undefined) {
      let sourceVhost = this.vhosts.find(vhost => vhost.name == currentQueue.vhostName);
      if (sourceVhost) {
        let queue = sourceVhost.queues.find(x => x.name === currentQueue.name);
        if (queue) {
          queue.messages! -= amount!;
        }
      }
    }

    if (targetQueue != undefined) {
      let sourceVhost = this.vhosts.find(vhost => vhost.name == currentQueue.vhostName);
      if (sourceVhost) {
        let queue = sourceVhost.queues.find(x => x.name === currentQueue.name);
        if (queue) {
          queue.messages! -= amount!;
        }
      }
      let targetVhost = this.vhosts.find(vhost => vhost.name == targetQueue!.vhostName);
      if (targetVhost) {
        let queue = targetVhost.queues.find(x => x.name === targetQueue!.name);
        if (queue) {
          queue.messages! += amount!;
        }
      }
    }

    // Create a new reference for the vhosts array to trigger change detection
    this.vhosts = [...this.vhosts];
  }

}
