import DashboardShell from "@/src/modules/dashboard/admin-dasboard/components/DashboardShell";
import AdminDashboard from "@/src/modules/dashboard/admin-dasboard/components/AdminDashboard";

export default function DashboardPage() {
  return (
    <DashboardShell>
      <AdminDashboard />
    </DashboardShell>
  );
}