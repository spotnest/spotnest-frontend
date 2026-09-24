"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/src/store/hook";

import AdminDashboard from "../admin-dasboard/components/AdminDashboard";
import OwnerDashboard from "../owner-dashboard/components/ownerDashboard";
import TenantDashboard from "../tenant-dashboard/components/tenantDashboard";

export default function DashboardRouter() {
    const router = useRouter();
    const user = useAppSelector((state) => state.auth.user);

    useEffect(() => {
        if (user?.role === "user") {
            router.replace("/properties");
        }
    }, [user, router]);

    if (!user) {
        return null;
    }

    if (user.role === "user") {
        return (
            <div className="flex min-h-screen items-center justify-center">
                Redirecting...
            </div>
        );
    }

    switch (user.role) {
        case "admin":
            return <AdminDashboard />;

        case "owner":
            return <OwnerDashboard />;

        case "tenant":
            return <TenantDashboard />;

        default:
            return null;
    }
}
