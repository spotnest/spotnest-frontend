import type { Notification } from "@/src/modules/notifications/types/notification";

/**
 * Mirrors spotnest-backend/src/shared/socket/events.ts. Keep the two in sync.
 */
export const SocketEvents = {
    NOTIFICATION_NEW: "notification:new",
    NOTIFICATION_READ: "notification:read",
    DASHBOARD_UPDATE: "dashboard:update",
    SESSION_EXPIRED: "session:expired",
    CHAT_NEW_MESSAGE: "new_message",
    CONVERSATION_JOIN: "conversation:join",
    CONVERSATION_LEAVE: "conversation:leave",
} as const;

export type NotificationNewPayload = Notification;

export interface NotificationReadPayload {
    notificationId?: string;
    conversationId?: string;
    all?: boolean;
    unreadCount: number;
}

export type DashboardScope = "booking" | "rental" | "payment" | "property" | "user" | "maintenance";

export type DashboardAction =
    | "created"
    | "approved"
    | "rejected"
    | "status_changed"
    | "agreement_accepted"
    | "agreement_confirmed"
    | "split_updated"
    | "terminated"
    | "paid"
    | "failed"
    | "overdue"
    | "role_changed"
    | "verification_changed";

export interface DashboardUpdatePayload {
    scope: DashboardScope;
    action: DashboardAction;
    entityId?: string;
    occurredAt: string;
}
