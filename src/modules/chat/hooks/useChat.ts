"use client";
import { useEffect } from "react";
import { isAxiosError } from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAppSelector } from "@/src/store/hook";
import { getSocket } from "@/src/lib/socket";
import { notificationsQueryKey, unreadNotificationCountQueryKey } from "@/src/modules/notifications/hooks/useNotifications";
import { createConversation, getConversations, getMessages, markMessagesAsRead, sendMessage as postMessage } from "../services/chatService";
import type { ChatAccountRole, ChatConversation, ChatMessage } from "../types/chat";

export const chatKeys = {
    conversations: (userId?: string | null, role?: string | null) => ["chat", "conversations", userId ?? null, role ?? null] as const,
    messages: (userId?: string | null, role?: string | null, conversationId?: string | null) => ["chat", "messages", userId ?? null, role ?? null, conversationId ?? null] as const,
};

const isChatRole = (role: string | undefined): role is ChatAccountRole => role === "tenant" || role === "owner" || role === "user";

/* ---------- REST: initial load only ---------- */

export function useConversations(enabled = true, pollForUnread = false) {
    const user = useAppSelector((state) => state.auth.user);
    return useQuery({
        queryKey: chatKeys.conversations(user?.id, user?.role),
        queryFn: getConversations,
        enabled: enabled && Boolean(user?.id) && isChatRole(user?.role),
        refetchInterval: pollForUnread ? 30_000 : false,
    });
}

export function useMessages(conversationId?: string) {
    const user = useAppSelector((state) => state.auth.user);
    return useQuery({
        queryKey: chatKeys.messages(user?.id, user?.role, conversationId),
        queryFn: () => getMessages(conversationId!),
        enabled: Boolean(user?.id) && isChatRole(user?.role) && Boolean(conversationId),
    });
}

export function useCreateConversation() {
    const client = useQueryClient();
    return useMutation({
        mutationFn: createConversation,
        onSuccess: () => client.invalidateQueries({ queryKey: ["chat", "conversations"] }),
    });
}

export function useMarkMessagesAsRead(conversationId: string) {
    const user = useAppSelector((state) => state.auth.user);
    const client = useQueryClient();
    return useMutation({
        mutationFn: () => markMessagesAsRead(conversationId),
        onSuccess: () => {
            void client.invalidateQueries({ queryKey: chatKeys.conversations(user?.id, user?.role) });
            void client.invalidateQueries({ queryKey: notificationsQueryKey(user?.id, user?.role) });
            void client.invalidateQueries({ queryKey: unreadNotificationCountQueryKey(user?.id, user?.role) });
        },
    });
}

export function useSendMessage(conversationId: string) {
    const user = useAppSelector((state) => state.auth.user);
    const client = useQueryClient();
    return useMutation({
        mutationFn: (message: string) => postMessage(conversationId, message),
        onSuccess: () => {
            void client.invalidateQueries({
                queryKey: chatKeys.messages(user?.id, user?.role, conversationId),
            });
            void client.invalidateQueries({
                queryKey: chatKeys.conversations(user?.id, user?.role),
            });
        },
        onError: (error: unknown) => {
            if (isAxiosError(error)) {
                console.error("Failed to send chat message", {
                    status: error.response?.status,
                    data: error.response?.data,
                });
                return;
            }
            console.error("Failed to send chat message", error);
        },
    });
}

/* ---------- Socket: receive only ---------- */

type IncomingMessage = ChatMessage & { conversationId: string };

export function useChatSocket(enabled: boolean, activeConversationId?: string) {
    const queryClient = useQueryClient();
    const user = useAppSelector((state) => state.auth.user);
    const userId = user?.id;
    const role = user?.role;

    // incoming messages
    useEffect(() => {
        if (!enabled || !userId) return;
        const socket = getSocket();

        const onNew = (msg: IncomingMessage) => {
            const isActive = msg.conversationId === activeConversationId;
            const isMine = msg.senderId === userId;

            // message list
            queryClient.setQueryData<ChatMessage[]>(
                chatKeys.messages(userId, role, msg.conversationId),
                (old) => (!old || old.some((m) => m.id === msg.id) ? old : [...old, msg])
            );

            // conversation list
            let found = false;
            queryClient.setQueryData<ChatConversation[]>(
                chatKeys.conversations(userId, role),
                (old) => {
                    if (!old) return old;
                    return old
                        .map((c) => {
                            if (c.id !== msg.conversationId) return c;
                            found = true;
                            return {
                                ...c,
                                lastMessage: msg.message,
                                lastMessageAt: msg.createdAt,
                                unreadCount: isActive || isMine ? c.unreadCount : c.unreadCount + 1,
                            };
                        })
                        .sort((a, b) => +new Date(b.lastMessageAt ?? 0) - +new Date(a.lastMessageAt ?? 0));
                }
            );
            if (!found) {
                void queryClient.invalidateQueries({ queryKey: chatKeys.conversations(userId, role) });
            }

            // open conversation-il vanna message → server-il read aakkuka
            if (isActive && !isMine) void markMessagesAsRead(msg.conversationId);
        };

        socket.on("new_message", onNew);
        return () => {
            socket.off("new_message", onNew);
        };
    }, [enabled, userId, role, activeConversationId, queryClient]);

    // join / leave active conversation room
    useEffect(() => {
        if (!enabled || !userId || !activeConversationId) return;
        const socket = getSocket();
        const join = () => socket.emit("conversation:join", activeConversationId);
        if (socket.connected) join();
        socket.on("connect", join);
        return () => {
            socket.off("connect", join);
            if (socket.connected) socket.emit("conversation:leave", activeConversationId);
        };
    }, [enabled, userId, activeConversationId]);
}