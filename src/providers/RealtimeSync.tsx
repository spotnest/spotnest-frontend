"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { configureSocketSessionRecovery, getSocket } from "@/src/lib/socket";
import {
    SocketEvents,
    type DashboardUpdatePayload,
    type NotificationNewPayload,
    type NotificationReadPayload,
} from "@/src/lib/socketEvents";
import { useAppDispatch, useAppSelector } from "@/src/store/hook";
import { userUpdated } from "@/src/store/slices/authSlice";
import { getCurrentUser } from "@/src/modules/auth/services/authServices";
import { chatKeys } from "@/src/modules/chat/hooks/useChat";
import {
    notificationsQueryKey,
    unreadNotificationCountQueryKey,
} from "@/src/modules/notifications/hooks/useNotifications";
import type { Notification } from "@/src/modules/notifications/types/notification";
import {
    allRealtimeDashboardKeys,
    queryKeysForDashboardScope,
} from "@/src/modules/dashboard/constants/realtimeQueryKeys";

const NOTIFICATION_CACHE_LIMIT = 20;

/**
 * The single place that subscribes to app-wide socket events. Mounted once
 * for the authenticated session (see AuthProvider), so listeners are never
 * duplicated by re-renders or by components that appear twice on a page.
 *
 * Socket events only carry *what* changed; numbers shown on dashboards always
 * come from the REST APIs through TanStack Query.
 */
export function RealtimeSync() {
    const queryClient = useQueryClient();
    const dispatch = useAppDispatch();
    const userId = useAppSelector((state) => state.auth.user?.id);
    const role = useAppSelector((state) => state.auth.user?.role);

    // Session renewal used by the socket client after an auth rejection: an
    // authenticated request lets the axios interceptor refresh the cookie
    // (with its single-flight queue), and keeps the Redux user current.
    useEffect(() => {
        configureSocketSessionRecovery(async () => {
            const { user } = await getCurrentUser();
            if (user) dispatch(userUpdated(user));
        });
        return () => configureSocketSessionRecovery(null);
    }, [dispatch]);

    useEffect(() => {
        if (!userId || !role) return;
        const socket = getSocket();
        const listKey = notificationsQueryKey(userId, role);
        const countKey = unreadNotificationCountQueryKey(userId, role);
        let hasConnected = socket.connected;

        const refreshSessionUser = async () => {
            try {
                const { user } = await getCurrentUser();
                if (user) dispatch(userUpdated(user));
            } catch {
                // The axios interceptor signs the user out if the session is gone.
            }
        };

        const onNotification = (notification: NotificationNewPayload) => {
            let isNew = true;
            queryClient.setQueryData<Notification[]>(listKey, (current) => {
                if (!current) return current; // Not loaded yet: the first fetch includes it.
                const index = current.findIndex((item) => item.id === notification.id);
                if (index >= 0) {
                    // Chat notifications are upserted per conversation and
                    // re-sent with the same id: move it to the top.
                    isNew = !current[index]!.isRead;
                    return [notification, ...current.filter((item) => item.id !== notification.id)];
                }
                return [notification, ...current].slice(0, NOTIFICATION_CACHE_LIMIT);
            });
            if (isNew && !notification.isRead) {
                queryClient.setQueryData<number>(countKey, (count) => (count === undefined ? count : count + 1));
            }
            // Reconcile with the server (handles role-filtered types and
            // updated chat notifications) without blocking the instant update.
            void queryClient.invalidateQueries({ queryKey: countKey });
            if (notification.data?.conversationId) {
                void queryClient.invalidateQueries({ queryKey: chatKeys.conversations(userId, role) });
            }
        };

        const onNotificationRead = (payload: NotificationReadPayload) => {
            queryClient.setQueryData<number>(countKey, payload.unreadCount);
            queryClient.setQueryData<Notification[]>(listKey, (current) =>
                current?.map((item) => {
                    const matches =
                        payload.all ||
                        item.id === payload.notificationId ||
                        (payload.conversationId !== undefined && item.data?.conversationId === payload.conversationId);
                    return matches ? { ...item, isRead: true } : item;
                }),
            );
        };

        const onDashboardUpdate = (payload: DashboardUpdatePayload) => {
            for (const queryKey of queryKeysForDashboardScope[payload.scope] ?? []) {
                void queryClient.invalidateQueries({ queryKey });
            }
            // Role/verification changes for this user (e.g. becoming a tenant
            // after the advance payment, owner approval) unlock other pages.
            if (payload.scope === "user" && payload.entityId === userId &&
                (payload.action === "role_changed" || payload.action === "verification_changed")) {
                void refreshSessionUser();
            }
        };

        // After a reconnect, events emitted while offline were missed: refetch
        // the persisted state instead of replaying events (no duplicates).
        const onConnect = () => {
            if (!hasConnected) {
                hasConnected = true;
                return;
            }
            void queryClient.invalidateQueries({ queryKey: listKey });
            void queryClient.invalidateQueries({ queryKey: countKey });
            void queryClient.invalidateQueries({ queryKey: chatKeys.conversations(userId, role) });
            for (const queryKey of allRealtimeDashboardKeys) {
                void queryClient.invalidateQueries({ queryKey });
            }
        };

        socket.on(SocketEvents.NOTIFICATION_NEW, onNotification);
        socket.on(SocketEvents.NOTIFICATION_READ, onNotificationRead);
        socket.on(SocketEvents.DASHBOARD_UPDATE, onDashboardUpdate);
        socket.on("connect", onConnect);
        return () => {
            socket.off(SocketEvents.NOTIFICATION_NEW, onNotification);
            socket.off(SocketEvents.NOTIFICATION_READ, onNotificationRead);
            socket.off(SocketEvents.DASHBOARD_UPDATE, onDashboardUpdate);
            socket.off("connect", onConnect);
        };
    }, [dispatch, queryClient, role, userId]);

    return null;
}
