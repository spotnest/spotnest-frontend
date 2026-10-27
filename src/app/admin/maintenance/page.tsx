"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import DashboardShell from "@/src/modules/dashboard/components/DashboardShell";
import {
    getAdminRequests,
    updateMaintenanceStatus,
} from "@/src/modules/maintenance/services/maintenanceService";
import type {
    MaintenanceCategory,
    MaintenancePriority,
    MaintenanceRequest,
    MaintenanceStatus,
} from "@/src/modules/maintenance/types/maintenance";
import {
    CATEGORY_OPTIONS,
    PRIORITY_OPTIONS,
    STATUS_OPTIONS,
    STATUS_LABELS,
} from "@/src/modules/maintenance/constants/maintenance";
import { dashboardPathForRole } from "@/src/constants/routes";
import { useAppSelector } from "@/src/store/hook";

const formatDate = (dateStr?: string) => {
    if (!dateStr) return "—";
    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) return dateStr;
    return new Intl.DateTimeFormat("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(date);
};

function PriorityBadge({ priority }: { priority: MaintenancePriority }) {
    const styles: Record<MaintenancePriority, string> = {
        Emergency: "bg-[#fee2e2] text-[#991b1b] border-[#fca5a5]",
        High: "bg-[#ffedd5] text-[#9a3412] border-[#fdba74]",
        Normal: "bg-[#fef9c3] text-[#854d0e] border-[#fde047]",
        Low: "bg-[#f1f5f9] text-[#475569] border-[#cbd5e1]",
    };

    return (
        <span
            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider ${
                styles[priority] ?? styles.Low
            }`}
        >
            {priority}
        </span>
    );
}

function StatusBadge({ status }: { status: MaintenanceStatus }) {
    const styles: Record<MaintenanceStatus, string> = {
        PENDING: "bg-[#fef3c7] text-[#b45309] border-[#fde68a]",
        ACCEPTED: "bg-[#e0f2fe] text-[#0369a1] border-[#bae6fd]",
        SCHEDULED: "bg-[#ede9fe] text-[#5b21b6] border-[#ddd6fe]",
        IN_PROGRESS: "bg-[#dbeafe] text-[#1d4ed8] border-[#93c5fd]",
        COMPLETED: "bg-[#dcfce7] text-[#15803d] border-[#86efac]",
        REJECTED: "bg-[#fee2e2] text-[#b91c1c] border-[#fca5a5]",
        CANCELLED: "bg-[#f1f5f9] text-[#64748b] border-[#cbd5e1]",
    };

    return (
        <span
            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold capitalize ${
                styles[status] ?? styles.PENDING
            }`}
        >
            {STATUS_LABELS[status] ?? status}
        </span>
    );
}

