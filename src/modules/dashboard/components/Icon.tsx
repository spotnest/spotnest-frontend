import { IconName } from "../types/iconName";

export function Icon({ name, className = "h-5 w-5" }: { name: IconName; className?: string }) {
    const common = { fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

    return (
        <svg aria-hidden="true" className={className} viewBox="0 0 24 24" {...common}>
            {name === "grid" && <><rect x="4" y="4" width="6" height="6" rx="1" /><rect x="14" y="4" width="6" height="6" rx="1" /><rect x="4" y="14" width="6" height="6" rx="1" /><rect x="14" y="14" width="6" height="6" rx="1" /></>}
            {name === "users" && <><path d="M16 20v-1.5a4.5 4.5 0 0 0-4.5-4.5h-3A4.5 4.5 0 0 0 4 18.5V20" /><circle cx="10" cy="7.5" r="3.5" /><path d="M16 4.3a3.5 3.5 0 0 1 0 6.4M20 20v-1.5a4.5 4.5 0 0 0-3-4.25" /></>}
            {name === "home" && <><path d="m3 10 9-7 9 7" /><path d="M5 9v11h14V9M9 20v-6h6v6" /></>}
            {name === "inbox" && <><path d="M4 4h16v16H4z" /><path d="M4 14h4l1.5 2h5L16 14h4M8 8h8" /></>}
            {name === "chart" && <><path d="M4 19V5M4 19h16" /><path d="m7 15 3-4 3 2 5-6" /></>}
            {name === "settings" && <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-1.7 1.7-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1.03 1.56V20h-2.4v-.2a1.7 1.7 0 0 0-1.03-1.56 1.7 1.7 0 0 0-1.88.34l-.06.06-1.7-1.7.06-.06A1.7 1.7 0 0 0 8.4 15a1.7 1.7 0 0 0-1.56-1.03H6v-2.4h.2A1.7 1.7 0 0 0 7.76 10a1.7 1.7 0 0 0-.34-1.88l-.06-.06 1.7-1.7.06.06A1.7 1.7 0 0 0 11 6.08V6h2.4v.2a1.7 1.7 0 0 0 1.03 1.56 1.7 1.7 0 0 0 1.88-.34l.06-.06 1.7 1.7-.06.06A1.7 1.7 0 0 0 17.6 10c.27.62.88 1.03 1.56 1.03h.2v2.4h-.2A1.7 1.7 0 0 0 17.6 15Z" /></>}
            {name === "search" && <><circle cx="10.8" cy="10.8" r="6.3" /><path d="m16 16 4 4" /></>}
            {name === "bell" && <><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" /></>}
            {name === "menu" && <><path d="M4 7h16M4 12h16M4 17h16" /></>}
            {name === "close" && <><path d="m6 6 12 12M18 6 6 18" /></>}
            {name === "arrow" && <><path d="M5 12h14M13 6l6 6-6 6" /></>}
            {name === "plus" && <><path d="M12 5v14M5 12h14" /></>}
            {name === "chevron" && <path d="m7 10 5 5 5-5" />}
            {name === "check" && <path d="m5 12 4 4L19 6" />}
            {name === "clock" && <><circle cx="12" cy="12" r="8" /><path d="M12 7v5l3 2" /></>}
            {name === "alert" && <><path d="m12 4 9 16H3L12 4Z" /><path d="M12 9v4M12 17h.01" /></>}
            {name === "logout" && <><path d="M10 17l5-5-5-5M15 12H3M21 19V5a2 2 0 0 0-2-2h-5" /></>}
        </svg>
    );
}