"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/src/store/hook";
import { dashboardPathForRole } from "@/src/constants/routes";

export default function AuthLayout({ children }: { children: ReactNode }) {
    const router = useRouter();
    const { isAuthenticated, user } = useAppSelector((state) => state.auth);

    useEffect(() => {
        if (isAuthenticated) {
            router.replace(dashboardPathForRole(user?.role));
        }
    }, [isAuthenticated, user, router]);

    // If user is already authenticated, prevent displaying auth forms while redirect is in flight
    if (isAuthenticated) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#F7F5F0]">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#6C4CE6]/30 border-t-[#6C4CE6]" />
            </div>
        );
    }

    // Unauthenticated guests can view login, register, forgot-password, etc. immediately
    return <>{children}</>;
}
