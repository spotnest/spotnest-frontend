import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    getNotifications,
    markAllNotificationsAsRead,
    markNotificationAsRead,
} from "../services/notificationService";
import type { Notification } from "../types/notification";

export const notificationsQueryKey = ["notifications"] as const;

export function useNotifications(enabled = true) {
    return useQuery({
        queryKey: notificationsQueryKey,
        queryFn: getNotifications,
        enabled,
    });
}

export function useMarkNotificationAsRead() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: markNotificationAsRead,
        onSuccess: (updatedNotification) => {
            queryClient.setQueryData<Notification[]>(notificationsQueryKey, (current) =>
                current?.map((notification) =>
                    notification.id === updatedNotification.id
                        ? { ...notification, ...updatedNotification, isRead: true }
                        : notification,
                ),
            );
        },
    });
}

export function useMarkAllNotificationsAsRead() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: markAllNotificationsAsRead,
        onSuccess: () => {
            queryClient.setQueryData<Notification[]>(notificationsQueryKey, (current) =>
                current?.map((notification) => ({ ...notification, isRead: true })),
            );
        },
    });
}
