import { QueueModel } from "./queue.model";

export interface VhostModel {
    name: string;
    queues: QueueModel[];

    description?: string;
    tags?: string[];
    default_queue_type?: string;
    tracing?: boolean;

    messages?: number;
    messages_ready?: number;
    messages_unacknowledged?: number;


}
