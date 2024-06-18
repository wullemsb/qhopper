import { Observable } from "rxjs";
import { MessagesActionProgressModel } from "./messages-action-progress.model";

export interface MessagesActionProgressContainerModel {
    initialProgress: MessagesActionProgressModel;
    progressObservable: Observable<MessagesActionProgressModel>;
}