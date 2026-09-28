"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { dashboardNotificationsPathForRole } from "@/src/constants/routes";
import { useAppSelector } from "@/src/store/hook";

export default function NotificationsRedirectPage() {
    const router = useRouter();
    const { isAuthenticated, isInitialized, user } = useAppSelector((state) => state.auth);

    useEffect(() => {
        if (!isInitialized) return;

        if (!isAuthenticated || !user) {
            router.replace("/login");
            return;
        }

        if (user.role === "admin" || user.role === "owner" || user.role === "tenant") {
            router.replace(dashboardNotificationsPathForRole(user.role));
            return;
        }

        router.replace("/properties");
    }, [isAuthenticated, isInitialized, router, user]);

    return (
        <div className="flex min-h-[40vh] items-center justify-center" aria-label="Redirecting to notifications">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#00696b]/30 border-t-[#00696b]" />
        </div>
    );
}
