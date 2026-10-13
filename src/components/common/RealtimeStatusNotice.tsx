"use client";

import { useSocketStatus } from "@/src/hooks/useSocketStatus";
import { retrySocketConnection } from "@/src/lib/socket";

interface RealtimeStatusNoticeProps {
    className?: string;
}

/**
 * Shown only while live updates are interrupted. Data on the page is still
 * the last persisted state; it is refetched automatically on reconnect.
 */
export function RealtimeStatusNotice({ className = "" }: RealtimeStatusNoticeProps) {
    const status = useSocketStatus();
    if (status !== "reconnecting" && status !== "offline") return null;

    return (
        <div
            role="status"
            aria-live="polite"
            className={`flex items-center justify-between gap-3 rounded-xl border border-[#f1d9b5] bg-[#fff6e8] px-4 py-2.5 text-xs text-[#7a4f12] ${className}`}
        >
            <span className="flex items-center gap-2">
                <span className={`h-2 w-2 shrink-0 rounded-full bg-[#d38b1f] ${status === "reconnecting" ? "animate-pulse" : ""}`} aria-hidden="true" />
                {status === "reconnecting"
                    ? "Live updates paused. Reconnecting…"
                    : "Live updates are offline. Showing the last loaded data."}
            </span>
            {status === "offline" && (
                <button type="button" onClick={retrySocketConnection} className="shrink-0 font-bold text-[#00696b] hover:text-[#004f51]">
                    Retry
                </button>
            )}
        </div>
    );
}
