"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/src/store/hook";
import { signedOut } from "@/src/store/slices/authSlice";
import { logout } from "@/src/modules/auth/services/authServices";
import { Icon } from "./Icon";
import Sidebar from "./sidebar";
import { DashboardShellProps } from "../types/dashboardShell";
import { NotificationBell } from "@/src/modules/notifications";

export default function DashboardShell({
    children,
    role: explicitRole,
}: DashboardShellProps) {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const router = useRouter();
    const dispatch = useAppDispatch();

    const {
        user,
        isAuthenticated,
        isInitialized,
        status,
    } = useAppSelector((state) => state.auth);

    const userRole =
        explicitRole ??
        (user?.role === "admin" || user?.role === "owner" || user?.role === "tenant"
            ? user.role
            : "user");

    useEffect(() => {
        if (
            isInitialized &&
            !isAuthenticated &&
            status !== "loading"
        ) {
            router.push("/login");
        }
    }, [isInitialized, isAuthenticated, status, router]);

    const handleLogout = async () => {
        setIsLoggingOut(true);

        try {
            await logout();
        } catch (error) {
            console.error("Logout request failed:", error);
        } finally {
            dispatch(signedOut());
            setIsLoggingOut(false);
            setIsProfileOpen(false);
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

    const displayName =
        user?.name ||
        user?.email?.split("@")[0] ||
        (userRole === "admin" ? "Administrator" : userRole === "owner" ? "Property Owner" : "Tenant");

    const displayRole =
        userRole === "admin"
            ? "Administrator"
            : userRole === "owner"
                ? "Property Owner"
                : "Tenant";

    const initials =
        displayName
            .split(" ")
            .map((part) => part[0])
            .filter(Boolean)
            .slice(0, 2)
            .join("")
            .toUpperCase() || "U";

    const overviewLabel =
        userRole === "admin"
            ? "Admin overview"
            : userRole === "owner"
                ? "Owner overview"
                : "Tenant overview";

    return (
        <div className="min-h-screen bg-[#f8f9fa] text-[#191c1d]">
            {/* Desktop Sidebar */}
            <div className="fixed inset-y-0 left-0 z-40 hidden lg:block">
                <Sidebar role={userRole} />
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
                className={`fixed inset-y-0 left-0 z-50 transition-transform duration-200 lg:hidden ${mobileOpen
                        ? "translate-x-0"
                        : "-translate-x-full"
                    }`}
            >
                <div className="relative h-full">
                    <Sidebar
                        role={userRole}
                        onNavigate={() => setMobileOpen(false)}
                    />

                    <button
                        type="button"
                        aria-label="Close navigation"
                        className="absolute right-3 top-4 grid h-8 w-8 place-items-center rounded-full bg-[#f3f4f5] text-[#44474d] hover:bg-[#e1e3e4]"
                        onClick={() => setMobileOpen(false)}
                    >
                        <Icon
                            name="close"
                            className="h-4 w-4"
                        />
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
                        <span className="font-semibold text-[#191c1d]">
                            {overviewLabel}
                        </span>
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
                                <Icon
                                    name="search"
                                    className="h-4 w-4"
                                />
                            </span>
                        </div>

                        {userRole !== "user" && <NotificationBell />}

                        <div className="h-7 w-px bg-[#e1e3e4]" />

                        {/* User Profile Dropdown */}
                        <div className="relative">
                            <button
                                type="button"
                                aria-expanded={isProfileOpen}
                                aria-label="Open user menu"
                                className="flex items-center gap-2.5"
                                onClick={() =>
                                    setIsProfileOpen(
                                        (isOpen) => !isOpen
                                    )
                                }
                            >
                                <span className="grid h-9 w-9 place-items-center rounded-full bg-[#00696b] text-xs font-bold text-white shadow-xs">
                                    {initials}
                                </span>

                                <div className="hidden text-left sm:block">
                                    <span className="block max-w-[140px] truncate text-xs font-bold leading-tight text-[#191c1d]">
                                        {displayName}
                                    </span>

                                    <span className="block text-[11px] leading-tight text-[#75777e]">
                                        {displayRole}
                                    </span>
                                </div>
                            </button>

                            {isProfileOpen && (
                                <>
                                    <button
                                        type="button"
                                        aria-label="Close user menu"
                                        className="fixed inset-0 z-40"
                                        onClick={() =>
                                            setIsProfileOpen(false)
                                        }
                                    />

                                    <div className="absolute right-0 top-12 z-50 w-44 rounded-xl border border-[#e1e3e4] bg-white p-1 shadow-lg">
                                        <button
                                            type="button"
                                            disabled={isLoggingOut}
                                            onClick={handleLogout}
                                            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-semibold text-[#ba1a1a] transition hover:bg-[#ffdad6]/40 disabled:cursor-not-allowed disabled:opacity-60"
                                        >
                                            <Icon
                                                name="logout"
                                                className="h-4 w-4"
                                            />

                                            {isLoggingOut
                                                ? "Logging out..."
                                                : "Logout"}
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </header>

                <main>{children}</main>
            </div>
        </div>
    );
}
