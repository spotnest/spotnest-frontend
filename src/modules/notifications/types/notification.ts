export type NotificationType = "booking" | "property" | "account" | "system" | "payment" | string;

export interface Notification {
    id: string;
    title: string;
    message: string;
    type: NotificationType;
    isRead: boolean;
    createdAt: string;
    targetUrl?: string;
}

export interface NotificationsResponse {
    notifications: Notification[];
}
