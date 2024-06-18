import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { forkJoin, map, mergeMap, Observable, repeat, Subject, take, takeUntil } from "rxjs";
import { Md5 } from "ts-md5";
import { ConnectionModel } from "../../shared/models/connection.model";
import { ConnectionService } from "../../shared/services/connection.service";
import { Ackmode } from "../models/ackmode.enum";
import { MessageModel } from "../models/message.model";
import { MessagesActionProgressModel } from "../models/messages-action-progress.model";
import { MessagesActionStatus } from "../models/messages-action-status.enum";
import { PublishResponseModel } from "../models/publish-response.model";
import { QueueModel } from "../models/queue.model";
import { VhostModel } from "../models/vhost.model";
import { RefreshService } from "./refresh.service";
import API from "./routes/rabbit-api-routes.json";

/*
Service that accesses the RabbitMQ API to retrieve information.
*/
@Injectable()
export class RabbitApiService {
    private baseApiUrl: string = "http://localhost:15672";
    private httpOptions!: { headers: HttpHeaders };

    private readonly MOVE_MESSAGES_DELAY = 200;
    private readonly MOVE_MESSAGES_FETCH_COUNT = 10;

    constructor(
        private httpClient: HttpClient,
        private refreshService: RefreshService,
        private connectionService: ConnectionService,
        private md5: Md5
    ) {
        this.updateHttpOptions();
    }

    public updateHttpOptions() {
        const connection: ConnectionModel = this.connectionService.connectionSignal();
        const headers = new HttpHeaders({
            "Authorization": "Basic " + btoa(`${connection.username}:${connection.password}`)
        });

        // Current solution, it should probably change it when adding a connection
        if (connection.host && !connection.host.startsWith("http://") && !connection.host.startsWith("https://")) {
            this.baseApiUrl = "http://" + connection.host;
        } else {
            this.baseApiUrl = connection.host;
        }

        this.httpOptions = { headers: headers }
    }

    /**
     * Retrieves all vhosts
     * @returns Observable to array of VhostModels
     */
    getVhosts(): Observable<VhostModel[]> {
        let url: string = `${this.baseApiUrl}${API.VHOSTS}`;
        let method = this.httpClient.get<VhostModel[]>(url, this.httpOptions);
        return this.refreshService.wrapWithRefreshLogic(method);
    }

    /**
     * Retrieves all queues
     * @returns Observable to array of QueueModel
     */
    getQueues(vhost: string): Observable<QueueModel[]> {
        let url: string = `${this.baseApiUrl}${API.QUEUES}${encodeURIComponent(vhost)}`;
        let method = this.httpClient.get<QueueModel[]>(url, this.httpOptions);
        return this.refreshService.wrapWithRefreshLogic(method);
    }

    /**
     * Retrieves a specific vhost
     * @param name name of the vhost to be retrieved
     * @returns Observable to VhostModel
     */
    getVhost(name: string): Observable<VhostModel> {
        let url: string = `${this.baseApiUrl}${API.VHOSTS}${encodeURIComponent(name)}`;
        let method = this.httpClient.get<VhostModel>(url, this.httpOptions);
        return this.refreshService.wrapWithRefreshLogic(method);
    }

    /**
     * Retrieves all messages of a queue for a given vhost and queue
     * @param vhost name of the vhost to retrieve messages from
     * @param queue name of the queue to retrieve messages from
     * @param count how many messages to retrieve
     * @param ackmode how to acknowledge the retrieved messages
     * @returns Observable to array of MessageModels
     */
    getMessages(vhost: string, queue: string, count: number = -1, ackmode: Ackmode = Ackmode.NACK_AND_REQUEUE): Observable<MessageModel[]> {
        let url: string = `${this.baseApiUrl}${API.QUEUES}${encodeURIComponent(vhost)}/${encodeURIComponent(queue)}/get`;
        let body = {
            "count": count,
            "ackmode": ackmode,
            "encoding": "auto",
            "truncate": 50000
        };
        return this.httpClient.post<MessageModel[]>(url, body, this.httpOptions);
    }

    /**
     * Retrieves all messages of a queue for a given vhost and queue, and attach logic for refreshing to it
     * @param vhost name of the vhost to retrieve messages from
     * @param queue name of the queue to retrieve messages from
     * @param count how many messages to retrieve
     * @param ackmode how to acknowledge the retrieved messages
     * @returns Observable to array of MessageModels with refresh logic
     * 
     * use for count a big number to retrieve all messages
     */
    getMessagesWithRefresh(vhost: string, queue: string, count: number = -1, ackmode: Ackmode = Ackmode.NACK_AND_REQUEUE): Observable<MessageModel[]> {
        return this.refreshService.wrapWithRefreshLogic(this.getMessages(vhost, queue, count, ackmode));
    }

    getVhostsAndQueuesWithRefresh(): Observable<VhostModel[]> {
        return this.refreshService.wrapWithRefreshLogic(
            this.getVhosts().pipe(
                mergeMap(vhosts => forkJoin(
                    vhosts.map(v => this.getQueues(v.name).pipe(
                        map(queues => {
                            // Create an array of QueueModel instances
                            const queueModels = queues.map(queue => ({
                                vhostName: v.name,
                                name: queue.name,
                                messages: queue.messages
                            }));

                            v.queues = queueModels;

                            return v;
                        }), take(1)
                    ))
                ))
            ));
    }

    publishMessage(message: MessageModel, targetQueue: QueueModel) {
        let url: string = `${this.baseApiUrl}${API.EXCHANGES}${encodeURIComponent(targetQueue.vhostName)}/${encodeURIComponent("amq.default")}/publish`;
        let body = {
            "properties": message.properties,
            "routing_key": targetQueue.name,
            "payload": message.payload,
            "payload_encoding": message.payload_encoding
        };
        return this.httpClient.post<PublishResponseModel>(url, body, this.httpOptions);
    }

