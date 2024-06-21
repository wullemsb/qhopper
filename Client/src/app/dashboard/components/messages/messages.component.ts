import { animate, state, style, transition, trigger } from '@angular/animations';
import { SelectionModel } from '@angular/cdk/collections';
import { DatePipe } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatSort } from '@angular/material/sort';
import { TableVirtualScrollDataSource } from 'ng-table-virtual-scroll';
import { ToastrService } from 'ngx-toastr';
import { MessageModel } from '../../models/message.model';
import { QueueModel } from '../../models/queue.model';

@Component({
  selector: 'app-messages',
  styleUrl: './messages.component.scss',
  templateUrl: './messages.component.html',
  animations: [
    trigger('detailExpand', [
      state('collapsed,void', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ]
})

export class MessagesComponent implements OnChanges {
  @Input() messages!: MessageModel[];
  @Input() currentSelectedQueue?: QueueModel;
  @Input() selection!: SelectionModel<MessageModel>;
  @Output() messageSelectionChangedEvent: EventEmitter<MessageModel[]> = new EventEmitter<MessageModel[]>();
  @Output() deleteMessagesEvent = new EventEmitter<any>();
  @Output() fetchMessage = new EventEmitter<QueueModel>();
  @ViewChild('dragPreviewTemplate', { static: true }) dragPreviewTemplate!: ElementRef;
  dataSource = new TableVirtualScrollDataSource<MessageModel>(this.messages);
  dateControl = new FormControl();
  columnsToDisplay = ['checkbox', 'message_count', 'messageType', 'messageId', 'correlationId', 'conversationId', 'sentTime'];
  columnsToDisplayWithExpand = [...this.columnsToDisplay, 'expand'];
  expandedMessage!: MessageModel | null;
  lastClickedIndex: number | null = null;
  lastSelectedIndex: number | null = null;

  @ViewChild(MatSort) sort!: MatSort;

  constructor(private datePipe: DatePipe, private toastr: ToastrService) { }

  /** Whenever the 'messages' data changes, update the table data accordingly and sort it. */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['messages'] && changes['messages'].currentValue) {
      this.dataSource.data = changes['messages'].currentValue;
      this.dataSource.data.sort((a, b) => a.message_count - b.message_count);
      this.dataSource.sort = this.sort;
    }
  }

  /** Filter messages according to date filter */
  filterMessages(reset: boolean) {
    // Reset selection
    this.selection.clear();

    let startDate = this.dateControl.value[0];
    let endDate = this.dateControl.value[1];
    if (reset) {
      startDate = null;
      endDate = null;
      this.dateControl.reset();
    }

    if (startDate && endDate) {
      this.dataSource.data = this.messages.filter(message => {
        const messageDate = new Date(this.getPropertyFromPayload(message,
          'sentTime'));
        return messageDate >= startDate && messageDate <= endDate;
      });
    } else {
      // If no date range is selected, show all original messages
      this.dataSource.data = this.messages;
    }
  }

  testJSON(json: string) {
    try {
      const parsed = JSON.parse(json)
      if (parsed && typeof parsed === "object") {
        return true
      }
    } catch { return false }
    return false
  }

  /** Format ISO 8601 to human readable */
  formatSentTime(sentTime?: string): string {
    let x = sentTime === 'N/A' ? 'N/A' : this.datePipe.transform(sentTime, 'dd/MM/yyyy HH:mm:ss')!;
    return x;
  }

  getPropertyFromPayload(message: MessageModel, property: string): any {
    // Check if payload is valid JSON
    if (this.testJSON(message.payload)) {
      try {
        const payloadObj = JSON.parse(message.payload);
        const propertyValue = payloadObj[property];
        if (property === 'messageType' && Array.isArray(propertyValue) && propertyValue.length > 0) {
          return propertyValue[0]; // Return the first element of the array for 'messageType'
        }
        if (property === 'sentTime') {
          return propertyValue;
        }
        if (this.columnsToDisplay.includes(property)) {
          return propertyValue;
        }
        else return 'N/A';
      } catch (error) {
        console.error('Error parsing payload:', error);
      }
    }
    return 'N/A'; // Return default value if payload is not valid JSON or property is not present
  }

  deleteMessages() {
    this.deleteMessagesEvent.emit();
  }

  fetchMessages() {
    try {

      console.log('Fetching messages...');

      this.fetchMessage.emit({ vhostName: this.currentSelectedQueue!.vhostName, name: this.currentSelectedQueue!.name });

      this.selection.clear();
      
    } catch (error) {
      this.toastr.error('Something went wrong when fetching messages.')
    }
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  toggleAllRows() {
    if (this.isAllSelected()) {
      this.selection.clear();
    } else {
      this.dataSource.data.forEach(row => this.selection.select(row));
    }
  }

  onCheckboxClick(event: MouseEvent, row: MessageModel) {
    const index = this.dataSource.data.indexOf(row);

    if (event.shiftKey) {
      if (this.lastClickedIndex === null) {
        this.selectRange(row);
      } else {
        const start = Math.min(this.lastClickedIndex, index);
        const end = Math.max(this.lastClickedIndex, index);
        this.selection.clear();
        for (let i = start; i <= end; i++) {
          this.selection.select(this.dataSource.data[i]);
        }
      }
    } else {
      this.lastClickedIndex = index;
      this.selection.toggle(row);
    }
  }

  selectRange(row: MessageModel) {
    const index = this.dataSource.data.indexOf(row);
    if (index !== -1) {
      this.selection.clear();
      for (let i = 0; i <= index; i++) {
        this.selection.select(this.dataSource.data[i]);
      }
    }
  }

  /** Triggered when starting to drag a message row. */
  onDragStart(event: DragEvent, draggedObject: MessageModel) {
    this.selection.select(draggedObject);
    const preview = this.dragPreviewTemplate.nativeElement;
    preview.style.display = 'block'; // Show the drag preview

    if (event.dataTransfer) {
      event.dataTransfer.setDragImage(preview, -15, 0);
    }
  }

  onDragEnd(event: DragEvent) {
    const preview = this.dragPreviewTemplate.nativeElement;
    preview.style.display = 'none'; // Hide the drag preview
  }
}

export { MessageModel };
