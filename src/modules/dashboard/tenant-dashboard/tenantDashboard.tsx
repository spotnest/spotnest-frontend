"use client";

import Link from "next/link";
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

    return (
        <PageState loading={query.isLoading} error={query.error}>
            {!query.data?.rental ? (
                <div className="p-6 lg:p-10">
                    <p className="text-sm font-semibold text-[#00696b]">Tenant dashboard</p>
                    <h1 className="mt-1 text-3xl font-bold text-[#191c1d]">Welcome to SpotNest</h1>
                    <div className="mt-7"><EmptyRental /></div>
                </div>
            ) : (
                <TenantRentalDashboard data={query.data} rental={query.data.rental} />
            )}
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
                    <Link href="/payments" className="text-sm font-bold text-[#00696b] hover:underline">View payments</Link>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <Card title="Current rent" value={`${money(rental.monthlyRent)} / month`} />
                    <Card title="Security deposit" value={money(rental.securityDeposit)} detail={summary?.depositStatus === "paid" ? "Paid" : "Payment status unavailable"} />
                    <Card title="Recent payment" value={summary?.recentPayment ? money(summary.recentPayment.amount) : "—"} detail={summary?.recentPayment ? `Paid on ${date(summary.recentPayment.paidAt)}` : "No completed payments"} />
                    <Card title="Payment due" value={summary?.nextPayment ? money(summary.nextPayment.amount) : "No pending payment"} detail={summary?.nextPayment ? `Due ${date(summary.nextPayment.dueDate)}` : undefined}>
                        {summary?.nextPayment && <div className="mt-3"><Status value={summary.nextPayment.status} /></div>}
                    </Card>
                </div>
            </section>
            <section>
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-[#191c1d]">Recent activity</h2>
                    <Link href="/maintenance" className="text-sm font-bold text-[#00696b] hover:underline">Maintenance</Link>
                </div>
                {maintenance.length ? <MaintenanceList requests={maintenance} /> : <div className="rounded-2xl border border-dashed border-[#c5c6cd] bg-white p-6 text-sm text-[#75777e]">No recent maintenance activity.</div>}
            </section>
        </div>
    );
}
