"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "./Icon";
import {
    adminNavigation,
    ownerNavigation,
    userNavigation,
} from "../constants/navigations";
import type { SidebarProps } from "../types/sidebarProps";

export default function Sidebar({ role, onNavigate }: SidebarProps) {
    const pathname = usePathname();
    const items =
        role === "admin"
            ? adminNavigation
            : role === "owner"
              ? ownerNavigation
              : userNavigation;
    const portalTitle =
        role === "admin"
            ? "Admin Workspace"
            : role === "owner"
              ? "Owner Portal"
              : "Tenant Portal";

    return (
        <aside className="flex h-full w-[280px] shrink-0 flex-col border-r border-[#e1e3e4] bg-white px-5 py-6 shadow-xs">
            <Link
                href="/"
                className="flex items-center gap-3 px-2"
                onClick={onNavigate}
            >
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#00696b] text-base font-bold text-white shadow-xs">
                    S
                </span>
                <div>
                    <span className="text-xl font-bold tracking-tight text-[#191c1d]">
                        SpotNest
                    </span>
                    <span className="block text-[11px] font-medium text-[#75777e]">
                        {portalTitle}
                    </span>
                </div>
            </Link>

            <div className="mt-8 px-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[#75777e]">
                Navigation
            </div>
            <nav
                className="mt-3 flex-1 space-y-1.5"
                aria-label="Dashboard navigation"
            >
                {items.map((item) => {
                    const isBase = item.href.split("#")[0];
                    const isActive =
                        isBase === pathname ||
                        item.children?.some(
                            (child) => pathname === child.href
                        );

                    return (
                        <div key={item.label}>
                            <Link
                                href={item.href}
                                onClick={onNavigate}
                                className={`flex items-center gap-3.5 rounded-xl px-3.5 py-3 text-sm font-semibold transition ${
                                    isActive
                                        ? "bg-[#d9f4f3] text-[#00696b]"
                                        : "text-[#44474d] hover:bg-[#f3f4f5] hover:text-[#191c1d]"
                                }`}
                            >
                                <Icon
                                    name={item.icon}
                                    className="h-5 w-5"
                                />
                                <span>{item.label}</span>
                            </Link>
                            {item.children?.map((child) => (
                                <Link
                                    key={child.href}
                                    href={child.href}
                                    onClick={onNavigate}
                                    className={`ml-8 flex items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold transition ${
                                        pathname === child.href
                                            ? "bg-[#d9f4f3] text-[#00696b]"
                                            : "text-[#75777e] hover:bg-[#f3f4f5] hover:text-[#191c1d]"
                                    }`}
                                >
                                    <span>{child.label}</span>
                                </Link>
                            ))}
                        </div>
                    );
                })}
            </nav>

            <div className="rounded-2xl border border-[#e1e3e4] bg-[#f8f9fa] p-4 text-xs">
                <p className="font-semibold text-[#191c1d]">
                    Need assistance?
                </p>
                <p className="mt-1 text-[#44474d]">
                    Contact our support team anytime.
                </p>
                <Link
                    href="/contact"
                    onClick={onNavigate}
                    className="mt-2.5 inline-flex items-center gap-1 font-bold text-[#00696b] hover:text-[#004f51]"
                >
                    Get help <span aria-hidden="true">&rarr;</span>
                </Link>
            </div>
        </aside>
    );
}
