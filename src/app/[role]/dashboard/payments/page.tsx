import TenantDashboardRouteGuard from "@/src/modules/dashboard/tenant-dashboard/components/TenantDashboardRouteGuard";
import TenantPaymentsPage from "@/src/modules/dashboard/tenant-dashboard/components/payments-page";

export default function TenantPaymentsRoutePage() {
    return (
        <TenantDashboardRouteGuard>
            <TenantPaymentsPage />
        </TenantDashboardRouteGuard>
    );
}
