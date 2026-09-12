"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";

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

const navigation = [
    { label: "Dashboard", href: "/dashboard", icon: "grid" as IconName },
    { label: "Users", href: "/users", icon: "users" as IconName },
    { label: "Properties", href: "/properties", icon: "home" as IconName },
    { label: "Requests", href: "/bookings", icon: "inbox" as IconName },
    { label: "Reports", href: "/dashboard#reports", icon: "chart" as IconName },
    { label: "Settings", href: "/settings", icon: "settings" as IconName },
];

function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
    const pathname = usePathname();

    return (
        <aside className="flex h-full w-[250px] shrink-0 flex-col border-r border-[#e1e3e4] bg-white px-4 py-5">
            <Link href="/" className="flex items-center gap-2 px-3" onClick={onNavigate}>
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#00696b] text-sm font-bold text-white">S</span>
                <span className="text-xl font-bold tracking-[-0.04em] text-[#191c1d]">SpotNest</span>
            </Link>

            <div className="mt-12 px-3 text-[11px] font-bold uppercase tracking-[0.18em] text-[#75777e]">Workspace</div>
            <nav className="mt-3 space-y-1" aria-label="Admin navigation">
                {navigation.map((item) => {
                    const isActive = item.href === "/dashboard" ? pathname === "/dashboard" : item.href.startsWith(pathname);
                    return (
                        <Link
                            key={item.label}
                            href={item.href}
                            onClick={onNavigate}
                            className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition ${isActive ? "bg-[#d9f4f3] text-[#00696b]" : "text-[#44474d] hover:bg-[#f3f4f5] hover:text-[#191c1d]"}`}
                        >
                            <Icon name={item.icon} className="h-[18px] w-[18px]" />
                            {item.label}
                            {item.label === "Requests" && <span className="ml-auto rounded-full bg-[#00696b] px-2 py-0.5 text-[10px] font-bold text-white">8</span>}
                        </Link>
                    );
                })}
            </nav>

            <div className="mt-auto rounded-2xl bg-[#eef6f5] p-4">
                <div className="grid h-9 w-9 place-items-center rounded-xl bg-white text-sm font-bold text-[#00696b]">SN</div>
                <p className="mt-4 text-sm font-semibold text-[#191c1d]">Need a hand?</p>
                <p className="mt-1 text-xs leading-5 text-[#44474d]">Our support team is ready to help.</p>
                <button type="button" className="mt-3 text-xs font-bold text-[#00696b] transition hover:text-[#004f51]">Contact support <span aria-hidden="true">→</span></button>
            </div>
        </aside>
    );
}

export default function DashboardShell({ children }: { children: ReactNode }) {
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <div className="min-h-screen bg-[#f8f9fa] text-[#191c1d]">
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
                    <div className="hidden items-center gap-3 text-sm text-[#75777e] sm:flex"><span>Workspace</span><span aria-hidden="true">/</span><span className="font-semibold text-[#191c1d]">Admin overview</span></div>
                    <div className="ml-auto flex items-center gap-2 sm:gap-4">
                        <button type="button" aria-label="Search" className="hidden h-10 w-10 place-items-center rounded-full text-[#44474d] transition hover:bg-[#e7e8e9] sm:grid"><Icon name="search" className="h-[18px] w-[18px]" /></button>
                        <button type="button" aria-label="Notifications" className="relative grid h-10 w-10 place-items-center rounded-full text-[#44474d] transition hover:bg-[#e7e8e9]"><Icon name="bell" className="h-[18px] w-[18px]" /><span className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-[#f8f9fa] bg-[#00696b]" /></button>
                        <div className="h-7 w-px bg-[#e1e3e4]" />
                        <button type="button" className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2 transition hover:bg-[#e7e8e9]"><span className="grid h-8 w-8 place-items-center rounded-full bg-[#191c1d] text-xs font-bold text-white">AM</span><span className="hidden text-left sm:block"><span className="block text-xs font-bold text-[#191c1d]">Amina Malik</span><span className="block text-[11px] text-[#75777e]">Administrator</span></span><Icon name="chevron" className="hidden h-4 w-4 text-[#75777e] sm:block" /></button>
                    </div>
                </header>
                <main>{children}</main>
            </div>
        </div>
    );
}
