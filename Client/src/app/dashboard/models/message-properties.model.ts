export interface MessagePropertiesModel {
    content_type?: string;
    content_encoding?: string;
    priority?: number;
    correlation_id?: string;
    reply_to?: string;
    expiration?: string;
    message_id?: string;
    timestamp?: number;
    type?: string;
    user_id?: string;
    app_id?: string;
    cluster_id?: string;
    headers?: { [key: string]: HeaderType };
    delivery_mode?: number;
}

type HeaderType = string | number | boolean | Array<HeaderType>;