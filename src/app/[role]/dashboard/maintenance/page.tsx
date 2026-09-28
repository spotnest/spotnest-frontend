import TenantDashboardRouteGuard from "@/src/modules/dashboard/tenant-dashboard/components/TenantDashboardRouteGuard";
import TenantMaintenancePage from "@/src/modules/dashboard/tenant-dashboard/components/maintenance-page";

export default function TenantMaintenanceRoutePage() {
    return (
        <TenantDashboardRouteGuard>
            <TenantMaintenancePage />
        </TenantDashboardRouteGuard>
    );
}
