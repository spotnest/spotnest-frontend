import DashboardShell from "@/src/modules/dashboard/components/DashboardShell";
import AdminDashboard from "@/src/modules/dashboard/components/AdminDashboard";

export default function DashboardPage() {
    return (
        <DashboardShell role="admin">
            <AdminDashboard />
        </DashboardShell>
    );
}