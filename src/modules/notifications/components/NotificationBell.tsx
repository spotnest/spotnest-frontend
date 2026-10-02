"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useAppSelector } from "@/src/store/hook";
import { getSocket } from "@/src/lib/socket";
import { chatKeys } from "@/src/modules/chat/hooks/useChat";
import { Icon } from "@/src/modules/dashboard/components/Icon";
import { notificationsQueryKey, unreadNotificationCountQueryKey, useMarkAllNotificationsAsRead, useMarkNotificationAsRead, useNotifications, useUnreadNotificationCount } from "../hooks/useNotifications";
import type { Notification } from "../types/notification";
import { NotificationList } from "./NotificationList";

export function NotificationBell() {
    const [open, setOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const queryClient = useQueryClient();
    const notificationsQuery = useNotifications();
    const unreadCountQuery = useUnreadNotificationCount();
    const markRead = useMarkNotificationAsRead();
    const markAllRead = useMarkAllNotificationsAsRead();
    const user = useAppSelector((state) => state.auth.user);
    const userId = user?.id;
    const notifications = notificationsQuery.data ?? [];
    const unreadCount = unreadCountQuery.data ?? notifications.filter((notification) => !notification.isRead).length;

    useEffect(() => {
        if (!userId || !user?.role) return;
        const socket = getSocket();
        const onNotification = (notification: Notification) => {
            queryClient.setQueryData<Notification[]>(notificationsQueryKey(userId, user.role), (current) => {
                if (!current) return [notification];
                const existingIndex = current.findIndex((item) => item.id === notification.id);
                if (existingIndex >= 0) {
                    return current.map((item) => item.id === notification.id ? notification : item);
                }
                return [notification, ...current].slice(0, 20);
            });
            void queryClient.invalidateQueries({ queryKey: unreadNotificationCountQueryKey(userId, user.role) });
            if (notification.data?.conversationId) {
                void queryClient.invalidateQueries({ queryKey: chatKeys.conversations(userId, user.role) });
            }
        };
        socket.on("notification:new", onNotification);
        return () => {
            socket.off("notification:new", onNotification);
        };
    }, [queryClient, user?.role, userId]);

    useEffect(() => {
        const closeOnOutsideClick = (event: MouseEvent) => {
            if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
        };
        const closeOnEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape") setOpen(false);
        };
        document.addEventListener("mousedown", closeOnOutsideClick);
        document.addEventListener("keydown", closeOnEscape);
        return () => {
            document.removeEventListener("mousedown", closeOnOutsideClick);
            document.removeEventListener("keydown", closeOnEscape);
        };
    }, []);

    const handleNotificationClick = (notification: Notification) => {
        if (!notification.isRead && userId) {
            if (user?.role) markRead.mutate({ notificationId: notification.id, userId, role: user.role });
        }
        setOpen(false);
        if (notification.targetUrl) router.push(notification.targetUrl);
    };

    return <div className="relative" ref={containerRef}>
        <button type="button" aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ""}`} aria-expanded={open} onClick={() => setOpen((value) => !value)} className="relative grid h-10 w-10 place-items-center rounded-full border border-[#e1e3e4] bg-white text-[#44474d] transition hover:bg-[#f3f4f5]">
            <Icon name="bell" className="h-[18px] w-[18px]" />
            {unreadCount > 0 && <span className="absolute -right-1 -top-1 grid min-h-4 min-w-4 place-items-center rounded-full bg-[#00696b] px-1 text-[10px] font-bold text-white">{unreadCount > 99 ? "99+" : unreadCount}</span>}
        </button>

        {open && <section aria-label="Notifications" className="absolute right-0 top-12 z-50 w-[calc(100vw-2rem)] max-w-[380px] overflow-hidden rounded-2xl border border-[#e1e3e4] bg-white shadow-lg">
            <header className="flex items-center justify-between border-b border-[#e1e3e4] px-4 py-3"><div><h2 className="text-sm font-bold text-[#191c1d]">Notifications</h2><p className="text-[11px] text-[#75777e]">{unreadCount ? `${unreadCount} unread` : "All caught up"}</p></div>{unreadCount > 0 && <button type="button" disabled={markAllRead.isPending} onClick={() => { if (userId && user?.role) markAllRead.mutate({ userId, role: user.role }); }} className="text-xs font-bold text-[#00696b] hover:text-[#004f51] disabled:opacity-60">Mark all read</button>}</header>
            <div className="max-h-[min(28rem,calc(100vh-10rem))] overflow-y-auto">{notificationsQuery.isLoading ? <div className="px-5 py-10 text-center text-sm text-[#75777e]">Loading notifications...</div> : notificationsQuery.isError ? <div className="px-5 py-10 text-center"><p className="text-sm font-semibold text-[#ba1a1a]">Unable to load notifications.</p><button type="button" onClick={() => notificationsQuery.refetch()} className="mt-2 text-xs font-bold text-[#00696b]">Try again</button></div> : <NotificationList notifications={notifications.slice(0, 8)} onNotificationClick={handleNotificationClick} compact />}</div>
        </section>}
    </div>;
}
