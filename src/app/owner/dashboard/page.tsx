"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/modules/auth/hooks/useAuth";
import DashboardShell from "@/src/modules/dashboard/components/DashboardShell";
import Link from "next/link";
import { normalizeRole, getDashboardRouteForRole } from "@/src/modules/auth/utils/roleUtils";

export default function OwnerDashboardPage() {
    const router = useRouter();
    const { user, isAuthenticated, initialized } = useAuth();

    useEffect(() => {
        if (initialized && !isAuthenticated) {
            router.push("/login");
        }
    }, [initialized, isAuthenticated, router]);

    if (!initialized) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#f8f9fa]">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#00696b]/30 border-t-[#00696b]" />
            </div>
        );
    }

    if (!isAuthenticated || !user) {
        return null;
    }

    const role = normalizeRole(user.role);

    if (role !== "owner" && role !== "admin") {
        const correctDashboard = getDashboardRouteForRole(user.role);
        return (
            <DashboardShell>
                <div className="mx-auto max-w-2xl px-4 py-16 text-center">
                    <div className="rounded-2xl border border-red-200 bg-red-50 p-8">
                        <h1 className="text-xl font-bold text-red-700">403 - Access Denied</h1>
                        <p className="mt-2 text-sm text-red-600">
                            You do not have permission to view the Property Owner Dashboard.
                        </p>
                        <Link
                            href={correctDashboard}
                            className="mt-6 inline-block rounded-xl bg-[#00696b] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#004f51]"
                        >
                            Go to Your Dashboard
                        </Link>
                    </div>
                </div>
            </DashboardShell>
        );
    }

    return (
        <DashboardShell >
            <div className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6 sm:py-10 lg:px-10 lg:py-12">
                <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#00696b]">
                            Owner Portal
                        </p>
                        <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#191c1d] sm:text-4xl">
                            Property Owner Dashboard
                        </h1>
                        <p className="mt-2 text-base text-[#44474d]">
                            Manage your listed properties, review tenant applications, and monitor rental earnings.
                        </p>
                    </div>

                    <Link
                        href="/properties"
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#00696b] px-5 py-3 text-sm font-semibold text-white shadow-xs transition hover:bg-[#004f51]"
                    >
                        <span>Manage Properties</span>
                    </Link>
                </section>

                <div className="mt-10 rounded-2xl border border-[#e1e3e4] bg-white p-8 text-center">
                    <p className="text-sm font-semibold text-[#191c1d]">Welcome to the Owner Portal</p>
                    <p className="mt-1 text-xs text-[#75777e]">
                        Use the sidebar to view properties, monitor tenant booking requests, and configure settings.
                    </p>
                </div>
            </div>
        </DashboardShell>
    );
}
