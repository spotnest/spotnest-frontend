import { NotificationsPage } from "@/src/modules/notifications";
import type { UserRole } from "@/src/store/type";

type DashboardNotificationsPageProps = {
    params: Promise<{ role: string }>;
};

export default async function DashboardNotificationsPage({
    params,
}: DashboardNotificationsPageProps) {
    const { role } = await params;

    return <NotificationsPage role={role as UserRole} />;
}