    deleteMessages(sourceQueue: QueueModel, messages: MessageModel[]): Observable<MessagesActionProgressModel> {
        // Creates a mapping from a message hash to the number of messages with that same hash
        let map: Map<string, number> = new Map();
        messages.forEach(message => {
            let messageHash: string = this.hashMessage(message);
            if (map.get(messageHash)) {
                let messageCount = map.get(messageHash);
                map.set(messageHash, messageCount! + 1);
            } else {
                map.set(messageHash, 1);
            }
        });

        let stopOperationNotifier: Subject<void> = new Subject();
        let progressNotifier: Subject<MessagesActionProgressModel> = new Subject();

        let amountOfMessagesDeleted: number = 0;
        let amountOfMessagesToDelete: number = messages.length;
        progressNotifier.next(new MessagesActionProgressModel(MessagesActionStatus.IN_PROGRESS, stopOperationNotifier, amountOfMessagesDeleted, amountOfMessagesToDelete));

        // Fetches messages from the source queue and checks if they need to be deleted
        this.getMessages(sourceQueue.vhostName, sourceQueue.name, this.MOVE_MESSAGES_FETCH_COUNT, Ackmode.REJECT).pipe(
            repeat({ delay: this.MOVE_MESSAGES_DELAY }),
            takeUntil(stopOperationNotifier)
        ).subscribe((fetchedMessages) => {
            fetchedMessages.forEach(fetchedMessage => {
                let messageHash: string = this.hashMessage(fetchedMessage);
                // Message should be deleted
                if (map.get(messageHash)) {
                    let messageCount = map.get(messageHash)!;
                    if (messageCount > 1) {
                        map.set(messageHash, messageCount! - 1);
                    } else {
                        map.delete(messageHash);
                    }
                    amountOfMessagesDeleted++;
                } else {
                    // Requeue the message if it doesn't need to be deleted
                    this.publishMessage(fetchedMessage, sourceQueue).subscribe();
                }
                progressNotifier.next(new MessagesActionProgressModel(MessagesActionStatus.IN_PROGRESS, stopOperationNotifier, amountOfMessagesDeleted, amountOfMessagesToDelete));
            });
            // All specified messages have been deleted from the queue
            if (map.size === 0) {
                progressNotifier.next(new MessagesActionProgressModel(MessagesActionStatus.FINISHED, stopOperationNotifier, amountOfMessagesDeleted, amountOfMessagesToDelete));
                stopOperationNotifier.next();
            }
        });

        return progressNotifier.pipe(takeUntil(stopOperationNotifier));
    }


    moveMessages(sourceQueue: QueueModel, targetQueue: QueueModel, messages: MessageModel[]): Observable<MessagesActionProgressModel> {
        // Creates a mapping from a message hash to the number of messages with that same hash
        let map: Map<string, number> = new Map();
        messages.forEach(message => {
            let messageHash: string = this.hashMessage(message);
            if (map.get(messageHash)) {
                let messageCount = map.get(messageHash);
                map.set(messageHash, messageCount! + 1);
            }
            else {
                map.set(messageHash, 1);
            }
        });

        let stopOperationNotifier: Subject<void> = new Subject();
        let progressNotifier: Subject<MessagesActionProgressModel> = new Subject();

        let amountOfMessagesMoved: number = 0;
        let amountOfMessagesToMove: number = messages.length;
        progressNotifier.next(new MessagesActionProgressModel(MessagesActionStatus.IN_PROGRESS, stopOperationNotifier, amountOfMessagesMoved, amountOfMessagesToMove))

        // Fetches messages from the source queue and check if they need to be moved to the target queue or be requeued to the source queue
        this.getMessages(sourceQueue.vhostName, sourceQueue.name, this.MOVE_MESSAGES_FETCH_COUNT, Ackmode.AUTOMATIC_ACK).pipe(repeat({ delay: this.MOVE_MESSAGES_DELAY })).pipe(takeUntil(stopOperationNotifier)).subscribe((fetchedMessages) => {
            fetchedMessages.forEach(fetchedMessage => {
                let messageHash: string = this.hashMessage(fetchedMessage);
                // Message should be moved to the target queue
                if (map.get(messageHash)) {
                    let messageCount = map.get(messageHash)!;
                    if (messageCount > 1) {
                        map.set(messageHash, messageCount! - 1);
                    }
                    else {
                        map.delete(messageHash);
                    }
                    amountOfMessagesMoved++;
                    this.publishMessage(fetchedMessage, targetQueue).subscribe();
                }
                // Message should be requeued to the source queue
                else {
                    this.publishMessage(fetchedMessage, sourceQueue).subscribe();
                }
                progressNotifier.next(new MessagesActionProgressModel(MessagesActionStatus.IN_PROGRESS, stopOperationNotifier, amountOfMessagesMoved, amountOfMessagesToMove))
            });
            // All selected messages have been moved to the target queue
            if (map.size == 0) {
                progressNotifier.next(new MessagesActionProgressModel(MessagesActionStatus.FINISHED, stopOperationNotifier, amountOfMessagesMoved, amountOfMessagesToMove))
                stopOperationNotifier.next();
            }
        });

        return progressNotifier.pipe(takeUntil(stopOperationNotifier));
    }

    private hashMessage(message: MessageModel): string {
        const replacer = (key: string, value: any) => {
            switch (key) {
                case "redelivered":
                    return "";

                case "message_count":
                    return "";

                default:
                    return value;

            }
        }
        return Md5.hashStr(JSON.stringify(message, replacer));
    }
}
