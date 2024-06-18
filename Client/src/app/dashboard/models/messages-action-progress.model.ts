import { Subject } from "rxjs";
import { MessagesActionStatus } from "./messages-action-status.enum";

export class MessagesActionProgressModel {
    constructor(
        public readonly status: MessagesActionStatus,
        private readonly stopOperationNotifier: Subject<void>,
        public readonly amountOfMessagesProcessed: number,
        public readonly amountOfMessagesToProcess: number
    ) { }

    public stopOperation(): void {
        this.stopOperationNotifier.next();
    }
}