import api from "@/src/lib/axios";
import type { Notification, NotificationsResponse } from "../types/notification";


const notificationsPath = "/notifications";

export async function getNotifications(): Promise<Notification[]> {
    const response = await api.get<{ data: Notification[] | NotificationsResponse }>(
        notificationsPath,
    );
    const data = response.data.data;

    return Array.isArray(data) ? data : data.notifications;
}

export async function markNotificationAsRead(id: string): Promise<Notification> {
    const response = await api.patch<{ data: Notification }>(
        `${notificationsPath}/${id}/read`,
    );

    return response.data.data;
}

export async function markAllNotificationsAsRead(): Promise<void> {
    await api.patch(`${notificationsPath}/read-all`);
}
