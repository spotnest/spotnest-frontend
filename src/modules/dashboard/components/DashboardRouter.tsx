"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Loader2 } from "lucide-react";

import { useAppDispatch, useAppSelector } from "@/src/store/hook";
import { userUpdated } from "@/src/store/slices/authSlice";
import { getCurrentUser } from "@/src/modules/auth/services/authServices";

import AdminDashboard from "../admin-dasboard/components/AdminDashboard";
import OwnerDashboard from "../owner-dashboard/components/ownerDashboard";
import TenantDashboard from "../tenant-dashboard/tenantDashboard";

export default function DashboardRouter() {
    const router = useRouter();
    const params = useParams<{ role?: string }>();
    const dispatch = useAppDispatch();
    const user = useAppSelector((state) => state.auth.user);
    const [isVerifyingRole, setIsVerifyingRole] = useState(false);

    useEffect(() => {
        if (!user) return;

        // If Redux says role is still 'user', check if backend promoted user to tenant/owner
        if (user.role === "user") {
            setIsVerifyingRole(true);
            getCurrentUser()
                .then((res) => {
                    if (res?.user && res.user.role !== "user") {
                        dispatch(userUpdated(res.user));
                    } else {
                        router.replace("/properties");
                    }
                })
                .catch(() => {
                    router.replace("/properties");
                })
                .finally(() => {
                    setIsVerifyingRole(false);
                });
        }
    }, [user, router, dispatch, params]);

    if (!user || isVerifyingRole) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-[#00696b]" />
            </div>
        );
    }

    if (user.role === "user") {
        return (
            <div className="flex min-h-screen items-center justify-center text-sm font-medium text-[#75777e]">
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
