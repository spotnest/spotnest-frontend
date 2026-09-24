"use client";

import { useRouter } from "next/navigation";
import { useMarkAllNotificationsAsRead, useMarkNotificationAsRead, useNotifications } from "../hooks/useNotifications";
import type { Notification } from "../types/notification";
import { NotificationList } from "./NotificationList";

export function NotificationsPage() {
    const router = useRouter();
    const notificationsQuery = useNotifications();
    const markRead = useMarkNotificationAsRead();
    const markAllRead = useMarkAllNotificationsAsRead();
    const notifications = notificationsQuery.data ?? [];
    const unreadCount = notifications.filter((notification) => !notification.isRead).length;

    const handleNotificationClick = (notification: Notification) => {
        if (!notification.isRead) markRead.mutate(notification.id);
        if (notification.targetUrl) router.push(notification.targetUrl);
    };

    return <main className="mx-auto max-w-3xl px-4 py-7 sm:px-6 sm:py-9 lg:px-10"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm font-semibold text-[#00696b]">Activity</p><h1 className="mt-2 text-3xl font-bold tracking-[-0.04em] text-[#191c1d]">Notifications</h1><p className="mt-2 text-sm text-[#44474d]">Updates about your SpotNest account and activity.</p></div>{unreadCount > 0 && <button type="button" disabled={markAllRead.isPending} onClick={() => markAllRead.mutate()} className="rounded-full border border-[#00696b] px-4 py-2 text-sm font-semibold text-[#00696b] hover:bg-[#d9f4f3] disabled:opacity-60">Mark all as read</button>}</div><section className="mt-7 overflow-hidden rounded-2xl border border-[#e1e3e4] bg-white">{notificationsQuery.isLoading ? <div className="px-5 py-12 text-center text-sm text-[#75777e]">Loading notifications...</div> : notificationsQuery.isError ? <div className="px-5 py-12 text-center"><p className="text-sm font-semibold text-[#ba1a1a]">Unable to load notifications.</p><button type="button" onClick={() => notificationsQuery.refetch()} className="mt-2 text-sm font-bold text-[#00696b]">Try again</button></div> : <NotificationList notifications={notifications} onNotificationClick={handleNotificationClick} />}</section></main>;
}
