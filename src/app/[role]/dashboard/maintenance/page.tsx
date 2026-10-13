"use client";

import { useParams } from "next/navigation";
import TenantDashboardRouteGuard from "@/src/modules/dashboard/tenant-dashboard/components/TenantDashboardRouteGuard";
import { OwnerMaintenanceView, TenantMaintenanceView } from "@/src/modules/maintenance";

export default function MaintenanceRoutePage() {
    const params = useParams<{ role: string }>();
    const role = params?.role;

    if (role === "owner") {
        return <OwnerMaintenanceView />;
    }

    return (
        <TenantDashboardRouteGuard>
            <TenantMaintenanceView />
        </TenantDashboardRouteGuard>
    );
}
