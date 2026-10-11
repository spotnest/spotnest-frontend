"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { dashboardPathForRole } from "@/src/constants/routes";

export default function TenantDashboardRouteGuard({ children }: { children: ReactNode }) {
    const { role } = useParams<{ role: string }>();
    const router = useRouter();

    useEffect(() => {
        if (role !== "tenant") {
            router.replace(dashboardPathForRole(role));
        }
    }, [role, router]);

    return role === "tenant" ? children : null;
}
