
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import LandingPage from "@/src/modules/landing/page";
import { useAppSelector } from "@/src/store/hook";
import { getDashboardRouteForRole } from "@/src/modules/auth/utils/roleUtils";

export default function Home() {
    const router = useRouter();
    const { isAuthenticated, isInitialized, user } = useAppSelector(
        (state) => state.auth
    );

    useEffect(() => {
        if (!isInitialized || !isAuthenticated || !user) {
            return;
        }

        // Unapproved owners must finish verification instead of entering
        // the owner dashboard.
        if (user.role === "owner" && user.verificationStatus !== "approved") {
            if (user.verificationStatus === "pending") {
                router.replace(
                    `/account-pending?email=${encodeURIComponent(user.email)}`
                );
            } else {
                router.replace("/login");
            }

            return;
        }

        // Admins, approved owners, and tenants go to their dashboards.
        // Ordinary users can continue browsing properties.
        if (
            user.role === "admin" ||
            user.role === "owner" ||
            user.role === "tenant"
        ) {
            router.replace(getDashboardRouteForRole(user.role));
        }
    }, [isAuthenticated, isInitialized, user, router]);

    if (isInitialized && isAuthenticated && user && user.role !== "user") {
        return (
            <div className="flex min-h-screen items-center justify-center">
                Redirecting to your dashboard...
            </div>
        );
    }

    return <LandingPage />;
}
