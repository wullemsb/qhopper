import { Component, Inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
} from '@angular/material/dialog';
import { ProgressSpinnerMode } from '@angular/material/progress-spinner';
import { MessagesActionProgressContainerModel } from '../../models/messages-action-progress-container.model';
import { MessagesActionProgressModel } from '../../models/messages-action-progress.model';
import { MessagesActionStatus } from '../../models/messages-action-status.enum';


@Component({
  selector: 'delete-messages-progress-dialog',
  templateUrl: 'delete-messages-progress-dialog.component.html',
  styleUrl: 'delete-messages-progress-dialog.component.scss'
})
export class DeleteMessagesProgressDialog {
  messageStatus!: MessagesActionProgressModel;
  MessagesActionStatus = MessagesActionStatus;
  dotColorClass!: string;
  buttonColorClass!: string;
  buttonText!: string;
  statusText!: string;
  infoText!: string;
  spinnerMode: ProgressSpinnerMode = 'indeterminate';

  constructor(@Inject(MAT_DIALOG_DATA) public data: MessagesActionProgressContainerModel, public dialogRef: MatDialogRef<DeleteMessagesProgressDialog>) {
    if (data) {
      this.messageStatus = data.initialProgress;
      this.updateDialogVariables();
      this.data.progressObservable.subscribe((statusUpdate: MessagesActionProgressModel) => {
        this.messageStatus = statusUpdate;
        this.updateDialogVariables();
      });
    }
  }

  onButtonClick(): void {
    this.messageStatus.stopOperation();
  }

  private updateDialogVariables(): void {
    switch (this.messageStatus.status) {
      case MessagesActionStatus.IN_PROGRESS: {
        this.dotColorClass = "yellow-dot";
        this.buttonColorClass = "";
        this.statusText = "In Progress";
        this.buttonText = "Cancel";
        break;
      }
      
      case MessagesActionStatus.FINISHED: {
        this.dotColorClass = "green-dot";
        this.buttonColorClass = "black-white";
        this.statusText = "Finished";
        this.spinnerMode = "determinate";
        this.buttonText = "Exit";

        let countdown = 6;
        const countdownInterval = setInterval(() => {
          countdown--;
          if (countdown > 0) {
            this.infoText = `Closing dialog in ${countdown} seconds.`;
          } else {
            clearInterval(countdownInterval);
            this.dialogRef.close();
          }
        }, 1000);
        break;
      }

      default: {
        this.dotColorClass = "yellow-dot";
        this.statusText = "In Progress";
        this.buttonText = "Cancel";
        break;
      }

    }
  }
}