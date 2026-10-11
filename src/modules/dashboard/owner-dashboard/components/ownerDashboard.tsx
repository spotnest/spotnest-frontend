"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { getMyProperties } from "@/src/modules/properties/services/propertyService";
import { formatPrice } from "@/src/modules/properties/utils/format";
import { RealtimeStatusNotice } from "@/src/components/common/RealtimeStatusNotice";
import { Status, date, money } from "../../tenant-dashboard/components/components";
import { useOwnerDashboard } from "../hooks/useOwnerDashboard";
import type { OwnerDashboardData } from "../types/ownerDashboard";

const statCard = "rounded-2xl border border-[#e1e3e4] bg-white p-5 shadow-xs";
const statLabel = "text-xs font-bold uppercase tracking-[0.12em] text-[#75777e]";

function StatCard({ label, value, detail, href, accent = false }: { label: string; value: string | number; detail?: string; href?: string; accent?: boolean }) {
    const body = (
        <>
            <p className={statLabel}>{label}</p>
            <p className={`mt-2 text-3xl font-bold tracking-tight ${accent ? "text-[#00696b]" : "text-[#191c1d]"}`}>{value}</p>
            {detail && <p className="mt-1 text-xs text-[#75777e]">{detail}</p>}
        </>
    );
    return href
        ? <Link href={href} className={`${statCard} block transition hover:border-[#00696b]/40 hover:bg-[#f8f9fa]`}>{body}</Link>
        : <div className={statCard}>{body}</div>;
}

function SummarySkeleton() {
    return (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Loading dashboard summary">
            {Array.from({ length: 4 }, (_, index) => (
                <div key={index} className={`${statCard} animate-pulse`}>
                    <div className="h-3 w-24 rounded bg-[#eef0f1]" />
                    <div className="mt-4 h-8 w-20 rounded bg-[#eef0f1]" />
                </div>
            ))}
        </div>
    );
}

function AttentionItems({ data }: { data: OwnerDashboardData }) {
    const items: Array<{ text: string; href: string }> = [];
    if (data.requests.pending > 0) {
        items.push({ text: `${data.requests.pending} rental request${data.requests.pending === 1 ? "" : "s"} waiting for your decision`, href: "/bookings" });
    }
    if (data.rentals.agreementsAwaitingConfirmation > 0) {
        const count = data.rentals.agreementsAwaitingConfirmation;
        items.push({ text: `${count} tenant agreement${count === 1 ? "" : "s"} accepted and waiting for your confirmation`, href: "/owner/rentals" });
    }
    if (data.payments.overdueCount > 0) {
        const count = data.payments.overdueCount;
        items.push({ text: `${count} rent payment${count === 1 ? " is" : "s are"} overdue`, href: "/owner/rentals" });
    }
    if (items.length === 0) return null;

    return (
        <section className="mt-6 rounded-2xl border border-[#f1d9b5] bg-[#fff6e8] p-5" aria-labelledby="owner-attention">
            <h2 id="owner-attention" className="text-sm font-bold text-[#7a4f12]">Needs your attention</h2>
            <ul className="mt-3 space-y-2">
                {items.map((item) => (
                    <li key={item.text}>
                        <Link href={item.href} className="text-sm font-medium text-[#5c3b0c] underline-offset-2 hover:underline">{item.text} →</Link>
                    </li>
                ))}
            </ul>
        </section>
    );
}

