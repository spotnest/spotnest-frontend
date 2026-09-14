import DashboardShell from "@/src/modules/dashboard/components/DashboardShell";
import AdminDashboard from "@/src/modules/dashboard/components/AdminDashboard";

export default function AdminDashboardPage() {
    return (
        <DashboardShell role="admin">
            <AdminDashboard />
        </DashboardShell>
    );
}

