import TenantDashboardRouteGuard from "@/src/modules/dashboard/tenant-dashboard/components/TenantDashboardRouteGuard";
import TenantRentalPage from "@/src/modules/dashboard/tenant-dashboard/components/rental-page";

export default function TenantRentalRoutePage() {
    return (
        <TenantDashboardRouteGuard>
            <TenantRentalPage />
        </TenantDashboardRouteGuard>
    );
}
