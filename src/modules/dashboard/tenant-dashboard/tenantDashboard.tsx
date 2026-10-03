"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/src/store/hook";
import { tenantDashboardRoutes } from "@/src/constants/routes";
import { NotificationList } from "@/src/modules/notifications/components/NotificationList";
import { useMarkNotificationAsRead, useNotifications } from "@/src/modules/notifications/hooks/useNotifications";
import type { Notification } from "@/src/modules/notifications/types/notification";
import {
    Card,
    EmptyRental,
    MaintenanceList,
    PageState,
    RentalHero,
    Status,
    date,
    money,
} from "./components/components";
import { useTenantDashboard } from "./hooks/hooks";
import type { TenantDashboardData, TenantRental } from "./types/types";

export default function TenantDashboard() {
    const query = useTenantDashboard();
    const notificationsQuery = useNotifications();
    const markNotificationAsRead = useMarkNotificationAsRead();
    const user = useAppSelector((state) => state.auth.user);
    const userId = user?.id;
    const router = useRouter();

    const handleNotificationClick = (notification: Notification) => {
        if (!notification.isRead && userId) {
            if (user?.role) markNotificationAsRead.mutate({ notificationId: notification.id, userId, role: user.role });
        }
        if (notification.targetUrl) {
            router.push(notification.targetUrl);
        }
    };

    return (
        <PageState loading={query.isLoading} error={query.error}>
            <div className="space-y-8">
                {!query.data?.rental ? (
                    <div className="p-6 lg:p-10">
                        <p className="text-sm font-semibold text-[#00696b]">Tenant dashboard</p>
                        <h1 className="mt-1 text-3xl font-bold text-[#191c1d]">Welcome to SpotNest</h1>
                        <div className="mt-7"><EmptyRental /></div>
                    </div>
                ) : (
                    <TenantRentalDashboard data={query.data} rental={query.data.rental} />
                )}

                <section className="px-6 pb-8 lg:px-10" aria-labelledby="tenant-recent-notifications">
                    <div className="mb-4 flex items-center justify-between">
                        <h2 id="tenant-recent-notifications" className="text-xl font-bold text-[#191c1d]">Recent notifications</h2>
                        <Link href={tenantDashboardRoutes.notifications} className="text-sm font-bold text-[#00696b] hover:underline">View all</Link>
                    </div>
                    <div className="overflow-hidden rounded-2xl border border-[#e1e3e4] bg-white">
                        {notificationsQuery.isLoading ? (
                            <p className="px-5 py-8 text-sm text-[#75777e]">Loading notifications...</p>
                        ) : notificationsQuery.isError ? (
                            <p className="px-5 py-8 text-sm text-[#ba1a1a]">Unable to load notifications.</p>
                        ) : (
                            <NotificationList
                                notifications={(notificationsQuery.data ?? []).slice(0, 5)}
                                onNotificationClick={handleNotificationClick}
                                compact
                            />
                        )}
                    </div>
                </section>
            </div>
        </PageState>
    );
}

function TenantRentalDashboard({
    data,
    rental,
}: {
    data: TenantDashboardData;
    rental: TenantRental;
}) {
    const { payments, maintenance } = data;
    const summary = payments.summary;

    return (
        <div className="space-y-8 p-6 lg:p-10">
            <div>
                <p className="text-sm font-semibold text-[#00696b]">Tenant dashboard</p>
                <h1 className="mt-1 text-3xl font-bold text-[#191c1d]">Your rental at a glance</h1>
                <p className="mt-2 text-sm text-[#75777e]">Your lease, payment standing and maintenance updates.</p>
            </div>
            <RentalHero rental={rental} />
            <section>
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-[#191c1d]">Payment summary</h2>
                    <Link href={tenantDashboardRoutes.payments} className="text-sm font-bold text-[#00696b] hover:underline">View payments</Link>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <Card title="Current rent" value={`${money(rental.monthlyRent)} / month`} />
                    <Card title="Advance payment" value={money(rental.securityDeposit)} detail={summary ? (summary.depositStatus === "paid" ? "Paid" : "Unpaid") : "Payment status unavailable"} />
                    <Card title="Recent payment" value={summary?.recentPayment ? money(summary.recentPayment.amount) : "—"} detail={summary?.recentPayment ? `Paid on ${date(summary.recentPayment.paidAt)}` : "No completed payments"} />
                    <Card title="Payment due" value={summary?.nextPayment ? money(summary.nextPayment.amount) : "No pending payment"} detail={summary?.nextPayment ? `Due ${date(summary.nextPayment.dueDate)}` : undefined}>
                        {summary?.nextPayment && <div className="mt-3"><Status value={summary.nextPayment.status} /></div>}
                    </Card>
                </div>
            </section>
            <section>
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-[#191c1d]">Recent activity</h2>
                    <Link href={tenantDashboardRoutes.maintenance} className="text-sm font-bold text-[#00696b] hover:underline">Maintenance</Link>
                </div>
                {maintenance.length ? <MaintenanceList requests={maintenance} /> : <div className="rounded-2xl border border-dashed border-[#c5c6cd] bg-white p-6 text-sm text-[#75777e]">No recent maintenance activity.</div>}
            </section>
        </div>
    );
}
