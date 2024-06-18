export enum Ackmode {
    NACK_AND_REQUEUE = "ack_requeue_true",
    AUTOMATIC_ACK = "ack_requeue_false",
    REJECT_AND_REQUEUE = "reject_requeue_true",
    REJECT = "reject_requeue_false",
}