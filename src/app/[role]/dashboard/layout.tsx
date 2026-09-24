"use client";

import { useEffect, type ReactNode } from "react";
import { useParams, useRouter } from "next/navigation";
import DashboardShell from "@/src/modules/dashboard/components/DashboardShell";
import { useAppSelector } from "@/src/store/hook";

export default function RoleDashboardLayout({ children }: { children: ReactNode }) {
    const router = useRouter();
    const { role } = useParams<{ role: string }>();
    const { isAuthenticated, isInitialized, user } = useAppSelector((state) => state.auth);

    // Only dashboard roles may access this layout. Normal users browse
    // properties and do not have a dashboard route.
    const dashboardRole =
        user?.role === "admin" || user?.role === "owner" || user?.role === "tenant"
            ? user.role
            : null;

    useEffect(() => {
        if (!isInitialized) return;

        if (!isAuthenticated || !user) {
            router.replace("/login");
            return;
        }

        if (user.role === "owner" && user.verificationStatus !== "approved") {
            router.replace(
                user.verificationStatus === "pending"
                    ? `/account-pending?email=${encodeURIComponent(user.email)}`
                    : "/login"
            );
            return;
        }

        if (!dashboardRole) {
            router.replace("/properties");
            return;
        }

        if (role !== dashboardRole) {
            router.replace(`/${dashboardRole}/dashboard`);
        }
    }, [dashboardRole, isAuthenticated, isInitialized, role, router, user]);

    if (
        !isInitialized ||
        !isAuthenticated ||
        !user ||
        !dashboardRole ||
        role !== dashboardRole ||
        (user.role === "owner" && user.verificationStatus !== "approved")
    ) {
        return null;
    }

    return (
        <DashboardShell>{children}</DashboardShell>
    );
}
