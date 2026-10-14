"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import DashboardShell from "@/src/modules/dashboard/components/DashboardShell";
import {
    getAdminPayments,
    type AdminPaymentItem,
} from "@/src/modules/payments/services/paymentService";
import { dashboardPathForRole } from "@/src/constants/routes";
import { useAppSelector } from "@/src/store/hook";

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(amount);
};

const formatDate = (dateStr?: string) => {
    if (!dateStr) return "—";
    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) return dateStr;
    return new Intl.DateTimeFormat("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
    }).format(date);
};

function PaymentStatusBadge({ status }: { status: AdminPaymentItem["status"] }) {
    const styles: Record<AdminPaymentItem["status"], string> = {
        PAID: "bg-[#dcfce7] text-[#15803d] border-[#86efac]",
        PENDING: "bg-[#fef3c7] text-[#b45309] border-[#fde68a]",
        OVERDUE: "bg-[#fee2e2] text-[#b91c1c] border-[#fca5a5]",
        FAILED: "bg-[#fef2f2] text-[#991b1b] border-[#fecaca]",
        REFUNDED: "bg-[#f1f5f9] text-[#475569] border-[#cbd5e1]",
    };

    return (
        <span
            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider ${
                styles[status] ?? styles.PENDING
            }`}
        >
            {status}
        </span>
    );
}

export default function AdminPaymentsPage() {
    const router = useRouter();
    const { user, isInitialized } = useAppSelector((state) => state.auth);
    const isAdmin = user?.role === "admin";

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [typeFilter, setTypeFilter] = useState("all");

    useEffect(() => {
        if (!isInitialized) return;
        if (!user) {
            router.replace("/login");
            return;
        }
        if (!isAdmin) {
            router.replace(dashboardPathForRole(user.role));
        }
    }, [isInitialized, isAdmin, router, user]);

    const paymentsQuery = useQuery({
        queryKey: ["admin-payments"],
        queryFn: () => getAdminPayments(),
        enabled: isInitialized && isAdmin,
    });

    const summary = paymentsQuery.data?.summary;
    const paymentsList = paymentsQuery.data?.payments || [];

    const filteredPayments = useMemo(() => {
        return paymentsList.filter((p) => {
            if (statusFilter !== "all" && p.status !== statusFilter) return false;
            if (typeFilter !== "all" && p.type !== typeFilter) return false;

            if (search.trim()) {
                const term = search.toLowerCase();
                const tenantName = p.tenant?.name?.toLowerCase() || "";
                const tenantEmail = p.tenant?.email?.toLowerCase() || "";
                const propertyTitle = p.property?.title?.toLowerCase() || "";
                const orderId = p.razorpayOrderId?.toLowerCase() || "";
                const paymentId = p.razorpayPaymentId?.toLowerCase() || "";

                if (
                    !tenantName.includes(term) &&
                    !tenantEmail.includes(term) &&
                    !propertyTitle.includes(term) &&
                    !orderId.includes(term) &&
                    !paymentId.includes(term)
                ) {
                    return false;
                }
            }
            return true;
        });
    }, [paymentsList, statusFilter, typeFilter, search]);

    if (!isInitialized || !user || !isAdmin) {
        return null;
    }

    return (
        <DashboardShell role="admin">
            <main className="mx-auto max-w-[1500px] px-4 py-7 sm:px-6 sm:py-9 lg:px-10 lg:py-10">
                <div>
                    <p className="text-sm font-semibold text-[#00696b]">Admin workspace</p>
                    <h1 className="mt-1 text-3xl font-bold tracking-tight text-[#191c1d]">Payments & Transactions</h1>
                    <p className="mt-1 text-sm text-[#44474d]">
                        Complete financial audit: monitor Razorpay transactions, advance deposits, monthly rents, and ₹50/day late fees.
                    </p>
                </div>

                {/* Metrics */}
                <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                    <div className="rounded-2xl border border-[#e1e3e4] bg-white p-4">
                        <p className="text-xs font-semibold uppercase text-[#75777e]">Total Paid Volume</p>
                        <p className="mt-2 text-2xl font-bold text-[#00696b]">
                            {formatCurrency(summary?.totalPaid ?? 0)}
                        </p>
                    </div>
                    <div className="rounded-2xl border border-[#e1e3e4] bg-white p-4">
                        <p className="text-xs font-semibold uppercase text-[#0369a1]">Advance Deposits</p>
                        <p className="mt-2 text-2xl font-bold text-[#0369a1]">
                            {formatCurrency(summary?.totalAdvancePaid ?? 0)}
                        </p>
                    </div>
                    <div className="rounded-2xl border border-[#e1e3e4] bg-white p-4">
                        <p className="text-xs font-semibold uppercase text-[#5b21b6]">Monthly Rent Paid</p>
                        <p className="mt-2 text-2xl font-bold text-[#5b21b6]">
                            {formatCurrency(summary?.totalRentPaid ?? 0)}
                        </p>
                    </div>
                    <div className="rounded-2xl border border-[#fde68a] bg-[#fffbeb] p-4">
                        <p className="text-xs font-semibold uppercase text-[#b45309]">Late Fees Accrued</p>
                        <p className="mt-2 text-2xl font-bold text-[#b45309]">
                            {formatCurrency(summary?.totalLateFees ?? 0)}
                        </p>
                        <p className="mt-0.5 text-[10px] text-[#92400e]">₹50/day overdue fines</p>
                    </div>
                    <div className="rounded-2xl border border-[#e1e3e4] bg-white p-4">
                        <p className="text-xs font-semibold uppercase text-[#15803d]">Paid Transactions</p>
                        <p className="mt-2 text-2xl font-bold text-[#15803d]">{summary?.paidCount ?? 0}</p>
                    </div>
                    <div className="rounded-2xl border border-[#e1e3e4] bg-white p-4">
                        <p className="text-xs font-semibold uppercase text-[#b91c1c]">Overdue / Pending</p>
                        <p className="mt-2 text-2xl font-bold text-[#b91c1c]">
                            {(summary?.overdueCount ?? 0) + (summary?.pendingCount ?? 0)}
                        </p>
                    </div>
                </div>

                {/* Filters */}
                <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-[#e1e3e4] bg-white p-4 sm:flex-row sm:items-center">
                    <input
                        type="text"
                        placeholder="Search by tenant, property, or Razorpay ID..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="h-11 flex-1 rounded-xl border border-[#c5c6cd] px-3 text-sm text-[#191c1d] outline-none transition focus:border-[#00696b] focus:ring-2 focus:ring-[#d9f4f3]"
                    />
                    <div className="flex gap-2">
                        <select
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                            aria-label="Filter by payment type"
                            className="h-11 rounded-xl border border-[#c5c6cd] bg-white px-3 text-sm font-semibold text-[#44474d] outline-none focus:border-[#00696b]"
                        >
                            <option value="all">All Types</option>
                            <option value="ADVANCE">Advance Payments</option>
                            <option value="MONTHLY_RENT">Monthly Rent</option>
                        </select>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            aria-label="Filter by payment status"
                            className="h-11 rounded-xl border border-[#c5c6cd] bg-white px-3 text-sm font-semibold text-[#44474d] outline-none focus:border-[#00696b]"
                        >
                            <option value="all">All Statuses</option>
                            <option value="PAID">Paid</option>
                            <option value="PENDING">Pending</option>
                            <option value="OVERDUE">Overdue</option>
                            <option value="FAILED">Failed</option>
                        </select>
                    </div>
                </div>

                {/* Payments Table */}
                <section className="mt-6 overflow-hidden rounded-2xl border border-[#e1e3e4] bg-white shadow-sm">
                    {paymentsQuery.isLoading ? (
                        <div className="px-5 py-12 text-center text-sm text-[#75777e]">Loading transactions...</div>
                    ) : paymentsQuery.isError ? (
                        <div className="px-5 py-8 text-center text-sm text-[#b42318]">
                            Unable to load payments.
                            <button
                                type="button"
                                onClick={() => paymentsQuery.refetch()}
                                className="ml-2 font-bold underline"
                            >
                                Retry
                            </button>
                        </div>
                    ) : filteredPayments.length === 0 ? (
                        <div className="px-5 py-12 text-center text-sm text-[#75777e]">
                            No payments match your criteria.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[1000px] border-collapse text-left">
                                <thead>
                                    <tr className="border-b border-[#eef0f1] bg-[#fafafa] text-[11px] font-bold uppercase tracking-[0.1em] text-[#75777e]">
                                        <th className="px-5 py-4">Transaction / Order</th>
                                        <th className="px-4 py-4">Type</th>
                                        <th className="px-4 py-4">Property</th>
                                        <th className="px-4 py-4">Tenant</th>
                                        <th className="px-4 py-4">Amount</th>
                                        <th className="px-4 py-4">Due Date</th>
                                        <th className="px-4 py-4">Status</th>
                                        <th className="px-5 py-4 text-right">Paid On</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredPayments.map((p) => {
                                        const lateFee = p.lateFeeApplied ?? 0;
                                        return (
                                            <tr
                                                key={p._id}
                                                className="border-b border-[#eef0f1] transition hover:bg-[#fafafa] last:border-0"
                                            >
                                                <td className="px-5 py-4">
                                                    <p className="font-mono text-xs font-bold text-[#191c1d]">
                                                        {p.razorpayPaymentId || p.razorpayOrderId || p._id.slice(-8)}
                                                    </p>
                                                    {p.razorpayOrderId && (
                                                        <p className="mt-0.5 font-mono text-[10px] text-[#75777e]">
                                                            Order: {p.razorpayOrderId}
                                                        </p>
                                                    )}
                                                </td>
                                                <td className="px-4 py-4">
                                                    <span className="inline-flex rounded-md bg-[#f1f5f9] px-2 py-0.5 text-xs font-semibold text-[#475569]">
                                                        {p.type === "ADVANCE" ? "Advance Deposit" : "Monthly Rent"}
                                                    </span>
                                                    {p.billingMonth && (
                                                        <p className="mt-0.5 text-[10px] text-[#75777e]">
                                                            Month: {p.billingMonth}
                                                        </p>
                                                    )}
                                                </td>
                                                <td className="px-4 py-4">
                                                    <p className="max-w-[180px] truncate text-sm font-semibold text-[#191c1d]">
                                                        {p.property?.title || "Property unavailable"}
                                                    </p>
                                                    <p className="truncate text-xs text-[#75777e]">
                                                        {p.property?.address?.city || "—"}
                                                    </p>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <p className="text-sm font-semibold text-[#191c1d]">
                                                        {p.tenant?.name || "Tenant unavailable"}
                                                    </p>
                                                    <p className="text-xs text-[#75777e]">{p.tenant?.email || "—"}</p>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <p className="text-sm font-bold text-[#191c1d]">
                                                        {formatCurrency(p.amount)}
                                                    </p>
                                                    {lateFee > 0 && (
                                                        <p className="text-[10px] font-semibold text-[#b45309]">
                                                            +{formatCurrency(lateFee)} late fee
                                                        </p>
                                                    )}
                                                </td>
                                                <td className="px-4 py-4 text-xs text-[#75777e]">
                                                    {formatDate(p.dueDate)}
                                                </td>
                                                <td className="px-4 py-4">
                                                    <PaymentStatusBadge status={p.status} />
                                                </td>
                                                <td className="px-5 py-4 text-right text-xs text-[#75777e]">
                                                    {p.paidAt ? formatDate(p.paidAt) : <span className="text-[#94a3b8]">—</span>}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            </main>
        </DashboardShell>
    );
}

