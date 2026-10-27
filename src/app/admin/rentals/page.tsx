"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import DashboardShell from "@/src/modules/dashboard/components/DashboardShell";
import {
    getAdminRentals,
    adminTerminateRental,
    type AdminRentalItem,
} from "@/src/modules/rentals/services/rentalService";
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
    return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(date);
};

export default function AdminRentalsPage() {
    const router = useRouter();
    const queryClient = useQueryClient();

    const { user, isInitialized } = useAppSelector((state) => state.auth);
    const isAdmin = user?.role === "admin";

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    // Terminate modal state
    const [terminatingRental, setTerminatingRental] = useState<AdminRentalItem | null>(null);
    const [terminateReason, setTerminateReason] = useState("");

    const [feedback, setFeedback] = useState("");
    const [error, setError] = useState("");

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

    const rentalsQuery = useQuery({
        queryKey: ["admin-rentals"],
        queryFn: () => getAdminRentals(),
        enabled: isInitialized && isAdmin,
    });

    const terminateMutation = useMutation({
        mutationFn: ({ rentalId, reason }: { rentalId: string; reason: string }) =>
            adminTerminateRental(rentalId, reason),
        onSuccess: (data) => {
            setFeedback(data.message || "Rental lease terminated successfully.");
            setError("");
            setTerminatingRental(null);
            setTerminateReason("");
            queryClient.invalidateQueries({ queryKey: ["admin-rentals"] });
            queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] });
        },
        onError: (err: unknown) => {
            setError(
                (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
                    "Failed to terminate rental."
            );
        },
    });

    const handleConfirmTerminate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!terminatingRental) return;
        terminateMutation.mutate({
            rentalId: terminatingRental.id,
            reason: terminateReason.trim() || "Terminated by platform administrator",
        });
    };

    const stats = useMemo(() => {
        const list = rentalsQuery.data || [];
        return {
            total: list.length,
            active: list.filter((r) => r.status.toLowerCase() === "active").length,
            gracePeriod: list.filter((r) => r.isGracePeriodActive).length,
            terminated: list.filter((r) => r.status.toLowerCase() === "terminated" || r.status.toLowerCase() === "cancelled").length,
            totalMonthlyRent: list
                .filter((r) => r.status.toLowerCase() === "active")
                .reduce((acc, curr) => acc + (curr.monthlyRent || 0), 0),
        };
    }, [rentalsQuery.data]);

    const filteredRentals = useMemo(() => {
        if (!rentalsQuery.data) return [];
        return rentalsQuery.data.filter((r) => {
            if (statusFilter === "grace_period" && !r.isGracePeriodActive) return false;
            if (statusFilter !== "all" && statusFilter !== "grace_period" && r.status.toLowerCase() !== statusFilter) return false;

            if (search.trim()) {
                const term = search.toLowerCase();
                const propertyTitle = r.property?.title?.toLowerCase() || "";
                const ownerName = r.owner?.name?.toLowerCase() || "";
                const tenantName = r.occupants?.[0]?.tenant?.name?.toLowerCase() || "";
                if (!propertyTitle.includes(term) && !ownerName.includes(term) && !tenantName.includes(term)) {
                    return false;
                }
            }
            return true;
        });
    }, [rentalsQuery.data, statusFilter, search]);

    if (!isInitialized || !user || !isAdmin) {
        return null;
    }

    return (
        <DashboardShell role="admin">
            <main className="mx-auto max-w-[1500px] px-4 py-7 sm:px-6 sm:py-9 lg:px-10 lg:py-10">
                <div>
                    <p className="text-sm font-semibold text-[#00696b]">Admin workspace</p>
                    <h1 className="mt-1 text-3xl font-bold tracking-tight text-[#191c1d]">Rentals & Leases</h1>
                    <p className="mt-1 text-sm text-[#44474d]">
                        Monitor active tenancies, 3-day post-lease grace periods, rental agreements, payment statuses, and lease terminations.
                    </p>
                </div>

                {feedback && (
                    <div className="mt-4 flex items-center justify-between rounded-xl border border-[#9bd9d6] bg-[#d9f4f3] px-4 py-3 text-sm font-semibold text-[#00696b]">
                        <span>{feedback}</span>
                        <button type="button" onClick={() => setFeedback("")} className="text-xs uppercase hover:underline">
                            Dismiss
                        </button>
                    </div>
                )}
                {error && (
                    <div className="mt-4 flex items-center justify-between rounded-xl border border-[#f0b5ae] bg-[#fff0ee] px-4 py-3 text-sm font-semibold text-[#b42318]">
                        <span>{error}</span>
                        <button type="button" onClick={() => setError("")} className="text-xs uppercase hover:underline">
                            Dismiss
                        </button>
                    </div>
                )}

                {/* Metrics */}
                <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                    <div className="rounded-2xl border border-[#e1e3e4] bg-white p-4">
                        <p className="text-xs font-semibold uppercase text-[#75777e]">Total Leases</p>
                        <p className="mt-2 text-2xl font-bold text-[#191c1d]">{stats.total}</p>
                    </div>
                    <div className="rounded-2xl border border-[#e1e3e4] bg-white p-4">
                        <p className="text-xs font-semibold uppercase text-[#00696b]">Active Tenancies</p>
                        <p className="mt-2 text-2xl font-bold text-[#00696b]">{stats.active}</p>
                    </div>
                    <div className="rounded-2xl border border-[#fde68a] bg-[#fffbeb] p-4">
                        <p className="text-xs font-semibold uppercase text-[#b45309]">3-Day Grace Period</p>
                        <p className="mt-2 text-2xl font-bold text-[#b45309]">{stats.gracePeriod}</p>
                        <p className="mt-0.5 text-[10px] text-[#92400e]">Rentals in post-lease window</p>
                    </div>
                    <div className="rounded-2xl border border-[#e1e3e4] bg-white p-4">
                        <p className="text-xs font-semibold uppercase text-[#75777e]">Terminated / Expired</p>
                        <p className="mt-2 text-2xl font-bold text-[#64748b]">{stats.terminated}</p>
                    </div>
                    <div className="rounded-2xl border border-[#e1e3e4] bg-white p-4">
                        <p className="text-xs font-semibold uppercase text-[#00696b]">Active Monthly Rent</p>
                        <p className="mt-2 text-2xl font-bold text-[#191c1d]">{formatCurrency(stats.totalMonthlyRent)}</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-[#e1e3e4] bg-white p-4 sm:flex-row sm:items-center">
                    <input
                        type="text"
                        placeholder="Search by property, tenant, or owner..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="h-11 flex-1 rounded-xl border border-[#c5c6cd] px-3 text-sm text-[#191c1d] outline-none transition focus:border-[#00696b] focus:ring-2 focus:ring-[#d9f4f3]"
                    />
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        aria-label="Filter by rental status"
                        className="h-11 rounded-xl border border-[#c5c6cd] bg-white px-3 text-sm font-semibold text-[#44474d] outline-none focus:border-[#00696b]"
                    >
                        <option value="all">All Statuses</option>
                        <option value="active">Active</option>
                        <option value="grace_period">3-Day Grace Period Active</option>
                        <option value="terminated">Terminated</option>
                        <option value="expired">Expired</option>
                    </select>
                </div>

                {/* Rentals List */}
                <section className="mt-6 space-y-4">
                    {rentalsQuery.isLoading ? (
                        <div className="rounded-2xl border border-[#e1e3e4] bg-white px-5 py-12 text-center text-sm text-[#75777e]">
                            Loading rental records...
                        </div>
                    ) : rentalsQuery.isError ? (
                        <div className="rounded-2xl border border-[#f0b5ae] bg-[#fff0ee] px-5 py-8 text-center text-sm text-[#b42318]">
                            Unable to load rentals.
                            <button
                                type="button"
                                onClick={() => rentalsQuery.refetch()}
                                className="ml-2 font-bold underline"
                            >
                                Retry
                            </button>
                        </div>
                    ) : filteredRentals.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-[#c5c6cd] bg-white px-5 py-12 text-center text-sm text-[#75777e]">
                            No rental leases match your criteria.
                        </div>
                    ) : (
                        filteredRentals.map((rental, index) => {
                            const rentalKey = rental.id || (rental as unknown as { _id?: string })._id || rental.bookingId || `rental-item-${index}`;
                            const tenant = rental.occupants?.[0]?.tenant;
                            const property = rental.property;
                            const thumbnail = property?.images?.[0]?.url;
                            const isGrace = rental.isGracePeriodActive;
                            const isActive = rental.status.toLowerCase() === "active";

                            return (
                                <article
                                    key={rentalKey}
                                    className="overflow-hidden rounded-2xl border border-[#e1e3e4] bg-white shadow-sm transition hover:shadow-md"
                                >
                                    {isGrace && (
                                        <div className="bg-[#fffbeb] border-b border-[#fde68a] px-5 py-2.5 flex items-center justify-between text-xs text-[#92400e]">
                                            <div className="flex items-center gap-2">
                                                <span className="flex h-2 w-2 rounded-full bg-[#f59e0b] animate-ping" />
                                                <strong className="font-bold">3-Day Post-Lease Grace Period Active:</strong>
                                                <span>Property remains visible to tenant until {formatDate(rental.gracePeriodEndsAt)}.</span>
                                            </div>
                                            <span className="font-bold uppercase tracking-wider text-[11px] bg-[#fef3c7] px-2 py-0.5 rounded border border-[#fde68a]">
                                                Grace Period
                                            </span>
                                        </div>
                                    )}

                                    <div className="p-5 sm:p-6">
                                        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                                            {/* Property & Thumbnail */}
                                            <div className="flex gap-4">
                                                <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded-xl bg-[#f1f5f9]">
                                                    {thumbnail ? (
                                                        <Image
                                                            src={thumbnail}
                                                            alt={property?.title || "Property"}
                                                            fill
                                                            className="object-cover"
                                                        />
                                                    ) : (
                                                        <div className="flex h-full items-center justify-center text-[10px] text-[#94a3b8]">
                                                            No photo
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h2 className="text-base font-bold text-[#191c1d]">
                                                            {property?.title || "Property Unavailable"}
                                                        </h2>
                                                        <span
                                                            className={`rounded-full px-2 py-0.5 text-[10px] font-bold capitalize ${
                                                                isActive
                                                                    ? "bg-[#d9f4f3] text-[#00696b]"
                                                                    : "bg-[#f1f5f9] text-[#64748b]"
                                                            }`}
                                                        >
                                                            {rental.status}
                                                        </span>
                                                    </div>
                                                    <p className="mt-1 text-xs text-[#75777e]">
                                                        {property?.address?.street}, {property?.address?.city}, {property?.address?.state}
                                                    </p>
                                                    <p className="mt-1 text-xs text-[#44474d]">
                                                        Rent: <strong className="text-[#00696b]">{formatCurrency(rental.monthlyRent)}/mo</strong>
                                                        {" · "}Deposit: <strong>{formatCurrency(rental.securityDeposit)}</strong>
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Parties (Tenant & Owner) */}
                                            <div className="grid grid-cols-2 gap-4 rounded-xl bg-[#fafafa] p-3 text-xs sm:w-auto">
                                                <div>
                                                    <p className="font-bold uppercase tracking-wider text-[10px] text-[#75777e]">Tenant</p>
                                                    <p className="mt-1 font-bold text-[#191c1d]">{tenant?.name || "Tenant unavailable"}</p>
                                                    <p className="text-[11px] text-[#64748b]">{tenant?.email || "—"}</p>
                                                    {tenant?.phone && <p className="text-[11px] text-[#64748b]">{tenant.phone}</p>}
                                                </div>
                                                <div>
                                                    <p className="font-bold uppercase tracking-wider text-[10px] text-[#75777e]">Owner</p>
                                                    <p className="mt-1 font-bold text-[#191c1d]">{rental.owner?.name || "Owner unavailable"}</p>
                                                    <p className="text-[11px] text-[#64748b]">{rental.owner?.email || "—"}</p>
                                                    {rental.owner?.phone && <p className="text-[11px] text-[#64748b]">{rental.owner.phone}</p>}
                                                </div>
                                            </div>

                                            {/* Lease Dates & Actions */}
                                            <div className="flex flex-col items-start gap-3 lg:items-end">
                                                <div className="text-left text-xs lg:text-right">
                                                    <p className="text-[#75777e]">
                                                        Lease Period: <strong className="text-[#191c1d]">{formatDate(rental.leaseStart)}</strong> to{" "}
                                                        <strong className="text-[#191c1d]">{formatDate(rental.leaseEnd)}</strong>
                                                    </p>
                                                    {rental.agreement && (
                                                        <p className="mt-1 text-[#75777e]">
                                                            Agreement: <span className="font-semibold uppercase text-[#00696b]">{rental.agreement.status}</span>
                                                        </p>
                                                    )}
                                                </div>

                                                {isActive && (
                                                    <button
                                                        type="button"
                                                        onClick={() => setTerminatingRental(rental)}
                                                        className="rounded-lg bg-[#fff0ee] px-3 py-1.5 text-xs font-bold text-[#b42318] transition hover:bg-[#fdd8d4]"
                                                    >
                                                        Admin Terminate Lease
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </article>
                            );
                        })
                    )}
                </section>

                {/* Terminate Modal */}
                {terminatingRental && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                        <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
                            <h2 className="text-xl font-bold text-[#b42318]">Admin Force Terminate Rental</h2>
                            <p className="mt-2 text-sm text-[#44474d]">
                                Terminating this lease will immediately:
                            </p>
                            <ul className="mt-2 list-disc pl-5 text-xs text-[#75777e] space-y-1">
                                <li>Cancel the active rental contract and update occupant status to &quot;CANCELLED&quot;.</li>
                                <li>Release the property listing back to available status for new bookings.</li>
                                <li>Demote tenant role back to regular user if no other active tenancies exist.</li>
                                <li>Send automated termination notices to both Owner and Tenant.</li>
                            </ul>

                            <form onSubmit={handleConfirmTerminate} className="mt-4">
                                <label className="block text-xs font-bold uppercase text-[#44474d]">
                                    Termination Reason
                                </label>
                                <textarea
                                    required
                                    rows={3}
                                    placeholder="Enter detailed reason for lease termination..."
                                    value={terminateReason}
                                    onChange={(e) => setTerminateReason(e.target.value)}
                                    className="mt-1 w-full rounded-xl border border-[#c5c6cd] p-3 text-sm text-[#191c1d] outline-none focus:border-[#b42318]"
                                />

                                <div className="mt-5 flex justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setTerminatingRental(null);
                                            setTerminateReason("");
                                        }}
                                        className="rounded-xl border border-[#c5c6cd] px-4 py-2 text-sm font-bold text-[#44474d] hover:bg-[#f1f5f9]"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={terminateMutation.isPending}
                                        className="rounded-xl bg-[#b42318] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#911d13] disabled:opacity-50"
                                    >
                                        {terminateMutation.isPending ? "Terminating..." : "Terminate Lease"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </main>
        </DashboardShell>
    );
}

