export type NotificationType = "booking" | "property" | "account" | "system" | "payment" | string;

export interface Notification {
    id: string;
    title: string;
    message: string;
    type: NotificationType;
    isRead: boolean;
    createdAt: string;
    targetUrl?: string;
    referenceId?: string;
    referenceType?: "user" | "property" | "conversation" | "visit" | "booking" | "rental" | "payment";
    data?: {
        conversationId?: string;
        propertyId?: string;
        senderId?: string;
        bookingId?: string;
        rentalId?: string;
        paymentId?: string;
        agreementId?: string;
    };
    count?: number;
}

export interface NotificationsResponse {
    notifications: Notification[];
}
