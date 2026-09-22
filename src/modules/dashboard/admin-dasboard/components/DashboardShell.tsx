"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import Sidebar from "./sidebar";
import { useAppSelector } from "@/src/store/hook";
import { useLogout } from "@/src/modules/auth/hooks/useLogout";
import { normalizeRole, formatRoleName } from "@/src/modules/auth/utils/roleUtils";

export type IconName =
    | "grid"
    | "users"
    | "home"
    | "inbox"
    | "chart"
    | "settings"
    | "search"
    | "bell"
    | "menu"
    | "close"
    | "arrow"
    | "plus"
    | "chevron"
    | "check"
    | "clock"
    | "alert"
    | "logout";

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

interface DashboardShellProps {
    children: ReactNode;
    title?: string;
}

export default function DashboardShell({ children, title }: DashboardShellProps) {
    const [mobileOpen, setMobileOpen] = useState(false);
    const { logout, isLoading: isLoggingOut } = useLogout();
    const user = useAppSelector((state) => state.auth.user);

    const displayName = user?.name?.trim() || user?.email?.split("@")[0] || "User";
    const initials = displayName
        .split(/\s+/)
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase() || "?";

    const normalizedRole = normalizeRole(user?.role);
    const displayRole = formatRoleName(user?.role);

    const defaultTitle =
        normalizedRole === "admin"
            ? "Admin overview"
            : normalizedRole === "owner"
            ? "Owner overview"
            : "Tenant overview";

    const headerTitle = title || defaultTitle;

    return (
        <div className="min-h-screen bg-[#f8f9fa] text-[#191c1d]">
            {/* Desktop Sidebar */}
            <div className="fixed inset-y-0 left-0 z-40 hidden lg:block">
                <Sidebar />
            </div>
            {mobileOpen && <button type="button" aria-label="Close navigation" className="fixed inset-0 z-40 bg-[#191c1d]/30 lg:hidden" onClick={() => setMobileOpen(false)} />}
            <div className={`fixed inset-y-0 left-0 z-50 transition-transform duration-200 lg:hidden ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
                <div className="relative h-full">
                    <Sidebar onNavigate={() => setMobileOpen(false)} />
                    <button type="button" aria-label="Close navigation" className="absolute right-3 top-4 grid h-8 w-8 place-items-center rounded-full bg-[#f3f4f5] text-[#44474d]" onClick={() => setMobileOpen(false)}><Icon name="close" className="h-4 w-4" /></button>
                </div>
            </div>

            <div className="lg:pl-[250px]">
                <header className="sticky top-0 z-30 flex h-[72px] items-center justify-between border-b border-[#e1e3e4] bg-[#f8f9fa]/95 px-4 backdrop-blur sm:px-6 lg:px-10">
                    <button type="button" aria-label="Open navigation" className="grid h-10 w-10 place-items-center rounded-xl border border-[#e1e3e4] bg-white text-[#44474d] lg:hidden" onClick={() => setMobileOpen(true)}><Icon name="menu" /></button>
                    <div className="hidden items-center gap-3 text-sm text-[#75777e] sm:flex">
                        <span>Workspace</span>
                        <span aria-hidden="true">/</span>
                        <span className="font-semibold text-[#191c1d]">{headerTitle}</span>
                    </div>
                    <div className="ml-auto flex items-center gap-2 sm:gap-4">
                        <button type="button" aria-label="Search" className="hidden h-10 w-10 place-items-center rounded-full text-[#44474d] transition hover:bg-[#e7e8e9] sm:grid"><Icon name="search" className="h-[18px] w-[18px]" /></button>
                        <button type="button" aria-label="Notifications" className="relative grid h-10 w-10 place-items-center rounded-full text-[#44474d] transition hover:bg-[#e7e8e9]"><Icon name="bell" className="h-[18px] w-[18px]" /><span className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-[#f8f9fa] bg-[#00696b]" /></button>
                        <div className="h-7 w-px bg-[#e1e3e4]" />

                        {/* User Profile Badge */}
                        <div className="flex items-center gap-2.5">
                            {user?.image ? (
                                <img
                                    src={user.image}
                                    alt={displayName}
                                    className="h-9 w-9 rounded-full object-cover shadow-xs"
                                />
                            ) : (
                                <span className="grid h-9 w-9 place-items-center rounded-full bg-[#00696b] text-xs font-bold text-white shadow-xs">
                                    {initials}
                                </span>
                            )}
                            <div className="hidden text-left sm:block">
                                <span className="block text-xs font-bold text-[#191c1d] leading-tight truncate max-w-[140px]">
                                    {displayName}
                                </span>
                                <span className="block text-[11px] text-[#75777e] leading-tight">
                                    {displayRole}
                                </span>
                            </div>
                        </div>

                        {/* Header Logout Action */}
                        <button
                            type="button"
                            onClick={() => void logout()}
                            disabled={isLoggingOut}
                            title="Sign Out"
                            className="ml-1 flex items-center justify-center rounded-xl border border-red-200 bg-red-50/70 p-2 text-red-600 transition hover:bg-red-100 hover:text-red-700 disabled:opacity-50"
                            aria-label="Sign Out"
                        >
                            <Icon name="logout" className="h-[18px] w-[18px]" />
                        </button>
                    </div>
                </header>

                <main>{children}</main>
            </div>
        </div>
    );
}


