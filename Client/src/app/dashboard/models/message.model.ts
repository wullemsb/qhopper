import { MessagePropertiesModel } from "./message-properties.model";

export interface MessageModel {
    redelivered?: boolean;
    exchange?: string;
    routing_key?: string;
    message_count: number;
    properties?: MessagePropertiesModel;

    payload_encoding?: string;
    payload_bytes?: number;
    payload: string;
}