"use client";

import { useState } from "react";
import {
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";

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

type ActionType =
    | "approve"
    | "reject"
    | "reschedule"
    | null;

const statusStyles: Record<VisitStatus, string> = {
    pending:
        "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200",

    approved:
        "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200",

    rejected:
        "bg-red-50 text-red-700 ring-1 ring-inset ring-red-200",

    rescheduled:
        "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200",

    cancelled:
        "bg-gray-100 text-gray-600 ring-1 ring-inset ring-gray-200",

    completed:
        "bg-purple-50 text-purple-700 ring-1 ring-inset ring-purple-200",
};

const statusLabels: Record<VisitStatus, string> = {
    pending: "Pending",
    approved: "Approved",
    rejected: "Rejected",
    rescheduled: "Rescheduled",
    cancelled: "Cancelled",
    completed: "Completed",
};

function formatDate(date?: string) {
    if (!date) return "—";

    const value = date.slice(0, 10);
    const [year, month, day] = value.split("-");

    if (!year || !month || !day) {
        return date;
    }

    return new Intl.DateTimeFormat("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    }).format(
        new Date(
            Number(year),
            Number(month) - 1,
            Number(day)
        )
    );
}

function maskId(id?: string) {
    if (!id) return "—";

    if (id.length <= 10) {
        return id;
    }

    return `${id.slice(0, 6)}...${id.slice(-4)}`;
}

export default function OwnerRequestsPage() {
    const queryClient = useQueryClient();

    const [activeVisit, setActiveVisit] =
        useState<Visit | null>(null);

    const [action, setAction] =
        useState<ActionType>(null);

    const [scheduledDate, setScheduledDate] =
        useState("");

    const [scheduledTime, setScheduledTime] =
        useState("");

    const [reason, setReason] = useState("");

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
            if (!activeVisit) {
                throw new Error("No visit selected.");
            }

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
            if (!activeVisit) {
                throw new Error("No visit selected.");
            }

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
            if (!activeVisit) {
                throw new Error("No visit selected.");
            }

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
        mutationFn: (visitId: string) =>
            completeVisit(visitId),

        onSuccess: refreshVisits,
    });

    const cancelMutation = useMutation({
        mutationFn: (visitId: string) =>
            cancelVisit(visitId),

        onSuccess: refreshVisits,
    });

    function openApprove(visit: Visit) {
        setActiveVisit(visit);
        setAction("approve");
        setReason("");

        setScheduledDate(
            visit.scheduledDate?.slice(0, 10) ??
                visit.requestedDate.slice(0, 10)
        );

        setScheduledTime(
            visit.scheduledTime ??
                visit.requestedTime
        );
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
            visit.scheduledDate?.slice(0, 10) ??
                visit.requestedDate.slice(0, 10)
        );

        setScheduledTime(
            visit.scheduledTime ??
                visit.requestedTime
        );
    }

    function closeAction() {
        setActiveVisit(null);
        setAction(null);
        setScheduledDate("");
        setScheduledTime("");
        setReason("");
    }

    async function handleActionSubmit(
        event: React.FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        if (action === "approve") {
            if (!scheduledDate || !scheduledTime) {
                return;
            }

            await approveMutation.mutateAsync();
            return;
        }

        if (action === "reject") {
            if (!reason.trim()) {
                return;
            }

            await rejectMutation.mutateAsync();
            return;
        }

        if (action === "reschedule") {
            if (
                !scheduledDate ||
                !scheduledTime ||
                !reason.trim()
            ) {
                return;
            }

            await rescheduleMutation.mutateAsync();
        }
    }

    const visits = ownerVisitsQuery.data ?? [];

    const pendingCount = visits.filter(
        (visit) => visit.status === "pending"
    ).length;

    const activeCount = visits.filter(
        (visit) =>
            visit.status === "approved" ||
            visit.status === "rescheduled"
    ).length;

    const isMutating =
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

                            <h1 className="mt-2 text-3xl font-bold tracking-[-0.04em] text-[#191c1d]">
                                Visit Requests
                            </h1>

                            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#44474d]">
                                Review property visit requests and manage
                                their schedules and status.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() =>
                                ownerVisitsQuery.refetch()
                            }
                            disabled={
                                ownerVisitsQuery.isFetching
                            }
                            className="inline-flex h-10 items-center justify-center rounded-lg border border-[#d5d9dc] bg-white px-4 text-sm font-semibold text-[#303438] transition hover:bg-[#f7f8f8] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {ownerVisitsQuery.isFetching
                                ? "Refreshing..."
                                : "Refresh"}
                        </button>
                    </div>

                    {/* Summary */}

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <div className="rounded-xl border border-[#e1e4e6] bg-white p-5">
                            <p className="text-sm text-[#686d72]">
                                Total requests
                            </p>

                            <p className="mt-2 text-2xl font-bold text-[#191c1d]">
                                {visits.length}
                            </p>
                        </div>

                        <div className="rounded-xl border border-[#e1e4e6] bg-white p-5">
                            <p className="text-sm text-[#686d72]">
                                Pending review
                            </p>

                            <p className="mt-2 text-2xl font-bold text-[#191c1d]">
                                {pendingCount}
                            </p>
                        </div>

                        <div className="rounded-xl border border-[#e1e4e6] bg-white p-5">
                            <p className="text-sm text-[#686d72]">
                                Scheduled
                            </p>

                            <p className="mt-2 text-2xl font-bold text-[#191c1d]">
                                {activeCount}
                            </p>
                        </div>
                    </div>

                    {/* Error */}

                    {ownerVisitsQuery.isError && (
                        <div className="rounded-xl border border-red-200 bg-red-50 p-5">
                            <p className="font-semibold text-red-800">
                                Failed to load visit requests.
                            </p>

                            <p className="mt-1 text-sm text-red-700">
                                Please refresh the page and try again.
                            </p>
                        </div>
                    )}

                    {/* Loading */}

                    {ownerVisitsQuery.isLoading && (
                        <div className="rounded-xl border border-[#e1e4e6] bg-white p-10 text-center">
                            <p className="text-sm text-[#686d72]">
                                Loading visit requests...
                            </p>
                        </div>
                    )}

                    {/* Empty */}

                    {!ownerVisitsQuery.isLoading &&
                        !ownerVisitsQuery.isError &&
                        visits.length === 0 && (
                            <div className="rounded-xl border border-dashed border-[#cfd4d7] bg-white p-12 text-center">
                                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#e8f6f6] text-[#00696b]">
                                    <span className="text-xl">
                                        ✓
                                    </span>
                                </div>

                                <h2 className="mt-4 text-lg font-semibold text-[#191c1d]">
                                    No visit requests
                                </h2>

                                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#686d72]">
                                    New visit requests from users will appear
                                    here.
                                </p>
                            </div>
                        )}

                    {/* Request list */}

                    {!ownerVisitsQuery.isLoading &&
                        !ownerVisitsQuery.isError &&
                        visits.length > 0 && (
                            <div className="space-y-4">
                                {visits.map((visit) => (
                                    <article
                                        key={visit._id}
                                        className="rounded-xl border border-[#e1e4e6] bg-white p-5 shadow-sm"
                                    >
                                        <div className="flex flex-col gap-5">
                                            {/* Top */}

                                            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                                <div>
                                                    <div className="flex flex-wrap items-center gap-3">
                                                        <h2 className="text-lg font-bold text-[#191c1d]">
                                                            Property{" "}
                                                            {maskId(
                                                                visit.property
                                                            )}
                                                        </h2>

                                                        <span
                                                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[visit.status]}`}
                                                        >
                                                            {
                                                                statusLabels[
                                                                    visit.status
                                                                ]
                                                            }
                                                        </span>
                                                    </div>

                                                    <p className="mt-2 text-sm text-[#686d72]">
                                                        Request ID:{" "}
                                                        <span className="font-medium text-[#44474d]">
                                                            {maskId(
                                                                visit._id
                                                            )}
                                                        </span>
                                                    </p>
                                                </div>

                                                <div className="text-left lg:text-right">
                                                    <p className="text-xs font-semibold uppercase tracking-wide text-[#7a7f84]">
                                                        Requested
                                                    </p>

                                                    <p className="mt-1 text-sm font-semibold text-[#303438]">
                                                        {formatDate(
                                                            visit.requestedDate
                                                        )}
                                                    </p>

                                                    <p className="text-sm text-[#686d72]">
                                                        {
                                                            visit.requestedTime
                                                        }
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Details */}

                                            <div className="grid grid-cols-1 gap-4 rounded-lg bg-[#f8f9f9] p-4 sm:grid-cols-2 lg:grid-cols-4">
                                                <div>
                                                    <p className="text-xs font-semibold uppercase tracking-wide text-[#7a7f84]">
                                                        Requester
                                                    </p>

                                                    <p className="mt-1 break-all text-sm font-medium text-[#303438]">
                                                        {maskId(
                                                            visit.requester
                                                        )}
                                                    </p>
                                                </div>

                                                <div>
                                                    <p className="text-xs font-semibold uppercase tracking-wide text-[#7a7f84]">
                                                        Requested date
                                                    </p>

                                                    <p className="mt-1 text-sm font-medium text-[#303438]">
                                                        {formatDate(
                                                            visit.requestedDate
                                                        )}
                                                    </p>
                                                </div>

                                                <div>
                                                    <p className="text-xs font-semibold uppercase tracking-wide text-[#7a7f84]">
                                                        Requested time
                                                    </p>

                                                    <p className="mt-1 text-sm font-medium text-[#303438]">
                                                        {
                                                            visit.requestedTime
                                                        }
                                                    </p>
                                                </div>

                                                <div>
                                                    <p className="text-xs font-semibold uppercase tracking-wide text-[#7a7f84]">
                                                        Scheduled
                                                    </p>

                                                    <p className="mt-1 text-sm font-medium text-[#303438]">
                                                        {visit.scheduledDate
                                                            ? `${formatDate(
                                                                  visit.scheduledDate
                                                              )} ${
                                                                  visit.scheduledTime ??
                                                                  ""
                                                              }`
                                                            : "Not scheduled"}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Message */}

                                            {visit.message && (
                                                <div>
                                                    <p className="text-xs font-semibold uppercase tracking-wide text-[#7a7f84]">
                                                        User message
                                                    </p>

                                                    <p className="mt-2 rounded-lg border border-[#e1e4e6] bg-white p-3 text-sm leading-6 text-[#44474d]">
                                                        {
                                                            visit.message
                                                        }
                                                    </p>
                                                </div>
                                            )}

                                            {/* Rejection / reschedule reason */}

                                            {visit.rejectionReason && (
                                                <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                                                    <p className="text-xs font-semibold uppercase tracking-wide text-red-700">
                                                        Rejection reason
                                                    </p>

                                                    <p className="mt-1 text-sm text-red-800">
                                                        {
                                                            visit.rejectionReason
                                                        }
                                                    </p>
                                                </div>
                                            )}

                                            {visit.rescheduleReason && (
                                                <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                                                    <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
                                                        Reschedule reason
                                                    </p>

                                                    <p className="mt-1 text-sm text-blue-800">
                                                        {
                                                            visit.rescheduleReason
                                                        }
                                                    </p>
                                                </div>
                                            )}

                                            {/* Actions */}

                                            <div className="flex flex-wrap gap-2 border-t border-[#eceeef] pt-4">
                                                {visit.status ===
                                                    "pending" && (
                                                    <>
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                openApprove(
                                                                    visit
                                                                )
                                                            }
                                                            className="rounded-lg bg-[#00696b] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#005759]"
                                                        >
                                                            Approve
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                openReschedule(
                                                                    visit
                                                                )
                                                            }
                                                            className="rounded-lg border border-[#d5d9dc] bg-white px-4 py-2 text-sm font-semibold text-[#303438] transition hover:bg-[#f7f8f8]"
                                                        >
                                                            Reschedule
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                openReject(
                                                                    visit
                                                                )
                                                            }
                                                            className="rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50"
                                                        >
                                                            Reject
                                                        </button>
                                                    </>
                                                )}

                                                {(visit.status ===
                                                    "approved" ||
                                                    visit.status ===
                                                        "rescheduled") && (
                                                    <>
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                completeMutation.mutate(
                                                                    visit._id
                                                                )
                                                            }
                                                            disabled={
                                                                completeMutation.isPending
                                                            }
                                                            className="rounded-lg bg-[#00696b] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#005759] disabled:cursor-not-allowed disabled:opacity-60"
                                                        >
                                                            {completeMutation.isPending
                                                                ? "Updating..."
                                                                : "Mark completed"}
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                cancelMutation.mutate(
                                                                    visit._id
                                                                )
                                                            }
                                                            disabled={
                                                                cancelMutation.isPending
                                                            }
                                                            className="rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                                                        >
                                                            {cancelMutation.isPending
                                                                ? "Cancelling..."
                                                                : "Cancel visit"}
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                openReschedule(
                                                                    visit
                                                                )
                                                            }
                                                            className="rounded-lg border border-[#d5d9dc] bg-white px-4 py-2 text-sm font-semibold text-[#303438] transition hover:bg-[#f7f8f8]"
                                                        >
                                                            Reschedule
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        )}
                </div>
            </main>

            {/* Action dialog */}

            {activeVisit && action && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h2 className="text-xl font-bold text-[#191c1d]">
                                    {action === "approve"
                                        ? "Approve visit request"
                                        : action === "reject"
                                          ? "Reject visit request"
                                          : "Reschedule visit"}
                                </h2>

                                <p className="mt-1 text-sm text-[#686d72]">
                                    Property{" "}
                                    {maskId(
                                        activeVisit.property
                                    )}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={closeAction}
                                className="text-2xl leading-none text-[#686d72] hover:text-[#191c1d]"
                            >
                                ×
                            </button>
                        </div>

                        <form
                            onSubmit={handleActionSubmit}
                            className="mt-6 space-y-5"
                        >
                            {action !== "reject" && (
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <label className="block">
                                        <span className="text-sm font-semibold text-[#303438]">
                                            {action ===
                                            "approve"
                                                ? "Scheduled date"
                                                : "New date"}
                                        </span>

                                        <input
                                            type="date"
                                            value={
                                                scheduledDate
                                            }
                                            onChange={(
                                                event
                                            ) =>
                                                setScheduledDate(
                                                    event
                                                        .target
                                                        .value
                                                )
                                            }
                                            min={new Date()
                                                .toISOString()
                                                .slice(
                                                    0,
                                                    10
                                                )}
                                            required
                                            className="mt-2 h-11 w-full rounded-lg border border-[#d5d9dc] bg-white px-3 text-sm outline-none focus:border-[#00696b] focus:ring-2 focus:ring-[#00696b]/10"
                                        />
                                    </label>

                                    <label className="block">
                                        <span className="text-sm font-semibold text-[#303438]">
                                            {action ===
                                            "approve"
                                                ? "Scheduled time"
                                                : "New time"}
                                        </span>

                                        <input
                                            type="time"
                                            value={
                                                scheduledTime
                                            }
                                            onChange={(
                                                event
                                            ) =>
                                                setScheduledTime(
                                                    event
                                                        .target
                                                        .value
                                                )
                                            }
                                            required
                                            className="mt-2 h-11 w-full rounded-lg border border-[#d5d9dc] bg-white px-3 text-sm outline-none focus:border-[#00696b] focus:ring-2 focus:ring-[#00696b]/10"
                                        />
                                    </label>
                                </div>
                            )}

                            {action !== "approve" && (
                                <label className="block">
                                    <span className="text-sm font-semibold text-[#303438]">
                                        {action === "reject"
                                            ? "Rejection reason"
                                            : "Reschedule reason"}
                                    </span>

                                    <textarea
                                        value={reason}
                                        onChange={(event) =>
                                            setReason(
                                                event.target
                                                    .value
                                            )
                                        }
                                        rows={4}
                                        maxLength={1000}
                                        required
                                        placeholder={
                                            action ===
                                            "reject"
                                                ? "Explain why this visit request is being rejected..."
                                                : "Explain why the visit needs to be rescheduled..."
                                        }
                                        className="mt-2 w-full resize-none rounded-lg border border-[#d5d9dc] bg-white px-3 py-3 text-sm leading-6 outline-none focus:border-[#00696b] focus:ring-2 focus:ring-[#00696b]/10"
                                    />

                                    <p className="mt-1 text-right text-xs text-[#7a7f84]">
                                        {reason.length}/1000
                                    </p>
                                </label>
                            )}

                            {(approveMutation.isError ||
                                rejectMutation.isError ||
                                rescheduleMutation.isError) && (
                                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                                    Failed to update this request. Please
                                    check the details and try again.
                                </div>
                            )}

                            <div className="flex justify-end gap-3 border-t border-[#eceeef] pt-5">
                                <button
                                    type="button"
                                    onClick={closeAction}
                                    disabled={isMutating}
                                    className="rounded-lg border border-[#d5d9dc] bg-white px-4 py-2.5 text-sm font-semibold text-[#303438] hover:bg-[#f7f8f8] disabled:opacity-60"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={
                                        isMutating ||
                                        (action !==
                                            "reject" &&
                                            (!scheduledDate ||
                                                !scheduledTime)) ||
                                        (action !==
                                            "approve" &&
                                            !reason.trim())
                                    }
                                    className="rounded-lg bg-[#00696b] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#005759] disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {isMutating
                                        ? "Updating..."
                                        : action ===
                                            "approve"
                                          ? "Approve request"
                                          : action ===
                                              "reject"
                                            ? "Reject request"
                                            : "Reschedule visit"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardShell>
    );
}