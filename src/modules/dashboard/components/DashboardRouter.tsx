"use client";

import { useAppSelector } from "@/src/store/hook";
import AdminDashboard from "../admin-dasboard/components/AdminDashboard";
import OwnerDashboard from "../owner-dashboard/components/ownerDashboard";
import TenantDashboard from "../tenant-dashboard/components/tenantDashboard";


export default function DashboardRouter() {
    const user = useAppSelector((state) => state.auth.user);

    if (!user) {
        return null;
    }

    switch (user.role) {
        case "admin":
            return <AdminDashboard />;
        case "owner":
            return <OwnerDashboard />;
        case "tenant":
            return <TenantDashboard />
        default:
            return null;
    }
}