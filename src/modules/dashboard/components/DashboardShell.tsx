"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, type ReactNode } from "react";
import { useAppDispatch, useAppSelector } from "@/src/store/hook";
import { signedOut } from "@/src/store/slices/authSlice";
import { logout } from "@/src/modules/auth/services/authServices";

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

const adminNavigation = [
    { label: "Dashboard", href: "/dashboard", icon: "grid" as IconName },
    { label: "Users", href: "/users", icon: "users" as IconName },
    { label: "Properties", href: "/properties", icon: "home" as IconName },
    { label: "Requests", href: "/bookings", icon: "inbox" as IconName },
    { label: "Reports", href: "/dashboard#reports", icon: "chart" as IconName },
    { label: "Settings", href: "/settings", icon: "settings" as IconName },
];

const userNavigation = [
    { label: "Dashboard", href: "/user/dashboard", icon: "grid" as IconName },
    { label: "My Rental / Properties", href: "/properties", icon: "home" as IconName },
    { label: "Requests", href: "/bookings", icon: "inbox" as IconName },
    { label: "Payments", href: "/user/dashboard#payments", icon: "clock" as IconName },
    { label: "Maintenance", href: "/user/dashboard#maintenance", icon: "alert" as IconName },
    { label: "Notifications", href: "/user/dashboard#notifications", icon: "bell" as IconName },
    { label: "Settings", href: "/settings", icon: "settings" as IconName },
];

const ownerNavigation = [
    { label: "Dashboard", href: "/owner/dashboard", icon: "grid" as IconName },
    { label: "Properties", href: "/properties", icon: "home" as IconName },
    { label: "Requests", href: "/bookings", icon: "inbox" as IconName },
    { label: "Settings", href: "/settings", icon: "settings" as IconName },
];

interface SidebarProps {
    role: "admin" | "user" | "owner";
    onNavigate?: () => void;
    onLogout: () => void;
}

