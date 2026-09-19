"use client";

import { useAppSelector } from "@/src/store/hook";
import AdminDashboard from "../admin-dasboard/components/AdminDashboard";


export default function DashboardRouter() {
    const user = useAppSelector((state) => state.auth.user);

    if (!user) {
        return null;
    }

    switch (user.role) {
        case "admin":
            return <AdminDashboard />;





        default:
            return null;
    }
}