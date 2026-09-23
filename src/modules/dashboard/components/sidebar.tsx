"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Icon } from "./Icon";
import type { IconName } from "../types/iconName";
import type { SidebarProps } from "../types/sidebarProps";

import { useAuth } from "@/src/modules/auth/hooks/useAuth";
import { useLogout } from "@/src/modules/auth/hooks/useLogout";
import {
    normalizeRole,
    getDashboardRouteForRole,
} from "@/src/modules/auth/utils/roleUtils";

export default function Sidebar({ onNavigate }: SidebarProps) {
    const pathname = usePathname();

    const { user } = useAuth();
    const { logout, isLoading: isLoggingOut } = useLogout();

    const role = normalizeRole(user?.role);
    const dashboardHref = getDashboardRouteForRole(user?.role);

    const navigation: Array<{
        label: string;
        href: string;
        icon: IconName;
        adminOnly?: boolean;
    }> = [
        {
            label: "Dashboard",
            href: dashboardHref,
            icon: "grid",
        },
        {
            label: "Users",
            href: "/users",
            icon: "users",
            adminOnly: true,
        },
        {
            label: "Properties",
            href: "/properties",
            icon: "home",
        },
        {
            label: "Requests",
            href: "/bookings",
            icon: "inbox",
        },
        {
            label: "Reports",
            href: `${dashboardHref}#reports`,
            icon: "chart",
            adminOnly: true,
        },
        {
            label: "Settings",
            href: "/settings",
            icon: "settings",
        },
    ];

    const navItems = navigation.filter(
        (item) => !item.adminOnly || role === "admin"
    );

    const handleLogout = async () => {
        onNavigate?.();
        await logout();
    };

    const isDashboardRoute = (href: string) => {
        const routePath = href.split("#")[0];

        if (routePath === dashboardHref || routePath === "/dashboard") {
            return (
                pathname === "/dashboard" ||
                pathname === "/admin/dashboard" ||
                pathname === "/owner/dashboard" ||
                pathname === "/user/dashboard"
            );
        }

        return (
            pathname === routePath ||
            pathname.startsWith(`${routePath}/`)
        );
    };

    return (
        <aside className="flex h-full w-[250px] shrink-0 flex-col border-r border-[#e1e3e4] bg-white px-4 py-5">
            <Link href="/" className="flex items-center gap-2 px-3">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#00696b] text-sm font-bold text-white">
                    S
                </span>

                <span className="text-xl font-bold tracking-[-0.04em] text-[#191c1d]">
                    SpotNest
                </span>
            </Link>

            <div className="mt-8 px-3 text-[11px] font-bold uppercase tracking-[0.18em] text-[#75777e]">
                Workspace
            </div>

            <nav
                className="mt-3 space-y-1"
                aria-label="Main navigation"
            >
                {navItems.map((item) => {
                    const isActive = isDashboardRoute(item.href);

                    return (
                        <Link
                            key={item.label}
                            href={item.href}
                            onClick={onNavigate}
                            className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition ${
                                isActive
                                    ? "bg-[#d9f4f3] text-[#00696b]"
                                    : "text-[#44474d] hover:bg-[#f3f4f5] hover:text-[#191c1d]"
                            }`}
                        >
                            <Icon
                                name={item.icon}
                                className="h-[18px] w-[18px]"
                            />

                            <span>{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="mt-auto space-y-3">
                <button
                    type="button"
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="flex w-full items-center gap-3 rounded-xl border border-red-200 bg-red-50/50 px-3 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-100 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <Icon
                        name="logout"
                        className="h-[18px] w-[18px]"
                    />

                    <span>
                        {isLoggingOut
                            ? "Signing out..."
                            : "Sign Out"}
                    </span>
                </button>

                <div className="rounded-2xl bg-[#eef6f5] p-4">
                    <div className="grid h-9 w-9 place-items-center rounded-xl bg-white text-sm font-bold text-[#00696b]">
                        SN
                    </div>

                    <p className="mt-2 text-sm font-semibold text-[#191c1d]">
                        Need a hand?
                    </p>

                    <p className="mt-1 text-xs leading-5 text-[#44474d]">
                        Our support team is ready to help.
                    </p>
                </div>
            </div>
        </aside>
    );
}