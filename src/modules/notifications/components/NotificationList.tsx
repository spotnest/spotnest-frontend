import type { Notification } from "../types/notification";
import { NotificationItem } from "./NotificationItem";

interface NotificationListProps {
    notifications: Notification[];
    onNotificationClick: (notification: Notification) => void;
    compact?: boolean;
}

export function NotificationList({ notifications, onNotificationClick, compact }: NotificationListProps) {
    if (notifications.length === 0) {
        return <div className="px-5 py-10 text-center"><p className="text-sm font-semibold text-[#191c1d]">You&apos;re all caught up</p><p className="mt-1 text-xs text-[#75777e]">New activity will appear here.</p></div>;
    }

    return <div className="divide-y divide-[#e1e3e4]">{notifications.map((notification) => <NotificationItem key={notification.id} notification={notification} onClick={onNotificationClick} compact={compact} />)}</div>;
}
