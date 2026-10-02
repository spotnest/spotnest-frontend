import api from "@/src/lib/axios";
import type { ChatConversation, ChatMessage } from "../types/chat";

interface ApiResponse<T> { success: boolean; data: T }

export const getConversations = async (): Promise<ChatConversation[]> =>
    (await api.get<ApiResponse<ChatConversation[]>>("/chat/conversations")).data.data;

export const getMessages = async (conversationId: string): Promise<ChatMessage[]> =>
    (await api.get<ApiResponse<ChatMessage[]>>(`/chat/conversations/${conversationId}/messages`)).data.data;

export const createConversation = async (propertyId: string): Promise<ChatConversation> =>
    (await api.post<ApiResponse<ChatConversation>>("/chat/conversations", { propertyId })).data.data;

export const sendMessage = async (conversationId: string, message: string): Promise<ChatMessage> =>
    (await api.post<ApiResponse<ChatMessage>>(`/chat/conversations/${conversationId}/messages`, { message })).data.data;

export const markMessagesAsRead = async (conversationId: string): Promise<void> => {
    await api.patch(`/chat/conversations/${conversationId}/read`);
};
