"use client";

import { useEffect, type ReactNode } from "react";
import { useParams, useRouter } from "next/navigation";
import DashboardShell from "@/src/modules/dashboard/components/DashboardShell";
import { useAppSelector } from "@/src/store/hook";

export default function RoleDashboardLayout({ children }: { children: ReactNode }) {
    const router = useRouter();
    const { role } = useParams<{ role: string }>();
    const { isAuthenticated, isInitialized, user } = useAppSelector((state) => state.auth);

    // Keep the URL role in sync with the authenticated role. Tenants have a
    // dedicated dashboard, while normal users use the shared user route.
    const expectedRole =
        user?.role === "admin" || user?.role === "owner" || user?.role === "tenant"
            ? user.role
            : "user";

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

        if (role !== expectedRole) {
            router.replace(`/${expectedRole}/dashboard`);
        }
    }, [expectedRole, isAuthenticated, isInitialized, role, router, user]);

    if (
        !isInitialized ||
        !isAuthenticated ||
        !user ||
        role !== expectedRole ||
        (user.role === "owner" && user.verificationStatus !== "approved")
    ) {
        return null;
    }

    return (
        <DashboardShell>{children}</DashboardShell>
    );
}
