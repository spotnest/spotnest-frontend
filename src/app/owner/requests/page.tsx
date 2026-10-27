"use client";

import { useState } from "react";
import Link from "next/link";
import {
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";
import {
    Clock,
    CheckCircle,
    XCircle,
    Calendar,
    DollarSign,
    Shield,
    User,
    Mail,
    Phone,
    Home,
    Eye,
    X,
    Loader2,
    AlertTriangle,
    FileText,
    ExternalLink,
} from "lucide-react";

import DashboardShell from "@/src/modules/dashboard/components/DashboardShell";
import {
    approveVisit,
    cancelVisit,
    completeVisit,
    getOwnerVisits,
    rejectVisit,
    rescheduleVisit,
} from "@/src/modules/visits/services/visitService";
import type {
    Visit,
    VisitStatus,
} from "@/src/modules/visits/services/visitService";
import {
    useOwnerBookingRequests,
    useReviewBooking,
} from "@/src/modules/bookings/hooks/useBookings";
import type { Booking } from "@/src/modules/bookings/types";
import { formatPrice } from "@/src/modules/properties";

type ActionType = "approve" | "reject" | "reschedule" | null;
type ActiveTab = "rentals" | "visits";

const visitStatusStyles: Record<VisitStatus, string> = {
    pending: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200",
    approved: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200",
    rejected: "bg-red-50 text-red-700 ring-1 ring-inset ring-red-200",
    rescheduled: "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200",
    cancelled: "bg-gray-100 text-gray-600 ring-1 ring-inset ring-gray-200",
    completed: "bg-purple-50 text-purple-700 ring-1 ring-inset ring-purple-200",
};

const visitStatusLabels: Record<VisitStatus, string> = {
    pending: "Pending",
    accepted: "Approved",
    rejected: "Rejected",
    rescheduled: "Rescheduled",
    cancelled: "Cancelled",
    completed: "Completed",
};

function formatDate(date?: string) {
    if (!date) return "—";
    try {
        const d = new Date(date);
        if (isNaN(d.getTime())) return date;
        return new Intl.DateTimeFormat("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        }).format(d);
    } catch {
        return date;
    }
}

function getPropertyTitle(property: any): string {
    if (!property) return "Rental Property";
    if (typeof property === "string") return "Rental Property";
    return property.title || "Rental Property";
}

function getRequester(entity: any) {
    if (!entity || typeof entity === "string") {
        return { name: "Applicant / User", email: "", phone: "", image: "" };
    }
    return {
        name: entity.name || "Applicant / User",
        email: entity.email || "",
        phone: entity.phone || "",
        image: entity.image || "",
    };
}

export default function OwnerRequestsPage() {
    const queryClient = useQueryClient();

    // Tab state
    const [activeTab, setActiveTab] = useState<ActiveTab>("rentals");

    // Modal states
    const [selectedRentalBooking, setSelectedRentalBooking] = useState<Booking | null>(null);
    const [selectedVisitDetail, setSelectedVisitDetail] = useState<Visit | null>(null);

    // Visit action state
    const [activeVisit, setActiveVisit] = useState<Visit | null>(null);
    const [action, setAction] = useState<ActionType>(null);
    const [scheduledDate, setScheduledDate] = useState("");
    const [scheduledTime, setScheduledTime] = useState("");
    const [reason, setReason] = useState("");

    // Rental booking hooks
    const ownerBookingsQuery = useOwnerBookingRequests();
    const reviewBooking = useReviewBooking();

    // Visit hooks
    const ownerVisitsQuery = useQuery({
        queryKey: ["owner-visits"],
        queryFn: getOwnerVisits,
    });

    const refreshVisits = async () => {
        await queryClient.invalidateQueries({
            queryKey: ["owner-visits"],
        });
    };

    const approveMutation = useMutation({
        mutationFn: async () => {
            if (!activeVisit) throw new Error("No visit selected.");
            return approveVisit(activeVisit._id, {
                scheduledDate,
                scheduledTime,
            });
        },
        onSuccess: async () => {
            closeAction();
            await refreshVisits();
        },
    });

    const rejectMutation = useMutation({
        mutationFn: async () => {
            if (!activeVisit) throw new Error("No visit selected.");
            return rejectVisit(activeVisit._id, {
                rejectionReason: reason.trim(),
            });
        },
        onSuccess: async () => {
            closeAction();
            await refreshVisits();
        },
    });

    const rescheduleMutation = useMutation({
        mutationFn: async () => {
            if (!activeVisit) throw new Error("No visit selected.");
            return rescheduleVisit(activeVisit._id, {
                scheduledDate,
                scheduledTime,
                rescheduleReason: reason.trim(),
            });
        },
        onSuccess: async () => {
            closeAction();
            await refreshVisits();
        },
    });

    const completeMutation = useMutation({
        mutationFn: (visitId: string) => completeVisit(visitId),
        onSuccess: refreshVisits,
    });

    const cancelMutation = useMutation({
        mutationFn: (visitId: string) => cancelVisit(visitId),
        onSuccess: refreshVisits,
    });

    function openApprove(visit: Visit) {
        setActiveVisit(visit);
        setAction("approve");
        setReason("");
        setScheduledDate(
            visit.scheduledDate?.slice(0, 10) ?? visit.requestedDate.slice(0, 10)
        );
        setScheduledTime(visit.scheduledTime ?? visit.requestedTime);
    }

    function openReject(visit: Visit) {
        setActiveVisit(visit);
        setAction("reject");
        setReason("");
        setScheduledDate("");
        setScheduledTime("");
    }

    function openReschedule(visit: Visit) {
        setActiveVisit(visit);
        setAction("reschedule");
        setReason("");
        setScheduledDate(
            visit.scheduledDate?.slice(0, 10) ?? visit.requestedDate.slice(0, 10)
        );
        setScheduledTime(visit.scheduledTime ?? visit.requestedTime);
    }

    function closeAction() {
        setActiveVisit(null);
        setAction(null);
        setScheduledDate("");
        setScheduledTime("");
        setReason("");
    }

    async function handleActionSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (action === "approve") {
            if (!scheduledDate || !scheduledTime) return;
            await approveMutation.mutateAsync();
            return;
        }
        if (action === "reject") {
            if (!reason.trim()) return;
            await rejectMutation.mutateAsync();
            return;
        }
        if (action === "reschedule") {
            if (!scheduledDate || !scheduledTime || !reason.trim()) return;
            await rescheduleMutation.mutateAsync();
        }
    }

    const rentalRequests = ownerBookingsQuery.data ?? [];
    const pendingRentalRequests = rentalRequests.filter((b) => b.status === "PENDING");
    const activeInquiryCount = rentalRequests.filter(
        (b) => b.tenantInquiry?.status === "PENDING"
    ).length;

    const visits = ownerVisitsQuery.data ?? [];
    const pendingVisits = visits.filter((v) => v.status === "pending");

    const isMutatingVisit =
        approveMutation.isPending ||
        rejectMutation.isPending ||
        rescheduleMutation.isPending;

    return (
        <DashboardShell role="owner">
            <main className="mx-auto max-w-[1500px] px-4 py-7 sm:px-6 sm:py-9 lg:px-10 lg:py-10">
                <div className="flex flex-col gap-6">
                    {/* Header */}
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <p className="text-sm font-semibold text-[#00696b]">
                                Owner workspace
                            </p>
                            <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#191c1d]">
                                Requests & Approvals
                            </h1>
                            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#44474d]">
                                Review tenant rental applications and manage property tour visit requests.
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={() => {
                                    if (activeTab === "rentals") {
                                        void ownerBookingsQuery.refetch();
                                    } else {
                                        void ownerVisitsQuery.refetch();
                                    }
                                }}
                                disabled={
                                    activeTab === "rentals"
                                        ? ownerBookingsQuery.isFetching
                                        : ownerVisitsQuery.isFetching
                                }
                                className="inline-flex h-10 items-center justify-center rounded-lg border border-[#d5d9dc] bg-white px-4 text-sm font-semibold text-[#303438] transition hover:bg-[#f7f8f8] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {(activeTab === "rentals" ? ownerBookingsQuery.isFetching : ownerVisitsQuery.isFetching)
                                    ? "Refreshing..."
                                    : "Refresh"}
                            </button>
                        </div>
                    </div>

                    {/* Tab Navigation */}
                    <div className="flex items-center gap-2 border-b border-[#e1e4e6] pb-1">
                        <button
                            type="button"
                            onClick={() => setActiveTab("rentals")}
                            className={`inline-flex items-center gap-2.5 border-b-2 px-4 py-3 text-sm font-semibold transition ${
                                activeTab === "rentals"
                                    ? "border-[#00696b] text-[#00696b]"
                                    : "border-transparent text-[#686d72] hover:text-[#191c1d]"
                            }`}
                        >
                            <Home className="h-4 w-4" />
                            Rental Applications
                            <span
                                className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                                    activeTab === "rentals"
                                        ? "bg-[#00696b]/10 text-[#00696b]"
                                        : "bg-gray-100 text-gray-700"
                                }`}
                            >
                                {pendingRentalRequests.length}
                            </span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setActiveTab("visits")}
                            className={`inline-flex items-center gap-2.5 border-b-2 px-4 py-3 text-sm font-semibold transition ${
                                activeTab === "visits"
                                    ? "border-[#00696b] text-[#00696b]"
                                    : "border-transparent text-[#686d72] hover:text-[#191c1d]"
                            }`}
                        >
                            <Calendar className="h-4 w-4" />
                            Property Visits
                            <span
                                className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                                    activeTab === "visits"
                                        ? "bg-[#00696b]/10 text-[#00696b]"
                                        : "bg-gray-100 text-gray-700"
                                }`}
                            >
                                {pendingVisits.length}
                            </span>
                        </button>
                    </div>

                    {/* Summary Metrics */}
                    {activeTab === "rentals" ? (
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                            <div className="rounded-xl border border-[#e1e4e6] bg-white p-5 shadow-xs">
                                <p className="text-xs font-semibold uppercase tracking-wider text-[#686d72]">
                                    Pending Applications
                                </p>
                                <p className="mt-2 text-2xl font-bold text-[#191c1d]">
                                    {pendingRentalRequests.length}
                                </p>
                            </div>

                            <div className="rounded-xl border border-[#e1e4e6] bg-white p-5 shadow-xs">
                                <p className="text-xs font-semibold uppercase tracking-wider text-[#686d72]">
                                    Occupied Property Inquiries
                                </p>
                                <p className="mt-2 text-2xl font-bold text-[#b78103]">
                                    {activeInquiryCount}
                                </p>
                            </div>

                            <div className="rounded-xl border border-[#e1e4e6] bg-white p-5 shadow-xs">
                                <p className="text-xs font-semibold uppercase tracking-wider text-[#686d72]">
                                    Total Rental Requests
                                </p>
                                <p className="mt-2 text-2xl font-bold text-[#191c1d]">
                                    {rentalRequests.length}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                            <div className="rounded-xl border border-[#e1e4e6] bg-white p-5 shadow-xs">
                                <p className="text-xs font-semibold uppercase tracking-wider text-[#686d72]">
                                    Pending Visit Requests
                                </p>
                                <p className="mt-2 text-2xl font-bold text-[#191c1d]">
                                    {pendingVisits.length}
                                </p>
                            </div>

                            <div className="rounded-xl border border-[#e1e4e6] bg-white p-5 shadow-xs">
                                <p className="text-xs font-semibold uppercase tracking-wider text-[#686d72]">
                                    Scheduled Visits
                                </p>
                                <p className="mt-2 text-2xl font-bold text-emerald-700">
                                    {visits.filter((v) => v.status === "approved" || v.status === "rescheduled").length}
                                </p>
                            </div>

                            <div className="rounded-xl border border-[#e1e4e6] bg-white p-5 shadow-xs">
                                <p className="text-xs font-semibold uppercase tracking-wider text-[#686d72]">
                                    Total Visits
                                </p>
                                <p className="mt-2 text-2xl font-bold text-[#191c1d]">
                                    {visits.length}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* ======================================================== */}
                    {/* TAB CONTENT: RENTAL APPLICATIONS */}
                    {/* ======================================================== */}
                    {activeTab === "rentals" && (
                        <div>
                            {ownerBookingsQuery.isLoading && (
                                <div className="rounded-xl border border-[#e1e4e6] bg-white p-12 text-center">
                                    <Loader2 className="mx-auto h-6 w-6 animate-spin text-[#00696b]" />
                                    <p className="mt-3 text-sm text-[#686d72]">Loading rental applications...</p>
                                </div>
                            )}

                            {ownerBookingsQuery.isError && (
                                <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
                                    <p className="font-semibold text-red-800">Failed to load rental applications.</p>
                                    <p className="mt-1 text-sm text-red-700">Please refresh the page and try again.</p>
                                </div>
                            )}

                            {!ownerBookingsQuery.isLoading && !ownerBookingsQuery.isError && rentalRequests.length === 0 && (
                                <div className="rounded-xl border border-dashed border-[#cfd4d7] bg-white p-12 text-center">
                                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#e8f6f6] text-[#00696b]">
                                        <Home className="h-6 w-6" />
                                    </div>
                                    <h2 className="mt-4 text-lg font-semibold text-[#191c1d]">
                                        No pending rental requests
                                    </h2>
                                    <p className="mx-auto mt-2 max-w-md text-sm text-[#686d72]">
                                        When prospective tenants request to rent any of your properties, their applications will appear here.
                                    </p>
                                </div>
                            )}

                            {!ownerBookingsQuery.isLoading && !ownerBookingsQuery.isError && rentalRequests.length > 0 && (
                                <div className="space-y-4">
                                    {rentalRequests.map((booking) => {
                                        const propTitle = getPropertyTitle(booking.propertyId);
                                        const tenant = getRequester(booking.userId);
                                        const isInquiryPending =
                                            booking.tenantInquiry?.status === "PENDING" &&
                                            new Date() < new Date(booking.tenantInquiry.deadline);

                                        return (
                                            <article
                                                key={booking._id}
                                                className="rounded-2xl border border-[#e1e4e6] bg-white p-5 shadow-xs transition hover:border-[#00696b]/40"
                                            >
                                                {/* Header Row */}
                                                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                                    <div className="flex items-start gap-4">
                                                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#00696b]/10 text-[#00696b]">
                                                            <Home className="h-6 w-6" />
                                                        </div>
                                                        <div>
                                                            <div className="flex flex-wrap items-center gap-2.5">
                                                                <h2 className="text-lg font-bold text-[#191c1d]">
                                                                    {propTitle}
                                                                </h2>
                                                                <span className="rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-semibold text-[#00696b] ring-1 ring-inset ring-teal-200">
                                                                    {booking.status}
                                                                </span>
                                                            </div>
                                                            <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[#44474d]">
                                                                <span className="flex items-center gap-1.5 font-medium">
                                                                    <User className="h-3.5 w-3.5 text-[#75777e]" />
                                                                    {tenant.name}
                                                                </span>
                                                                {tenant.email && (
                                                                    <span className="flex items-center gap-1.5 text-xs text-[#75777e]">
                                                                        <Mail className="h-3.5 w-3.5" />
                                                                        {tenant.email}
                                                                    </span>
                                                                )}
                                                                {tenant.phone && (
                                                                    <span className="flex items-center gap-1.5 text-xs text-[#75777e]">
                                                                        <Phone className="h-3.5 w-3.5" />
                                                                        {tenant.phone}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Quick View Button */}
                                                    <button
                                                        type="button"
                                                        onClick={() => setSelectedRentalBooking(booking)}
                                                        className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-[#d5d9dc] bg-white px-3 py-1.5 text-xs font-semibold text-[#303438] transition hover:bg-[#f7f8f8]"
                                                    >
                                                        <Eye className="h-3.5 w-3.5" />
                                                        View Details
                                                    </button>
                                                </div>

                                                {/* Small Boxed Details Summary */}
                                                <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                                                    <div className="rounded-xl border border-[#edf0f2] bg-[#f8f9fa] p-3">
                                                        <p className="text-[11px] font-semibold uppercase tracking-wider text-[#75777e]">
                                                            Lease Starts
                                                        </p>
                                                        <p className="mt-1 text-sm font-bold text-[#191c1d]">
                                                            {formatDate(booking.startDate)}
                                                        </p>
                                                    </div>

                                                    <div className="rounded-xl border border-[#edf0f2] bg-[#f8f9fa] p-3">
                                                        <p className="text-[11px] font-semibold uppercase tracking-wider text-[#75777e]">
                                                            Lease Ends
                                                        </p>
                                                        <p className="mt-1 text-sm font-bold text-[#191c1d]">
                                                            {formatDate(booking.endDate)}
                                                        </p>
                                                    </div>

                                                    <div className="rounded-xl border border-[#edf0f2] bg-[#f8f9fa] p-3">
                                                        <p className="text-[11px] font-semibold uppercase tracking-wider text-[#75777e]">
                                                            Monthly Rent
                                                        </p>
                                                        <p className="mt-1 text-sm font-bold text-[#00696b]">
                                                            {formatPrice(booking.monthlyRent)}
                                                        </p>
                                                    </div>

                                                    <div className="rounded-xl border border-[#edf0f2] bg-[#f8f9fa] p-3">
                                                        <p className="text-[11px] font-semibold uppercase tracking-wider text-[#75777e]">
                                                            Advance Deposit
                                                        </p>
                                                        <p className="mt-1 text-sm font-bold text-[#191c1d]">
                                                            {formatPrice(booking.advanceAmount)}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Occupied Property Move-Out Inquiry Banner */}
                                                {booking.tenantInquiry?.status === "PENDING" && (
                                                    <div className="mt-3 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950">
                                                        <div className="flex items-start gap-3">
                                                            <Clock className="mt-0.5 h-5 w-5 text-amber-700 shrink-0" />
                                                            <div>
                                                                <p className="font-bold text-amber-900">
                                                                    Occupied Property — 3-Day Tenant Inquiry Active
                                                                </p>
                                                                <p className="mt-1 text-xs leading-relaxed text-amber-800">
                                                                    The current tenant has until{" "}
                                                                    <strong>
                                                                        {new Date(booking.tenantInquiry.deadline).toLocaleString("en-IN", {
                                                                            day: "2-digit",
                                                                            month: "short",
                                                                            year: "numeric",
                                                                            hour: "2-digit",
                                                                            minute: "2-digit",
                                                                        })}
                                                                    </strong>{" "}
                                                                    to confirm their move-out schedule or request a lease renewal.
                                                                    Owner approval is locked until they respond or the 3-day window expires with deemed consent.
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {booking.tenantInquiry?.status && booking.tenantInquiry.status !== "PENDING" && (
                                                    <div className="mt-3 rounded-xl border border-teal-200 bg-teal-50 p-3.5 text-xs text-teal-900">
                                                        <p className="font-bold text-teal-950">
                                                            Current Tenant Move-Out Status: {booking.tenantInquiry.status.replaceAll("_", " ")}
                                                        </p>
                                                        {booking.tenantInquiry.responseMessage && (
                                                            <p className="mt-1 italic text-teal-800">
                                                                &ldquo;{booking.tenantInquiry.responseMessage}&rdquo;
                                                            </p>
                                                        )}
                                                    </div>
                                                )}

                                                {/* Notes */}
                                                {booking.notes && (
                                                    <p className="mt-3 text-xs text-[#555] bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                                                        <span className="font-semibold text-gray-700">Applicant note:</span> {booking.notes}
                                                    </p>
                                                )}

                                                {/* Actions */}
                                                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[#edf0f2] pt-3.5">
                                                    <div className="text-xs text-[#75777e]">
                                                        Requested: {formatDate(booking.created_at)}
                                                    </div>

                                                    {booking.status === "PENDING" && (
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                type="button"
                                                                disabled={reviewBooking.isPending || isInquiryPending}
                                                                onClick={() => reviewBooking.mutate({ bookingId: booking._id, decision: "APPROVED" })}
                                                                className="rounded-lg bg-[#00696b] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#004f51] disabled:cursor-not-allowed disabled:opacity-50"
                                                                title={isInquiryPending ? "Cannot approve until current tenant responds or 3-day inquiry expires" : undefined}
                                                            >
                                                                {reviewBooking.isPending ? "Approving..." : "Approve Request"}
                                                            </button>

                                                            <button
                                                                type="button"
                                                                disabled={reviewBooking.isPending}
                                                                onClick={() => reviewBooking.mutate({ bookingId: booking._id, decision: "REJECTED" })}
                                                                className="rounded-lg border border-[#b42318] px-4 py-2 text-sm font-semibold text-[#b42318] transition hover:bg-red-50 disabled:opacity-60"
                                                            >
                                                                Reject
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </article>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {/* ======================================================== */}
                    {/* TAB CONTENT: PROPERTY VISITS */}
                    {/* ======================================================== */}
                    {activeTab === "visits" && (
                        <div>
                            {ownerVisitsQuery.isLoading && (
                                <div className="rounded-xl border border-[#e1e4e6] bg-white p-12 text-center">
                                    <Loader2 className="mx-auto h-6 w-6 animate-spin text-[#00696b]" />
                                    <p className="mt-3 text-sm text-[#686d72]">Loading visit requests...</p>
                                </div>
                            )}

                            {ownerVisitsQuery.isError && (
                                <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
                                    <p className="font-semibold text-red-800">Failed to load visit requests.</p>
                                    <p className="mt-1 text-sm text-red-700">Please refresh the page and try again.</p>
                                </div>
                            )}

                            {!ownerVisitsQuery.isLoading && !ownerVisitsQuery.isError && visits.length === 0 && (
                                <div className="rounded-xl border border-dashed border-[#cfd4d7] bg-white p-12 text-center">
                                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#e8f6f6] text-[#00696b]">
                                        <Calendar className="h-6 w-6" />
                                    </div>
                                    <h2 className="mt-4 text-lg font-semibold text-[#191c1d]">No visit requests</h2>
                                    <p className="mx-auto mt-2 max-w-md text-sm text-[#686d72]">
                                        Prospective tenants requesting property tour visits will appear here.
                                    </p>
                                </div>
                            )}

                            {!ownerVisitsQuery.isLoading && !ownerVisitsQuery.isError && visits.length > 0 && (
                                <div className="space-y-4">
                                    {visits.map((visit) => {
                                        const propTitle = getPropertyTitle(visit.property);
                                        const requester = getRequester(visit.requester);

                                        return (
                                            <article
                                                key={visit._id}
                                                className="rounded-2xl border border-[#e1e4e6] bg-white p-5 shadow-xs transition hover:border-[#00696b]/40"
                                            >
                                                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                                    <div className="flex items-start gap-4">
                                                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#00696b]/10 text-[#00696b]">
                                                            <Calendar className="h-6 w-6" />
                                                        </div>
                                                        <div>
                                                            <div className="flex flex-wrap items-center gap-2.5">
                                                                <h2 className="text-lg font-bold text-[#191c1d]">
                                                                    {propTitle}
                                                                </h2>
                                                                <span
                                                                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                                                        visitStatusStyles[visit.status]
                                                                    }`}
                                                                >
                                                                    {visitStatusLabels[visit.status]}
                                                                </span>
                                                            </div>
                                                            <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[#44474d]">
                                                                <span className="flex items-center gap-1.5 font-medium">
                                                                    <User className="h-3.5 w-3.5 text-[#75777e]" />
                                                                    {requester.name}
                                                                </span>
                                                                {requester.email && (
                                                                    <span className="flex items-center gap-1.5 text-xs text-[#75777e]">
                                                                        <Mail className="h-3.5 w-3.5" />
                                                                        {requester.email}
                                                                    </span>
                                                                )}
                                                                {requester.phone && (
                                                                    <span className="flex items-center gap-1.5 text-xs text-[#75777e]">
                                                                        <Phone className="h-3.5 w-3.5" />
                                                                        {requester.phone}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <button
                                                        type="button"
                                                        onClick={() => setSelectedVisitDetail(visit)}
                                                        className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-[#d5d9dc] bg-white px-3 py-1.5 text-xs font-semibold text-[#303438] transition hover:bg-[#f7f8f8]"
                                                    >
                                                        <Eye className="h-3.5 w-3.5" />
                                                        View Details
                                                    </button>
                                                </div>

                                                {/* Small Boxed Details */}
                                                <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                                                    <div className="rounded-xl border border-[#edf0f2] bg-[#f8f9fa] p-3">
                                                        <p className="text-[11px] font-semibold uppercase tracking-wider text-[#75777e]">
                                                            Requested Date
                                                        </p>
                                                        <p className="mt-1 text-sm font-bold text-[#191c1d]">
                                                            {formatDate(visit.requestedDate)}
                                                        </p>
                                                    </div>

                                                    <div className="rounded-xl border border-[#edf0f2] bg-[#f8f9fa] p-3">
                                                        <p className="text-[11px] font-semibold uppercase tracking-wider text-[#75777e]">
                                                            Requested Time
                                                        </p>
                                                        <p className="mt-1 text-sm font-bold text-[#191c1d]">
                                                            {visit.requestedTime || "—"}
                                                        </p>
                                                    </div>

                                                    <div className="rounded-xl border border-[#edf0f2] bg-[#f8f9fa] p-3 col-span-2 sm:col-span-1">
                                                        <p className="text-[11px] font-semibold uppercase tracking-wider text-[#75777e]">
                                                            Confirmed Schedule
                                                        </p>
                                                        <p className="mt-1 text-sm font-bold text-[#00696b]">
                                                            {visit.scheduledDate
                                                                ? `${formatDate(visit.scheduledDate)} at ${visit.scheduledTime || ""}`
                                                                : "Not scheduled yet"}
                                                        </p>
                                                    </div>
                                                </div>

                                                {visit.message && (
                                                    <p className="mt-3 text-xs text-[#555] bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                                                        <span className="font-semibold text-gray-700">Visitor message:</span> {visit.message}
                                                    </p>
                                                )}

                                                {visit.rejectionReason && (
                                                    <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-2.5 text-xs text-red-800">
                                                        <span className="font-semibold text-red-900">Rejection reason:</span> {visit.rejectionReason}
                                                    </div>
                                                )}

                                                {/* Actions */}
                                                <div className="mt-4 flex flex-wrap items-center justify-end gap-2 border-t border-[#edf0f2] pt-3.5">
                                                    {visit.status === "pending" && (
                                                        <>
                                                            <button
                                                                type="button"
                                                                onClick={() => openApprove(visit)}
                                                                className="rounded-lg bg-[#00696b] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#004f51]"
                                                            >
                                                                Approve Visit
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => openReschedule(visit)}
                                                                className="rounded-lg border border-[#d5d9dc] bg-white px-4 py-2 text-sm font-semibold text-[#303438] transition hover:bg-[#f7f8f8]"
                                                            >
                                                                Reschedule
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => openReject(visit)}
                                                                className="rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50"
                                                            >
                                                                Reject
                                                            </button>
                                                        </>
                                                    )}

                                                    {(visit.status === "approved" || visit.status === "rescheduled") && (
                                                        <>
                                                            <button
                                                                type="button"
                                                                onClick={() => completeMutation.mutate(visit._id)}
                                                                disabled={completeMutation.isPending}
                                                                className="rounded-lg bg-[#00696b] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#004f51] disabled:opacity-60"
                                                            >
                                                                {completeMutation.isPending ? "Updating..." : "Mark Completed"}
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => cancelMutation.mutate(visit._id)}
                                                                disabled={cancelMutation.isPending}
                                                                className="rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:opacity-60"
                                                            >
                                                                {cancelMutation.isPending ? "Cancelling..." : "Cancel Visit"}
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => openReschedule(visit)}
                                                                className="rounded-lg border border-[#d5d9dc] bg-white px-4 py-2 text-sm font-semibold text-[#303438] transition hover:bg-[#f7f8f8]"
                                                            >
                                                                Reschedule
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </article>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>

            {/* ======================================================== */}
            {/* RENTAL APPLICATION DETAIL MODAL */}
            {/* ======================================================== */}
            {selectedRentalBooking && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
                    <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
                        <div className="flex items-start justify-between border-b border-gray-100 pb-4">
                            <div>
                                <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#00696b]">
                                    Rental Application
                                </span>
                                <h2 className="mt-2 text-xl font-bold text-[#191c1d]">
                                    {getPropertyTitle(selectedRentalBooking.propertyId)}
                                </h2>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSelectedRentalBooking(null)}
                                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="mt-5 space-y-5">
                            {/* Applicant Info */}
                            <div className="rounded-xl border border-gray-100 bg-[#f8f9fa] p-4">
                                <p className="text-xs font-bold uppercase tracking-wider text-[#75777e]">
                                    Prospective Tenant
                                </p>
                                <div className="mt-2 flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#00696b] font-bold text-white text-sm">
                                        {getRequester(selectedRentalBooking.userId).name.slice(0, 2).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="font-bold text-[#191c1d]">
                                            {getRequester(selectedRentalBooking.userId).name}
                                        </p>
                                        <p className="text-xs text-[#75777e]">
                                            {getRequester(selectedRentalBooking.userId).email} · {getRequester(selectedRentalBooking.userId).phone || "No phone"}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Terms Breakdown */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="rounded-xl border border-gray-100 bg-[#f8f9fa] p-3.5">
                                    <p className="text-xs font-semibold text-[#75777e]">Monthly Rent</p>
                                    <p className="mt-1 text-base font-bold text-[#00696b]">
                                        {formatPrice(selectedRentalBooking.monthlyRent)}
                                    </p>
                                </div>

                                <div className="rounded-xl border border-gray-100 bg-[#f8f9fa] p-3.5">
                                    <p className="text-xs font-semibold text-[#75777e]">Advance Deposit</p>
                                    <p className="mt-1 text-base font-bold text-[#191c1d]">
                                        {formatPrice(selectedRentalBooking.advanceAmount)}
                                    </p>
                                </div>

                                <div className="rounded-xl border border-gray-100 bg-[#f8f9fa] p-3.5">
                                    <p className="text-xs font-semibold text-[#75777e]">Proposed Start Date</p>
                                    <p className="mt-1 text-sm font-bold text-[#191c1d]">
                                        {formatDate(selectedRentalBooking.startDate)}
                                    </p>
                                </div>

                                <div className="rounded-xl border border-gray-100 bg-[#f8f9fa] p-3.5">
                                    <p className="text-xs font-semibold text-[#75777e]">Proposed End Date</p>
                                    <p className="mt-1 text-sm font-bold text-[#191c1d]">
                                        {formatDate(selectedRentalBooking.endDate)}
                                    </p>
                                </div>
                            </div>

                            {/* Occupied Property Inquiry Details */}
                            {selectedRentalBooking.tenantInquiry && (
                                <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-xs text-amber-950">
                                    <p className="font-bold text-sm text-amber-900">
                                        Current Tenant Move-Out Inquiry
                                    </p>
                                    <p className="mt-1.5 leading-relaxed text-amber-800">
                                        Question: &ldquo;{selectedRentalBooking.tenantInquiry.question}&rdquo;
                                    </p>
                                    <div className="mt-2.5 flex items-center justify-between border-t border-amber-200 pt-2 font-medium">
                                        <span>Status: {selectedRentalBooking.tenantInquiry.status.replaceAll("_", " ")}</span>
                                        <span>
                                            Deadline: {new Date(selectedRentalBooking.tenantInquiry.deadline).toLocaleDateString("en-IN")}
                                        </span>
                                    </div>
                                    {selectedRentalBooking.tenantInquiry.responseMessage && (
                                        <div className="mt-2 rounded-lg bg-white/80 p-2.5 font-medium text-amber-900 border border-amber-200">
                                            Current tenant reply: &ldquo;{selectedRentalBooking.tenantInquiry.responseMessage}&rdquo;
                                        </div>
                                    )}
                                </div>
                            )}

                            {selectedRentalBooking.notes && (
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-wider text-[#75777e]">
                                        Applicant Notes
                                    </p>
                                    <p className="mt-1.5 rounded-xl border border-gray-100 bg-gray-50 p-3 text-sm text-gray-800">
                                        {selectedRentalBooking.notes}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Modal Actions */}
                        <div className="mt-6 flex items-center justify-end gap-3 border-t border-gray-100 pt-4">
                            <button
                                type="button"
                                onClick={() => setSelectedRentalBooking(null)}
                                className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                            >
                                Close
                            </button>

                            {selectedRentalBooking.status === "PENDING" && (
                                <>
                                    <button
                                        type="button"
                                        disabled={reviewBooking.isPending}
                                        onClick={async () => {
                                            await reviewBooking.mutateAsync({
                                                bookingId: selectedRentalBooking._id,
                                                decision: "REJECTED",
                                            });
                                            setSelectedRentalBooking(null);
                                        }}
                                        className="rounded-lg border border-[#b42318] px-4 py-2.5 text-sm font-semibold text-[#b42318] hover:bg-red-50"
                                    >
                                        Reject
                                    </button>

                                    <button
                                        type="button"
                                        disabled={
                                            reviewBooking.isPending ||
                                            (selectedRentalBooking.tenantInquiry?.status === "PENDING" &&
                                                new Date() < new Date(selectedRentalBooking.tenantInquiry.deadline))
                                        }
                                        onClick={async () => {
                                            await reviewBooking.mutateAsync({
                                                bookingId: selectedRentalBooking._id,
                                                decision: "APPROVED",
                                            });
                                            setSelectedRentalBooking(null);
                                        }}
                                        className="rounded-lg bg-[#00696b] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#004f51] disabled:opacity-50"
                                    >
                                        {reviewBooking.isPending ? "Approving..." : "Approve Application"}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ======================================================== */}
            {/* VISIT DETAIL MODAL */}
            {/* ======================================================== */}
            {selectedVisitDetail && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
                    <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
                        <div className="flex items-start justify-between border-b border-gray-100 pb-4">
                            <div>
                                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-blue-700">
                                    Tour Visit Request
                                </span>
                                <h2 className="mt-2 text-xl font-bold text-[#191c1d]">
                                    {getPropertyTitle(selectedVisitDetail.property)}
                                </h2>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSelectedVisitDetail(null)}
                                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="mt-5 space-y-4">
                            <div className="rounded-xl border border-gray-100 bg-[#f8f9fa] p-4">
                                <p className="text-xs font-bold uppercase tracking-wider text-[#75777e]">
                                    Prospective Visitor
                                </p>
                                <p className="mt-1 font-bold text-[#191c1d]">
                                    {getRequester(selectedVisitDetail.requester).name}
                                </p>
                                <p className="text-xs text-[#75777e]">
                                    {getRequester(selectedVisitDetail.requester).email} · {getRequester(selectedVisitDetail.requester).phone || "No phone"}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div className="rounded-xl border border-gray-100 bg-[#f8f9fa] p-3">
                                    <p className="text-xs text-[#75777e]">Requested Date</p>
                                    <p className="mt-1 font-bold text-[#191c1d]">
                                        {formatDate(selectedVisitDetail.requestedDate)}
                                    </p>
                                </div>
                                <div className="rounded-xl border border-gray-100 bg-[#f8f9fa] p-3">
                                    <p className="text-xs text-[#75777e]">Requested Time</p>
                                    <p className="mt-1 font-bold text-[#191c1d]">
                                        {selectedVisitDetail.requestedTime}
                                    </p>
                                </div>
                            </div>

                            {selectedVisitDetail.message && (
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-wider text-[#75777e]">
                                        Visitor Message
                                    </p>
                                    <p className="mt-1.5 rounded-xl border border-gray-100 bg-gray-50 p-3 text-xs text-gray-800">
                                        {selectedVisitDetail.message}
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="mt-6 flex justify-end border-t border-gray-100 pt-4">
                            <button
                                type="button"
                                onClick={() => setSelectedVisitDetail(null)}
                                className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ======================================================== */}
            {/* VISIT ACTION FORM DIALOG (APPROVE / REJECT / RESCHEDULE) */}
            {/* ======================================================== */}
            {activeVisit && action && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
                    <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h2 className="text-xl font-bold text-[#191c1d]">
                                    {action === "approve"
                                        ? "Approve Visit Request"
                                        : action === "reject"
                                        ? "Reject Visit Request"
                                        : "Reschedule Visit"}
                                </h2>
                                <p className="mt-1 text-sm text-[#686d72]">
                                    {getPropertyTitle(activeVisit.property)}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={closeAction}
                                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={handleActionSubmit} className="mt-6 flex flex-col gap-4">
                            {action !== "reject" && (
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div>
                                        <label className="text-xs font-semibold text-[#44474d]">
                                            Scheduled Date
                                        </label>
                                        <input
                                            type="date"
                                            value={scheduledDate}
                                            onChange={(e) => setScheduledDate(e.target.value)}
                                            required
                                            className="mt-1 h-11 w-full rounded-lg border border-[#c5c6cd] px-3 text-sm focus:border-[#00696b] focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-[#44474d]">
                                            Scheduled Time
                                        </label>
                                        <input
                                            type="text"
                                            value={scheduledTime}
                                            onChange={(e) => setScheduledTime(e.target.value)}
                                            placeholder="e.g. 10:30 AM"
                                            required
                                            className="mt-1 h-11 w-full rounded-lg border border-[#c5c6cd] px-3 text-sm focus:border-[#00696b] focus:outline-none"
                                        />
                                    </div>
                                </div>
                            )}

                            {action !== "approve" && (
                                <div>
                                    <label className="text-xs font-semibold text-[#44474d]">
                                        {action === "reject" ? "Reason for rejection" : "Reason for rescheduling"}
                                    </label>
                                    <textarea
                                        value={reason}
                                        onChange={(e) => setReason(e.target.value)}
                                        rows={3}
                                        placeholder="Add an explanation for the visitor..."
                                        required
                                        className="mt-1 w-full rounded-lg border border-[#c5c6cd] p-3 text-sm focus:border-[#00696b] focus:outline-none"
                                    />
                                </div>
                            )}

                            <div className="mt-4 flex items-center justify-end gap-3 border-t border-gray-100 pt-4">
                                <button
                                    type="button"
                                    onClick={closeAction}
                                    className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={
                                        isMutatingVisit ||
                                        (action !== "reject" && (!scheduledDate || !scheduledTime)) ||
                                        (action !== "approve" && !reason.trim())
                                    }
                                    className="rounded-lg bg-[#00696b] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#004f51] disabled:opacity-60"
                                >
                                    {isMutatingVisit
                                        ? "Submitting..."
                                        : action === "approve"
                                        ? "Approve Request"
                                        : action === "reject"
                                        ? "Reject Request"
                                        : "Reschedule Visit"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardShell>
    );
}