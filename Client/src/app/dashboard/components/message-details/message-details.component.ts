import { DatePipe } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MessagePropertiesModel } from '../../models/message-properties.model';
import { MessageModel } from '../../models/message.model';

@Component({
  selector: 'app-message-details',
  templateUrl: './message-details.component.html',
  styleUrl: './message-details.component.scss'
})
export class MessageDetailsComponent {
  @Input() message?: MessageModel;

  constructor(private datePipe: DatePipe) { }

  /** Returns an array of keys belonging to the given object, else empty array*/
  getObjectKeys(obj: MessagePropertiesModel | undefined): (keyof MessagePropertiesModel)[] {
    return obj ? Object.keys(obj) as (keyof MessagePropertiesModel)[] : [];
  }

  /** Format ISO 8601 to human readable */
  formatSentTime(sentTime?: string): string {
    return this.datePipe.transform(sentTime, 'dd/MM/yyyy HH:mm:ss')!;
  }

}