export default function AdminMaintenancePage() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const { user, isInitialized } = useAppSelector((state) => state.auth);
    const isAdmin = user?.role === "admin";

    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [categoryFilter, setCategoryFilter] = useState<string>("all");
    const [priorityFilter, setPriorityFilter] = useState<string>("all");
    const [search, setSearch] = useState("");

    const [feedback, setFeedback] = useState("");
    const [error, setError] = useState("");

    // Update status dialog
    const [updatingTicket, setUpdatingTicket] = useState<MaintenanceRequest | null>(null);
    const [newStatus, setNewStatus] = useState<MaintenanceStatus>("IN_PROGRESS");
    const [resolutionNotes, setResolutionNotes] = useState("");

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

    const requestsQuery = useQuery({
        queryKey: ["admin-maintenance"],
        queryFn: () => getAdminRequests(),
        enabled: isInitialized && isAdmin,
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, status, notes }: { id: string; status: MaintenanceStatus; notes?: string }) =>
            updateMaintenanceStatus(id, {
                status,
                ...(notes ? { resolutionNote: notes } : {}),
            }),
        onSuccess: () => {
            setFeedback("Ticket status updated successfully.");
            setError("");
            setUpdatingTicket(null);
            setResolutionNotes("");
            queryClient.invalidateQueries({ queryKey: ["admin-maintenance"] });
            queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] });
        },
        onError: (err: unknown) => {
            setError(
                (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
                    "Failed to update maintenance ticket status."
            );
        },
    });

    const openStatusModal = (ticket: MaintenanceRequest) => {
        setUpdatingTicket(ticket);
        setNewStatus(ticket.status);
        setResolutionNotes(ticket.resolutionNote || "");
        setFeedback("");
        setError("");
    };

    const handleSaveStatus = (e: React.FormEvent) => {
        e.preventDefault();
        if (!updatingTicket) return;
        updateMutation.mutate({
            id: updatingTicket.id,
            status: newStatus,
            notes: resolutionNotes.trim() || undefined,
        });
    };

    const tickets = requestsQuery.data?.requests || [];

    const stats = useMemo(() => {
        return {
            total: tickets.length,
            pending: tickets.filter((t) => t.status === "PENDING").length,
            inProgress: tickets.filter(
                (t) => t.status === "IN_PROGRESS" || t.status === "ACCEPTED" || t.status === "SCHEDULED"
            ).length,
            resolved: tickets.filter((t) => t.status === "COMPLETED").length,
        };
    }, [tickets]);

    const filteredTickets = useMemo(() => {
        return tickets.filter((t) => {
            if (statusFilter !== "all" && t.status !== statusFilter) return false;
            if (categoryFilter !== "all" && t.category !== categoryFilter) return false;
            if (priorityFilter !== "all" && t.priority !== priorityFilter) return false;

            if (search.trim()) {
                const term = search.toLowerCase();
                const title = t.title.toLowerCase();
                const propertyTitle = t.property?.title?.toLowerCase() || "";
                const tenantName = t.tenant?.name?.toLowerCase() || "";
                if (!title.includes(term) && !propertyTitle.includes(term) && !tenantName.includes(term)) {
                    return false;
                }
            }
            return true;
        });
    }, [tickets, statusFilter, categoryFilter, priorityFilter, search]);

    if (!isInitialized || !user || !isAdmin) {
        return null;
    }

    return (
        <DashboardShell role="admin">
            <main className="mx-auto max-w-[1500px] px-4 py-7 sm:px-6 sm:py-9 lg:px-10 lg:py-10">
                <div>
                    <p className="text-sm font-semibold text-[#00696b]">Admin workspace</p>
                    <h1 className="mt-1 text-3xl font-bold tracking-tight text-[#191c1d]">Maintenance Tracker</h1>
                    <p className="mt-1 text-sm text-[#44474d]">
                        Monitor, review, and manage all property maintenance tickets, contractor schedules, and resolutions.
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
                <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <div className="rounded-2xl border border-[#e1e3e4] bg-white p-4">
                        <p className="text-xs font-semibold uppercase text-[#75777e]">Total Tickets</p>
                        <p className="mt-2 text-2xl font-bold text-[#191c1d]">{stats.total}</p>
                    </div>
                    <div className="rounded-2xl border border-[#e1e3e4] bg-white p-4">
                        <p className="text-xs font-semibold uppercase text-[#b45309]">Pending</p>
                        <p className="mt-2 text-2xl font-bold text-[#b45309]">{stats.pending}</p>
                    </div>
                    <div className="rounded-2xl border border-[#e1e3e4] bg-white p-4">
                        <p className="text-xs font-semibold uppercase text-[#0369a1]">In Progress</p>
                        <p className="mt-2 text-2xl font-bold text-[#0369a1]">{stats.inProgress}</p>
                    </div>
                    <div className="rounded-2xl border border-[#e1e3e4] bg-white p-4">
                        <p className="text-xs font-semibold uppercase text-[#15803d]">Resolved</p>
                        <p className="mt-2 text-2xl font-bold text-[#15803d]">{stats.resolved}</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-[#e1e3e4] bg-white p-4 sm:flex-row sm:items-center">
                    <input
                        type="text"
                        placeholder="Search tickets, properties, or tenants..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="h-11 flex-1 rounded-xl border border-[#c5c6cd] px-3 text-sm text-[#191c1d] outline-none transition focus:border-[#00696b] focus:ring-2 focus:ring-[#d9f4f3]"
                    />
                    <div className="flex flex-wrap gap-2">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            aria-label="Filter by status"
                            className="h-11 rounded-xl border border-[#c5c6cd] bg-white px-3 text-sm font-semibold text-[#44474d] outline-none focus:border-[#00696b]"
                        >
                            <option value="all">All Statuses</option>
                            {STATUS_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                        <select
                            value={priorityFilter}
                            onChange={(e) => setPriorityFilter(e.target.value)}
                            aria-label="Filter by priority"
                            className="h-11 rounded-xl border border-[#c5c6cd] bg-white px-3 text-sm font-semibold text-[#44474d] outline-none focus:border-[#00696b]"
                        >
                            <option value="all">All Priorities</option>
                            {PRIORITY_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            aria-label="Filter by category"
                            className="h-11 rounded-xl border border-[#c5c6cd] bg-white px-3 text-sm font-semibold text-[#44474d] outline-none focus:border-[#00696b]"
                        >
                            <option value="all">All Categories</option>
                            {CATEGORY_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Tickets Grid */}
                <section className="mt-6 space-y-4">
                    {requestsQuery.isLoading ? (
                        <div className="rounded-2xl border border-[#e1e3e4] bg-white px-5 py-12 text-center text-sm text-[#75777e]">
                            Loading maintenance tickets...
                        </div>
                    ) : requestsQuery.isError ? (
                        <div className="rounded-2xl border border-[#f0b5ae] bg-[#fff0ee] px-5 py-8 text-center text-sm text-[#b42318]">
                            Unable to load maintenance tickets.
                            <button
                                type="button"
                                onClick={() => requestsQuery.refetch()}
                                className="ml-2 font-bold underline"
                            >
                                Retry
                            </button>
                        </div>
                    ) : filteredTickets.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-[#c5c6cd] bg-white px-5 py-12 text-center text-sm text-[#75777e]">
                            No maintenance requests match your filters.
                        </div>
                    ) : (
                        filteredTickets.map((ticket) => (
                            <article
                                key={ticket.id}
                                className="overflow-hidden rounded-2xl border border-[#e1e3e4] bg-white p-5 shadow-sm transition hover:shadow-md sm:p-6"
                            >
                                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                                    <div className="min-w-0 flex-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <h2 className="text-base font-bold text-[#191c1d]">{ticket.title}</h2>
                                            <PriorityBadge priority={ticket.priority} />
                                            <StatusBadge status={ticket.status} />
                                            <span className="rounded-full bg-[#f1f5f9] px-2.5 py-0.5 text-xs font-semibold capitalize text-[#475569]">
                                                {ticket.category}
                                            </span>
                                        </div>
                                        <p className="mt-2 text-sm text-[#44474d] whitespace-pre-wrap leading-6">
                                            {ticket.description}
                                        </p>
                                    </div>
                                    <div className="shrink-0 text-left sm:text-right">
                                        <button
                                            type="button"
                                            onClick={() => openStatusModal(ticket)}
                                            className="rounded-lg border border-[#c5c6cd] px-3 py-1.5 text-xs font-bold text-[#191c1d] hover:border-[#00696b] hover:text-[#00696b]"
                                        >
                                            Update Status
                                        </button>
                                        <p className="mt-2 text-xs text-[#75777e]">
                                            Logged: {formatDate(ticket.createdAt)}
                                        </p>
                                    </div>
                                </div>

                                {/* Images */}
                                {ticket.images && ticket.images.length > 0 && (
                                    <div className="mt-4 flex flex-wrap gap-2">
                                        {ticket.images.map((img, idx) => (
                                            <a
                                                key={idx}
                                                href={img.url}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="relative h-16 w-20 overflow-hidden rounded-lg border border-[#e1e3e4]"
                                            >
                                                <Image
                                                    src={img.url}
                                                    alt={`Attachment ${idx + 1}`}
                                                    fill
                                                    className="object-cover"
                                                />
                                            </a>
                                        ))}
                                    </div>
                                )}

                                {/* Meta details */}
                                <div className="mt-4 grid gap-3 border-t border-[#eef0f1] pt-3 text-xs sm:grid-cols-2">
                                    <div>
                                        <span className="text-[#75777e]">Property: </span>
                                        <strong className="text-[#191c1d]">
                                            {ticket.property?.title || "Property unavailable"}
                                        </strong>
                                        {ticket.property?.address?.city && (
                                            <span className="text-[#75777e]">
                                                {" "}({ticket.property.address.city})
                                            </span>
                                        )}
                                    </div>
                                    <div>
                                        <span className="text-[#75777e]">Tenant: </span>
                                        <strong className="text-[#191c1d]">
                                            {ticket.tenant?.name || "Tenant unavailable"}
                                        </strong>
                                        {ticket.tenant?.phone && (
                                            <span className="text-[#75777e]">
                                                {" "}· {ticket.tenant.phone}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {ticket.resolutionNote && (
                                    <div className="mt-3 rounded-xl bg-[#f8f9fa] p-3 text-xs text-[#44474d]">
                                        <strong className="text-[#191c1d]">Resolution Notes: </strong>
                                        {ticket.resolutionNote}
                                    </div>
                                )}
                            </article>
                        ))
                    )}
                </section>

                {/* Update Status Modal */}
                {updatingTicket && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                        <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
                            <h2 className="text-xl font-bold text-[#191c1d]">Update Ticket Status</h2>
                            <p className="mt-1 text-xs text-[#75777e]">
                                Ticket: <span className="font-semibold">{updatingTicket.title}</span>
                            </p>

                            <form onSubmit={handleSaveStatus} className="mt-4 space-y-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase text-[#44474d]">
                                        Lifecycle Status
                                    </label>
                                    <select
                                        value={newStatus}
                                        onChange={(e) => setNewStatus(e.target.value as MaintenanceStatus)}
                                        className="mt-1 h-10 w-full rounded-xl border border-[#c5c6cd] bg-white px-3 text-sm font-semibold text-[#191c1d] outline-none focus:border-[#00696b]"
                                    >
                                        {STATUS_OPTIONS.map((opt) => (
                                            <option key={opt.value} value={opt.value}>
                                                {opt.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase text-[#44474d]">
                                        Resolution / Action Notes
                                    </label>
                                    <textarea
                                        rows={3}
                                        value={resolutionNotes}
                                        onChange={(e) => setResolutionNotes(e.target.value)}
                                        placeholder="Add notes for tenant and property records..."
                                        className="mt-1 w-full rounded-xl border border-[#c5c6cd] p-3 text-sm text-[#191c1d] outline-none focus:border-[#00696b]"
                                    />
                                </div>

                                <div className="flex justify-end gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setUpdatingTicket(null)}
                                        className="rounded-xl border border-[#c5c6cd] px-4 py-2 text-sm font-bold text-[#44474d] hover:bg-[#f1f5f9]"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={updateMutation.isPending}
                                        className="rounded-xl bg-[#00696b] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#005153] disabled:opacity-50"
                                    >
                                        {updateMutation.isPending ? "Updating..." : "Save Status"}
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

