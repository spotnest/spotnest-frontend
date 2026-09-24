import { Icon } from "@/src/modules/dashboard/components/Icon";
import type { Notification } from "../types/notification";
import { formatNotificationTime } from "../utils/formatNotificationTime";

interface NotificationItemProps {
    notification: Notification;
    onClick: (notification: Notification) => void;
    compact?: boolean;
}

export function NotificationItem({ notification, onClick, compact = false }: NotificationItemProps) {
    return (
        <button
            type="button"
            onClick={() => onClick(notification)}
            className={`flex w-full gap-3 px-4 py-3 text-left transition hover:bg-[#f3f4f5] ${notification.isRead ? "bg-white" : "bg-[#d9f4f3]/45"}`}
        >
            <span className={`mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-full ${notification.isRead ? "bg-[#f3f4f5] text-[#75777e]" : "bg-[#d9f4f3] text-[#00696b]"}`}>
                <Icon name={notification.isRead ? "bell" : "inbox"} className="h-4 w-4" />
            </span>
            <span className="min-w-0 flex-1">
                <span className="flex items-start gap-2">
                    <span className="min-w-0 flex-1 truncate text-sm font-semibold text-[#191c1d]">{notification.title}</span>
                    {!notification.isRead && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#00696b]" aria-label="Unread" />}
                </span>
                <span className={`mt-0.5 block text-xs leading-5 text-[#44474d] ${compact ? "line-clamp-2" : ""}`}>{notification.message}</span>
                <span className="mt-1 block text-[11px] font-medium text-[#75777e]">{formatNotificationTime(notification.createdAt)}</span>
            </span>
        </button>
    );
}
