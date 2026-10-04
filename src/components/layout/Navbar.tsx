"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, MessageCircle } from "lucide-react";
import { useAppSelector } from "@/src/store/hook";
import { useLogout } from "@/src/modules/auth";
import { useConversations } from "@/src/modules/chat/hooks/useChat";
import { NotificationBell } from "@/src/modules/notifications";
import { dashboardChatPathForRole } from "@/src/constants/routes";

export default function Navbar() {
    const { isAuthenticated, user, isInitialized } = useAppSelector(
        (state) => state.auth
    );
    const { logout, isLoading: isLoggingOut } = useLogout();
    const [profileMenuOpen, setProfileMenuOpen] = useState(false);
    const profileMenuRef = useRef<HTMLDivElement>(null);
    const canUseChat = Boolean(
        isInitialized &&
        isAuthenticated &&
        user &&
        ["user", "tenant", "owner"].includes(user.role)
    );
    const conversationsQuery = useConversations(canUseChat, canUseChat);
    const unreadMessageCount = conversationsQuery.data?.reduce(
        (total, conversation) => total + conversation.unreadCount,
        0
    ) ?? 0;
    const messagesHref = user?.role === "user"
        ? "/messages"
        : user?.role === "tenant" || user?.role === "owner"
            ? dashboardChatPathForRole(user.role)
            : null;

    useEffect(() => {
        const closeOnOutsideClick = (event: MouseEvent) => {
            if (!profileMenuRef.current?.contains(event.target as Node)) {
                setProfileMenuOpen(false);
            }
        };
        const closeOnEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape") setProfileMenuOpen(false);
        };
        document.addEventListener("mousedown", closeOnOutsideClick);
        document.addEventListener("keydown", closeOnEscape);
        return () => {
            document.removeEventListener("mousedown", closeOnOutsideClick);
            document.removeEventListener("keydown", closeOnEscape);
        };
    }, []);

    return (
        <header className="border-b border-[#e7e8e9] bg-[#f8f9fa]/95 px-4 backdrop-blur sm:px-6 lg:px-10">
            <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between">
                <Link
                    href="/"
                    className="text-xl font-bold tracking-[-0.04em] text-[#191c1d] sm:text-2xl"
                >
                    SpotNest
                </Link>

                <div className="hidden items-center gap-7 lg:flex">
                    <Link
                        href="/"
                        className="border-b-2 border-[#191c1d] py-1 text-sm font-medium text-[#191c1d] transition hover:text-[#00696b]"
                    >
                        Home
                    </Link>

                    <Link
                        href="/properties"
                        className="border-b-2 border-transparent py-1 text-sm font-medium text-[#191c1d] transition hover:border-[#00696b] hover:text-[#00696b]"
                    >
                        Properties
                    </Link>

                    <Link
                        href="/about"
                        className="border-b-2 border-transparent py-1 text-sm font-medium text-[#191c1d] transition hover:border-[#00696b] hover:text-[#00696b]"
                    >
                        About
                    </Link>

                    <Link
                        href="/contact"
                        className="border-b-2 border-transparent py-1 text-sm font-medium text-[#191c1d] transition hover:border-[#00696b] hover:text-[#00696b]"
                    >
                        Contact
                    </Link>
                </div>

                <div className="flex items-center gap-1.5 sm:gap-3">
                    {isInitialized && isAuthenticated && user ? (
                        <>
                            <NotificationBell />

                            {messagesHref && (
                                <Link
                                    href={messagesHref}
                                    aria-label={`Messages${unreadMessageCount ? `, ${unreadMessageCount} unread` : ""}`}
                                    className="relative grid h-10 w-10 place-items-center rounded-full border border-[#e1e3e4] bg-white text-[#44474d] transition hover:bg-[#f3f4f5]"
                                >
                                    <MessageCircle aria-hidden="true" className="h-4.5 w-4.5" />
                                    {unreadMessageCount > 0 && (
                                        <span className="absolute -right-1 -top-1 grid min-h-4 min-w-4 place-items-center rounded-full bg-[#00696b] px-1 text-[10px] font-bold text-white">
                                            {unreadMessageCount > 99 ? "99+" : unreadMessageCount}
                                        </span>
                                    )}
                                </Link>
                            )}

                            <div className="relative" ref={profileMenuRef}>
                                <button
                                    type="button"
                                    aria-label="Open profile menu"
                                    aria-expanded={profileMenuOpen}
                                    onClick={() => setProfileMenuOpen((open) => !open)}
                                    className="inline-flex h-10 items-center gap-1.5 rounded-full border border-[#e1e3e4] bg-white pl-1 pr-2 text-sm font-semibold text-[#191c1d] transition hover:bg-[#f3f4f5]"
                                >
                                    {user.image ? (
                                        <img
                                            src={user.image}
                                            alt=""
                                            className="h-8 w-8 rounded-full object-cover"
                                        />
                                    ) : (
                                        <span className="grid h-8 w-8 place-items-center rounded-full bg-[#d9f4f3] text-sm font-bold text-[#00696b]">
                                            {user.name.trim().charAt(0).toUpperCase() || "U"}
                                        </span>
                                    )}
                                    <ChevronDown aria-hidden="true" className="h-4 w-4 text-[#75777e]" />
                                </button>

                                {profileMenuOpen && (
                                    <div className="absolute right-0 top-12 z-50 w-44 overflow-hidden rounded-xl border border-[#e1e3e4] bg-white py-1 shadow-lg">
                                        <Link
                                            href="/profile"
                                            onClick={() => setProfileMenuOpen(false)}
                                            className="block px-4 py-2.5 text-sm font-medium text-[#191c1d] transition hover:bg-[#f3f4f5]"
                                        >
                                            Profile
                                        </Link>
                                        <button
                                            type="button"
                                            disabled={isLoggingOut}
                                            onClick={() => {
                                                setProfileMenuOpen(false);
                                                void logout();
                                            }}
                                            className="block w-full px-4 py-2.5 text-left text-sm font-medium text-[#ba1a1a] transition hover:bg-[#ffdad6]/40 disabled:opacity-60"
                                        >
                                            {isLoggingOut ? "Logging out..." : "Logout"}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <>
                            <Link
                                href="/login"
                                className="rounded-full px-3 py-2 text-sm font-medium text-[#191c1d] transition hover:bg-[#edeeef] sm:px-4"
                            >
                                Login
                            </Link>

                            <Link
                                href="/register"
                                className="rounded-full bg-[#191c1d] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#00696b] sm:px-5"
                            >
                                Register
                            </Link>
                        </>
                    )}
                </div>
            </nav>
        </header>
    );
}
