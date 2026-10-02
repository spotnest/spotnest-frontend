export type ChatRole = "tenant" | "owner";
export type ChatAccountRole = ChatRole | "user";

export interface ChatConversation {
    id: string;
    property: { id: string; title: string; image?: string };
    counterpart: { id: string; name: string; image?: string; role: ChatRole };
    lastMessage?: string;
    lastMessageAt?: string;
    unreadCount: number;
    createdAt: string;
}

export interface ChatMessage {
    id: string;
    conversationId: string;
    senderId: string;
    recipientId: string;
    message: string;
    isRead: boolean;
    createdAt: string;
}
