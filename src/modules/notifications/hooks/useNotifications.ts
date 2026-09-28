import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAppSelector } from "@/src/store/hook";
import {
    getNotifications,
    markAllNotificationsAsRead,
    markNotificationAsRead,
} from "../services/notificationService";
import type { Notification } from "../types/notification";
import type { UserRole } from "@/src/store/type";

export const notificationsQueryKey = (userId?: string | null, role?: UserRole | null) =>
    ["notifications", userId ?? null, role ?? null] as const;

type MarkNotificationReadVariables = {
    notificationId: string;
    userId: string;
    role: UserRole;
};

type UserNotificationScope = { userId: string; role: UserRole };

export function useNotifications(enabled = true) {
    const user = useAppSelector((state) => state.auth.user);
    const userId = user?.id;

    return useQuery({
        queryKey: notificationsQueryKey(userId, user?.role),
        queryFn: getNotifications,
        enabled: enabled && Boolean(userId),
    });
}

export function useMarkNotificationAsRead() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ notificationId }: MarkNotificationReadVariables) =>
            markNotificationAsRead(notificationId),
        onSuccess: (updatedNotification, { userId, role }) => {
            queryClient.setQueryData<Notification[]>(notificationsQueryKey(userId, role), (current) =>
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
        mutationFn: (scope: UserNotificationScope) => {
            // The API scopes this operation from the auth cookie; carry the ID
            // through as the cache key to update only the initiating user's data.
            void scope;
            return markAllNotificationsAsRead();
        },
        onSuccess: (_result, { userId, role }) => {
            queryClient.setQueryData<Notification[]>(notificationsQueryKey(userId, role), (current) =>
                current?.map((notification) => ({ ...notification, isRead: true })),
            );
        },
    });
}