function RecentRequests({ data }: { data: OwnerDashboardData }) {
    return (
        <section className="rounded-2xl border border-[#e1e3e4] bg-white p-6 shadow-xs" aria-labelledby="owner-recent-requests">
            <div className="flex items-center justify-between">
                <h2 id="owner-recent-requests" className="text-lg font-bold tracking-tight text-[#191c1d]">New rental requests</h2>
                <Link href="/bookings" className="text-sm font-semibold text-[#00696b] transition hover:text-[#004f51]">Review →</Link>
            </div>
            {data.recentRequests.length === 0 ? (
                <p className="mt-6 border-t border-[#e1e3e4] pt-6 text-center text-sm text-[#75777e]">No pending rental requests.</p>
            ) : (
                <ul className="mt-4 divide-y divide-[#eef0f1]">
                    {data.recentRequests.map((request) => (
                        <li key={request.id} className="flex items-center justify-between gap-4 py-3">
                            <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-[#191c1d]">{request.propertyTitle}</p>
                                <p className="mt-0.5 truncate text-xs text-[#75777e]">{request.tenantName} · from {date(request.startDate)}</p>
                            </div>
                            <span className="shrink-0 text-sm font-bold text-[#00696b]">{formatPrice(request.monthlyRent)}</span>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}

function RecentPayments({ data }: { data: OwnerDashboardData }) {
    return (
        <section className="rounded-2xl border border-[#e1e3e4] bg-white p-6 shadow-xs" aria-labelledby="owner-recent-payments">
            <div className="flex items-center justify-between">
                <h2 id="owner-recent-payments" className="text-lg font-bold tracking-tight text-[#191c1d]">Payment activity</h2>
                <Link href="/owner/rentals" className="text-sm font-semibold text-[#00696b] transition hover:text-[#004f51]">Rentals →</Link>
            </div>
            {data.recentPayments.length === 0 ? (
                <p className="mt-6 border-t border-[#e1e3e4] pt-6 text-center text-sm text-[#75777e]">No payments yet.</p>
            ) : (
                <ul className="mt-4 divide-y divide-[#eef0f1]">
                    {data.recentPayments.map((payment) => (
                        <li key={payment.id} className="flex items-center justify-between gap-4 py-3">
                            <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-[#191c1d]">
                                    {payment.type === "ADVANCE" ? "Advance" : `Rent${payment.billingMonth ? ` · ${payment.billingMonth}` : ""}`} — {payment.propertyTitle}
                                </p>
                                <p className="mt-0.5 truncate text-xs text-[#75777e]">
                                    {payment.tenantName} · {payment.paidAt ? `paid ${date(payment.paidAt)}` : payment.dueDate ? `due ${date(payment.dueDate)}` : `updated ${date(payment.updatedAt)}`}
                                </p>
                            </div>
                            <div className="flex shrink-0 items-center gap-3">
                                <span className="text-sm font-bold text-[#191c1d]">{money(payment.amount)}</span>
                                <Status value={payment.status.toLowerCase()} />
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}

export default function OwnerDashboard() {
    const summaryQuery = useOwnerDashboard();
    const propertiesQuery = useQuery({
        queryKey: ["owner-properties"],
        queryFn: getMyProperties,
    });

    const summary = summaryQuery.data;
    const properties = propertiesQuery.data ?? [];
    const recent = [...properties]
        .sort(
            (a, b) =>
                new Date(b.updated_at ?? b.created_at).getTime() -
                new Date(a.updated_at ?? a.created_at).getTime()
        )
        .slice(0, 3);

    return (
        <div className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6 sm:py-10 lg:px-10 lg:py-12">
            <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#00696b]">
                        Owner Portal
                    </p>
                    <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#191c1d] sm:text-4xl">
                        Property Owner Dashboard
                    </h1>
                    <p className="mt-2 text-base text-[#44474d]">
                        Manage your listed properties, review tenant applications, and monitor rental earnings.
                    </p>
                </div>

                <div className="flex flex-wrap gap-3">
                    <Link
                        href="/owner/rentals"
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#00696b] bg-[#d9f4f3]/40 px-5 py-3 text-sm font-semibold text-[#00696b] shadow-xs transition hover:bg-[#d9f4f3]"
                    >
                        <span>Rental Management</span>
                    </Link>
                    <Link
                        href="/owner/properties/new"
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#00696b] px-5 py-3 text-sm font-semibold text-white shadow-xs transition hover:bg-[#004f51]"
                    >
                        <span>Add a property</span>
                    </Link>
                </div>
            </section>

            <RealtimeStatusNotice className="mt-6" />

            <section className="mt-8" aria-label="Rental summary">
                {summaryQuery.isLoading ? (
                    <SummarySkeleton />
                ) : summaryQuery.isError || !summary ? (
                    <div className="rounded-2xl border border-[#e1e3e4] bg-white p-6 text-sm">
                        <p className="font-semibold text-[#ba1a1a]">Unable to load your rental summary.</p>
                        <button type="button" onClick={() => summaryQuery.refetch()} className="mt-2 text-xs font-bold text-[#00696b]">Try again</button>
                    </div>
                ) : (
                    <>
                        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                            <StatCard
                                label="Pending requests"
                                value={summary.requests.pending}
                                detail={summary.requests.awaitingAdvance > 0 ? `${summary.requests.awaitingAdvance} approved, awaiting advance` : "Waiting for your review"}
                                href="/bookings"
                                accent={summary.requests.pending > 0}
                            />
                            <StatCard
                                label="Active rentals"
                                value={summary.rentals.active}
                                detail={summary.rentals.scheduled > 0 ? `${summary.rentals.scheduled} scheduled to start` : "Currently occupied"}
                                href="/owner/rentals"
                            />
                            <StatCard
                                label="Received this month"
                                value={money(summary.payments.receivedThisMonth)}
                                detail={`${money(summary.payments.totalReceived)} received in total`}
                                accent
                            />
                            <StatCard
                                label="Outstanding rent"
                                value={money(summary.payments.outstandingRent)}
                                detail={summary.payments.overdueCount > 0 ? `${summary.payments.overdueCount} overdue` : "Nothing overdue"}
                                href="/owner/rentals"
                            />
                        </div>
                        <AttentionItems data={summary} />
                    </>
                )}
            </section>

            {summary && (
                <section className="mt-8 grid gap-6 lg:grid-cols-2">
                    <RecentRequests data={summary} />
                    <RecentPayments data={summary} />
                </section>
            )}

            <section className="mt-8 grid gap-4 sm:grid-cols-3" aria-label="Listing summary">
                <StatCard label="Active listings" value={summary?.properties.active ?? "—"} detail="Visible to tenants now" accent />
                <StatCard label="Inactive listings" value={summary?.properties.inactive ?? "—"} detail="Hidden until you activate them" />
                <StatCard label="Total properties" value={summary?.properties.total ?? "—"} detail="All time" />
            </section>

            <section className="mt-8 rounded-2xl border border-[#e1e3e4] bg-white p-6 shadow-xs">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold tracking-tight text-[#191c1d]">
                        Recent listings
                    </h2>
                    <Link
                        href="/owner/properties"
                        className="text-sm font-semibold text-[#00696b] transition hover:text-[#004f51]"
                    >
                        Manage all →
                    </Link>
                </div>

                {propertiesQuery.isLoading ? (
                    <p className="mt-4 text-sm text-[#75777e]">Loading…</p>
                ) : propertiesQuery.isError ? (
                    <p className="mt-4 text-sm text-[#ba1a1a]">Unable to load your listings.</p>
                ) : recent.length === 0 ? (
                    <div className="mt-6 border-t border-[#e1e3e4] pt-6 text-center">
                        <p className="text-sm font-semibold text-[#191c1d]">
                            No properties yet
                        </p>
                        <p className="mt-1 text-xs text-[#75777e]">
                            List your first property to start receiving tenant enquiries.
                        </p>
                        <Link
                            href="/owner/properties/new"
                            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#00696b] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#004f51]"
                        >
                            Add a property
                        </Link>
                    </div>
                ) : (
                    <ul className="mt-4 divide-y divide-[#eef0f1]">
                        {recent.map((property) => (
                            <li key={property._id}>
                                <Link
                                    href={`/owner/properties/${property._id}/edit`}
                                    className="flex items-center justify-between gap-4 py-4 transition hover:bg-[#f8f9fa]"
                                >
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-semibold text-[#191c1d]">
                                            {property.title}
                                        </p>
                                        <p className="mt-0.5 truncate text-xs text-[#75777e]">
                                            {property.address.city}, {property.address.state}
                                        </p>
                                    </div>

                                    <div className="flex shrink-0 items-center gap-3">
                                        <span className="text-sm font-bold text-[#00696b]">
                                            {formatPrice(property.price)}
                                        </span>
                                        <span
                                            className={`rounded-full px-2.5 py-1 text-[11px] font-bold capitalize ${
                                                property.status === "active"
                                                    ? "bg-[#d9f4f3] text-[#00696b]"
                                                    : property.status === "inactive"
                                                      ? "bg-[#fff0dc] text-[#95611d]"
                                                      : "bg-[#eef0f1] text-[#44474d]"
                                            }`}
                                        >
                                            {property.status}
                                        </span>
                                    </div>
                                </Link>
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </div>
    );
}