function Sidebar({ role, onNavigate, onLogout }: SidebarProps) {
    const pathname = usePathname();

    const items = role === "admin" ? adminNavigation : role === "owner" ? ownerNavigation : userNavigation;
    const portalTitle = role === "admin" ? "Admin Workspace" : role === "owner" ? "Owner Portal" : "Tenant Portal";

    return (
        <aside className="flex h-full w-[280px] shrink-0 flex-col border-r border-[#e1e3e4] bg-white px-5 py-6 shadow-xs">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 px-2" onClick={onNavigate}>
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#00696b] text-base font-bold text-white shadow-xs">
                    S
                </span>
                <div>
                    <span className="text-xl font-bold tracking-tight text-[#191c1d]">SpotNest</span>
                    <span className="block text-[11px] font-medium text-[#75777e]">{portalTitle}</span>
                </div>
            </Link>

            {/* Section label */}
            <div className="mt-8 px-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[#75777e]">
                Navigation
            </div>

            {/* Navigation items */}
            <nav className="mt-3 flex-1 space-y-1.5" aria-label="Dashboard navigation">
                {items.map((item) => {
                    const isBase = item.href.split("#")[0];
                    const isActive = isBase === pathname || (item.href === "/user/dashboard" && pathname === "/user/dashboard");

                    return (
                        <Link
                            key={item.label}
                            href={item.href}
                            onClick={onNavigate}
                            className={`flex items-center gap-3.5 rounded-xl px-3.5 py-3 text-sm font-semibold transition ${
                                isActive
                                    ? "bg-[#d9f4f3] text-[#00696b]"
                                    : "text-[#44474d] hover:bg-[#f3f4f5] hover:text-[#191c1d]"
                            }`}
                        >
                            <Icon name={item.icon} className="h-5 w-5" />
                            <span>{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Support card */}
            <div className="rounded-2xl border border-[#e1e3e4] bg-[#f8f9fa] p-4 text-xs">
                <p className="font-semibold text-[#191c1d]">Need assistance?</p>
                <p className="mt-1 text-[#44474d]">Contact our support team anytime.</p>
                <Link
                    href="/contact"
                    className="mt-2.5 inline-flex items-center gap-1 font-bold text-[#00696b] hover:text-[#004f51]"
                >
                    Get help <span aria-hidden="true">&rarr;</span>
                </Link>
            </div>

            {/* Logout button */}
            <div className="mt-4 pt-3 border-t border-[#e1e3e4]">
                <button
                    type="button"
                    onClick={() => {
                        onNavigate?.();
                        onLogout();
                    }}
                    className="flex w-full items-center gap-3.5 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-[#ba1a1a] transition hover:bg-[#ffdad6]/40"
                >
                    <Icon name="logout" className="h-5 w-5" />
                    <span>Log out</span>
                </button>
            </div>
        </aside>
    );
}

export interface DashboardShellProps {
    children: ReactNode;
    role?: "admin" | "user" | "owner";
}

export default function DashboardShell({ children, role = "user" }: DashboardShellProps) {
    const [mobileOpen, setMobileOpen] = useState(false);
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { user, isAuthenticated, isInitialized, status } = useAppSelector(
        (state) => state.auth
    );

    useEffect(() => {
        if (isInitialized && !isAuthenticated && status !== "loading") {
            router.push("/login");
        }
    }, [isInitialized, isAuthenticated, status, router]);

    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            console.error("Logout request failed:", error);
        } finally {
            dispatch(signedOut());
            router.push("/login");
        }
    };

    if (!isInitialized || status === "loading") {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#f8f9fa]">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#00696b]/30 border-t-[#00696b]" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return null;
    }

    const displayName = user?.name || user?.email?.split("@")[0] || (role === "admin" ? "Administrator" : "Tenant");
    const displayRole = role === "admin" ? "Administrator" : role === "owner" ? "Property Owner" : "Tenant";
    const initials = displayName
        .split(" ")
        .map((p) => p[0])
        .filter(Boolean)
        .slice(0, 2)
        .join("")
        .toUpperCase() || "U";

    const overviewLabel = role === "admin" ? "Admin overview" : role === "owner" ? "Owner overview" : "Tenant overview";

    return (
        <div className="min-h-screen bg-[#f8f9fa] text-[#191c1d]">
            {/* Desktop Sidebar */}
            <div className="fixed inset-y-0 left-0 z-40 hidden lg:block">
                <Sidebar role={role} onLogout={handleLogout} />
            </div>

            {/* Mobile Drawer Backdrop */}
            {mobileOpen && (
                <button
                    type="button"
                    aria-label="Close navigation"
                    className="fixed inset-0 z-40 bg-[#191c1d]/40 backdrop-blur-xs lg:hidden"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Mobile Sidebar */}
            <div
                className={`fixed inset-y-0 left-0 z-50 transition-transform duration-200 lg:hidden ${
                    mobileOpen ? "translate-x-0" : "-translate-x-full"
                }`}
            >
                <div className="relative h-full">
                    <Sidebar role={role} onNavigate={() => setMobileOpen(false)} onLogout={handleLogout} />
                    <button
                        type="button"
                        aria-label="Close navigation"
                        className="absolute right-3 top-4 grid h-8 w-8 place-items-center rounded-full bg-[#f3f4f5] text-[#44474d] hover:bg-[#e1e3e4]"
                        onClick={() => setMobileOpen(false)}
                    >
                        <Icon name="close" className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {/* Main Content Container */}
            <div className="lg:pl-[280px]">
                {/* Header */}
                <header className="sticky top-0 z-30 flex h-[72px] items-center justify-between border-b border-[#e1e3e4] bg-[#f8f9fa]/95 px-4 backdrop-blur-md sm:px-6 lg:px-10">
                    <button
                        type="button"
                        aria-label="Open navigation"
                        className="grid h-10 w-10 place-items-center rounded-xl border border-[#e1e3e4] bg-white text-[#44474d] hover:bg-[#f3f4f5] lg:hidden"
                        onClick={() => setMobileOpen(true)}
                    >
                        <Icon name="menu" />
                    </button>

                    <div className="hidden items-center gap-3 text-sm text-[#75777e] sm:flex">
                        <span>SpotNest</span>
                        <span aria-hidden="true">/</span>
                        <span className="font-semibold text-[#191c1d]">{overviewLabel}</span>
                    </div>

                    <div className="ml-auto flex items-center gap-3 sm:gap-4">
                        {/* Search Bar */}
                        <div className="relative hidden md:block">
                            <input
                                type="text"
                                placeholder="Search properties, requests..."
                                className="h-10 w-64 rounded-full border border-[#e1e3e4] bg-white pl-10 pr-4 text-xs text-[#191c1d] placeholder-[#75777e] outline-none transition focus:border-[#00696b] focus:ring-2 focus:ring-[#d9f4f3]"
                            />
                            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#75777e]">
                                <Icon name="search" className="h-4 w-4" />
                            </span>
                        </div>

                        {/* Notifications */}
                        <button
                            type="button"
                            aria-label="Notifications"
                            className="relative grid h-10 w-10 place-items-center rounded-full border border-[#e1e3e4] bg-white text-[#44474d] transition hover:bg-[#f3f4f5]"
                        >
                            <Icon name="bell" className="h-[18px] w-[18px]" />
                            <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-[#00696b]" />
                        </button>

                        <div className="h-7 w-px bg-[#e1e3e4]" />

                        {/* User Profile Badge */}
                        <div className="flex items-center gap-2.5">
                            <span className="grid h-9 w-9 place-items-center rounded-full bg-[#00696b] text-xs font-bold text-white shadow-xs">
                                {initials}
                            </span>
                            <div className="hidden text-left sm:block">
                                <span className="block text-xs font-bold text-[#191c1d] leading-tight truncate max-w-[140px]">
                                    {displayName}
                                </span>
                                <span className="block text-[11px] text-[#75777e] leading-tight">
                                    {displayRole}
                                </span>
                            </div>
                        </div>
                    </div>
                </header>

                <main>{children}</main>
            </div>
        </div>
    );
}
