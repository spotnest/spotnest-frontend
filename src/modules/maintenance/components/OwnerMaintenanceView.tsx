"use client";

import React, { useState } from "react";
import {
    useOwnerMaintenanceRequests,
    useOwnerMaintenanceSummary,
    useUpdateMaintenanceStatus,
} from "../hooks/useMaintenance";
import type { MaintenanceRequest, MaintenanceStatus } from "../types/maintenance";
import {
    ALL_FILTER,
    CATEGORY_OPTIONS,
    PRIORITY_OPTIONS,
    STATUS_OPTIONS,
} from "../constants/maintenance";
import StatusBadge from "./StatusBadge";
import PriorityBadge from "./PriorityBadge";
import StatusTimeline from "./StatusTimeline";
import PhotoGallery from "./PhotoGallery";

export const OwnerMaintenanceView: React.FC = () => {
    // Filters & Pagination
    const [statusFilter, setStatusFilter] = useState<string>(ALL_FILTER);
    const [priorityFilter, setPriorityFilter] = useState<string>(ALL_FILTER);
    const [categoryFilter, setCategoryFilter] = useState<string>(ALL_FILTER);
    const [search, setSearch] = useState<string>("");
    const [page, setPage] = useState<number>(1);

    // Modals
    const [selectedRequest, setSelectedRequest] = useState<MaintenanceRequest | null>(null);

    // Action Modal States
    const [rejectingRequest, setRejectingRequest] = useState<MaintenanceRequest | null>(null);
    const [rejectionReason, setRejectionReason] = useState<string>("");

    const [schedulingRequest, setSchedulingRequest] = useState<MaintenanceRequest | null>(null);
    const [scheduledDate, setScheduledDate] = useState<string>("");

    const [completingRequest, setCompletingRequest] = useState<MaintenanceRequest | null>(null);
    const [resolutionNote, setResolutionNote] = useState<string>("");

    const [actionError, setActionError] = useState<string>("");

    // Queries & Mutations
    const { data: summary, isLoading: isLoadingSummary } = useOwnerMaintenanceSummary();
    const { data: reqData, isLoading: isLoadingReqs, isError, error, refetch } = useOwnerMaintenanceRequests({
        status: statusFilter,
        priority: priorityFilter,
        category: categoryFilter,
        search,
        page,
        limit: 10,
    });

    const updateStatusMutation = useUpdateMaintenanceStatus();

    const handleAction = async (
        req: MaintenanceRequest,
        targetStatus: MaintenanceStatus,
        extra?: { rejectionReason?: string; scheduledDate?: string; resolutionNote?: string }
    ) => {
        setActionError("");
        try {
            await updateStatusMutation.mutateAsync({
                id: req.id,
                payload: {
                    status: targetStatus,
                    ...extra,
                },
            });
            // Close modals
            setRejectingRequest(null);
            setRejectionReason("");
            setSchedulingRequest(null);
            setScheduledDate("");
            setCompletingRequest(null);
            setResolutionNote("");

            if (selectedRequest?.id === req.id) {
                // update selected request locally or close
                setSelectedRequest(null);
            }
        } catch (err: any) {
            setActionError(err?.response?.data?.message || "Failed to update maintenance request.");
        }
    };

    const requests = reqData?.requests || [];
    const totalPages = reqData?.pagination?.pages || 1;

    return (
        <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
            {/* Header */}
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                    Maintenance Management
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                    Review and handle tenant repair requests for your rental properties.
                </p>
            </div>

            {/* SUMMARY CARDS */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <button
                    type="button"
                    onClick={() => { setStatusFilter("PENDING"); setPage(1); }}
                    className={`rounded-2xl border p-4 text-left transition-all ${
                        statusFilter === "PENDING"
                            ? "border-amber-400 bg-amber-50/90 ring-2 ring-amber-400/50"
                            : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                >
                    <span className="block text-xs font-semibold text-amber-700">Pending</span>
                    <span className="mt-1 block text-2xl font-extrabold text-slate-900">
                        {isLoadingSummary ? "-" : summary?.pending || 0}
                    </span>
                </button>

                <button
                    type="button"
                    onClick={() => { setStatusFilter("ACCEPTED"); setPage(1); }}
                    className={`rounded-2xl border p-4 text-left transition-all ${
                        statusFilter === "ACCEPTED"
                            ? "border-blue-400 bg-blue-50/90 ring-2 ring-blue-400/50"
                            : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                >
                    <span className="block text-xs font-semibold text-blue-700">Accepted</span>
                    <span className="mt-1 block text-2xl font-extrabold text-slate-900">
                        {isLoadingSummary ? "-" : summary?.accepted || 0}
                    </span>
                </button>

                <button
                    type="button"
                    onClick={() => { setStatusFilter("SCHEDULED"); setPage(1); }}
                    className={`rounded-2xl border p-4 text-left transition-all ${
                        statusFilter === "SCHEDULED"
                            ? "border-purple-400 bg-purple-50/90 ring-2 ring-purple-400/50"
                            : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                >
                    <span className="block text-xs font-semibold text-purple-700">Scheduled</span>
                    <span className="mt-1 block text-2xl font-extrabold text-slate-900">
                        {isLoadingSummary ? "-" : summary?.scheduled || 0}
                    </span>
                </button>

                <button
                    type="button"
                    onClick={() => { setStatusFilter("IN_PROGRESS"); setPage(1); }}
                    className={`rounded-2xl border p-4 text-left transition-all ${
                        statusFilter === "IN_PROGRESS"
                            ? "border-teal-400 bg-teal-50/90 ring-2 ring-teal-400/50"
                            : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                >
                    <span className="block text-xs font-semibold text-teal-700">In Progress</span>
                    <span className="mt-1 block text-2xl font-extrabold text-slate-900">
                        {isLoadingSummary ? "-" : summary?.inProgress || 0}
                    </span>
                </button>

                <button
                    type="button"
                    onClick={() => { setStatusFilter("COMPLETED"); setPage(1); }}
                    className={`rounded-2xl border p-4 text-left transition-all ${
                        statusFilter === "COMPLETED"
                            ? "border-emerald-400 bg-emerald-50/90 ring-2 ring-emerald-400/50"
                            : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                >
                    <span className="block text-xs font-semibold text-emerald-700">Completed</span>
                    <span className="mt-1 block text-2xl font-extrabold text-slate-900">
                        {isLoadingSummary ? "-" : summary?.completed || 0}
                    </span>
                </button>

                <button
                    type="button"
                    onClick={() => { setStatusFilter("REJECTED"); setPage(1); }}
                    className={`rounded-2xl border p-4 text-left transition-all ${
                        statusFilter === "REJECTED"
                            ? "border-rose-400 bg-rose-50/90 ring-2 ring-rose-400/50"
                            : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                >
                    <span className="block text-xs font-semibold text-rose-700">Rejected</span>
                    <span className="mt-1 block text-2xl font-extrabold text-slate-900">
                        {isLoadingSummary ? "-" : summary?.rejected || 0}
                    </span>
                </button>
            </div>

            {/* FILTERS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
                <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Status</label>
                    <select
                        value={statusFilter}
                        onChange={(e) => {
                            setStatusFilter(e.target.value);
                            setPage(1);
                        }}
                        className="w-full rounded-xl border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 font-medium focus:border-[#00696b] focus:ring-[#00696b]"
                    >
                        <option value={ALL_FILTER}>All Statuses</option>
                        {STATUS_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Priority</label>
                    <select
                        value={priorityFilter}
                        onChange={(e) => {
                            setPriorityFilter(e.target.value);
                            setPage(1);
                        }}
                        className="w-full rounded-xl border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 font-medium focus:border-[#00696b] focus:ring-[#00696b]"
                    >
                        <option value={ALL_FILTER}>All Priorities</option>
                        {PRIORITY_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Category</label>
                    <select
                        value={categoryFilter}
                        onChange={(e) => {
                            setCategoryFilter(e.target.value);
                            setPage(1);
                        }}
                        className="w-full rounded-xl border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 font-medium focus:border-[#00696b] focus:ring-[#00696b]"
                    >
                        <option value={ALL_FILTER}>All Categories</option>
                        {CATEGORY_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Search</label>
                    <input
                        type="text"
                        placeholder="Search title or tenant..."
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setPage(1);
                        }}
                        className="w-full rounded-xl border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 focus:border-[#00696b] focus:ring-[#00696b]"
                    />
                </div>
            </div>

            {/* Loading & Errors */}
            {isLoadingReqs && (
                <div className="py-12 text-center">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#00696b] border-r-transparent"></div>
                    <p className="mt-2 text-xs text-slate-500">Loading requests...</p>
                </div>
            )}

            {isError && (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-800 flex justify-between items-center">
                    <p className="text-sm">{error instanceof Error ? error.message : "Failed to load requests"}</p>
                    <button type="button" onClick={() => refetch()} className="text-xs font-bold underline">Retry</button>
                </div>
            )}

            {/* Empty state */}
            {!isLoadingReqs && requests.length === 0 && (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
                    <svg className="mx-auto h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <h3 className="mt-3 text-base font-bold text-slate-900">No requests found</h3>
                    <p className="mt-1 text-xs text-slate-500">
                        There are no maintenance requests matching your filters.
                    </p>
                </div>
            )}

            {/* REQUEST LIST */}
            {!isLoadingReqs && requests.length > 0 && (
                <div className="space-y-4">
                    {requests.map((req) => (
                        <div
                            key={req.id}
                            className={`rounded-2xl border bg-white p-5 shadow-sm transition-all ${
                                req.priority === "Emergency"
                                    ? "border-red-300 bg-red-50/30 ring-1 ring-red-400/40"
                                    : "border-slate-200"
                            }`}
                        >
                            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                                <div className="space-y-2 flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <StatusBadge status={req.status} />
                                        <PriorityBadge priority={req.priority} />
                                        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                                            {req.category}
                                        </span>
                                        <span className="text-xs text-slate-400 ml-auto lg:ml-0 font-medium">
                                            Reported {new Date(req.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>

                                    <h3 className="text-lg font-bold text-slate-900">
                                        {req.title}
                                    </h3>

                                    <p className="text-xs text-slate-600 line-clamp-2">
                                        {req.description}
                                    </p>

                                    {/* Tenant & Property Information */}
                                    <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-xs text-slate-600 pt-1">
                                        <div>
                                            <span className="text-slate-400 font-medium">Property:</span>{" "}
                                            <strong className="text-slate-800">{req.property?.title}</strong>
                                        </div>
                                        <div>
                                            <span className="text-slate-400 font-medium">Tenant:</span>{" "}
                                            <strong className="text-slate-800">{req.tenant?.name}</strong> ({req.tenant?.email})
                                        </div>
                                        {req.preferredVisitDate && (
                                            <div>
                                                <span className="text-slate-400 font-medium">Pref. Visit:</span>{" "}
                                                <strong className="text-slate-800">{new Date(req.preferredVisitDate).toLocaleString()}</strong>
                                            </div>
                                        )}
                                        {req.scheduledDate && (
                                            <div>
                                                <span className="text-slate-400 font-medium">Scheduled Repair:</span>{" "}
                                                <strong className="text-purple-700">{new Date(req.scheduledDate).toLocaleString()}</strong>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* ACTION CONTROLS */}
                                <div className="flex flex-wrap lg:flex-col items-center lg:items-end gap-2 shrink-0 border-t lg:border-t-0 lg:border-l border-slate-100 pt-3 lg:pt-0 lg:pl-4">
                                    <button
                                        type="button"
                                        onClick={() => setSelectedRequest(req)}
                                        className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                                    >
                                        Details & History
                                    </button>

                                    {req.status === "PENDING" && (
                                        <>
                                            <button
                                                type="button"
                                                onClick={() => handleAction(req, "ACCEPTED")}
                                                disabled={updateStatusMutation.isPending}
                                                className="rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                                            >
                                                Accept Request
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setRejectingRequest(req);
                                                    setRejectionReason("");
                                                }}
                                                className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100"
                                            >
                                                Reject Request
                                            </button>
                                        </>
                                    )}

                                    {req.status === "ACCEPTED" && (
                                        <>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setSchedulingRequest(req);
                                                    setScheduledDate("");
                                                }}
                                                className="rounded-xl bg-purple-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-purple-700"
                                            >
                                                Schedule Visit
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleAction(req, "IN_PROGRESS")}
                                                disabled={updateStatusMutation.isPending}
                                                className="rounded-xl bg-teal-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-teal-700 disabled:opacity-50"
                                            >
                                                Start Repair
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setRejectingRequest(req);
                                                    setRejectionReason("");
                                                }}
                                                className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100"
                                            >
                                                Reject
                                            </button>
                                        </>
                                    )}

                                    {req.status === "SCHEDULED" && (
                                        <>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setSchedulingRequest(req);
                                                    setScheduledDate(req.scheduledDate ? new Date(req.scheduledDate).toISOString().slice(0, 16) : "");
                                                }}
                                                className="rounded-xl border border-purple-200 bg-purple-50 px-3 py-1.5 text-xs font-semibold text-purple-700 hover:bg-purple-100"
                                            >
                                                Reschedule Visit
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleAction(req, "IN_PROGRESS")}
                                                disabled={updateStatusMutation.isPending}
                                                className="rounded-xl bg-teal-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-teal-700 disabled:opacity-50"
                                            >
                                                Start Repair
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setRejectingRequest(req);
                                                    setRejectionReason("");
                                                }}
                                                className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100"
                                            >
                                                Reject
                                            </button>
                                        </>
                                    )}

                                    {req.status === "IN_PROGRESS" && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setCompletingRequest(req);
                                                setResolutionNote("");
                                            }}
                                            className="rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
                                        >
                                            Mark Completed
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-slate-200 pt-4">
                    <button
                        type="button"
                        disabled={page === 1}
                        onClick={() => setPage((p) => p - 1)}
                        className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                    >
                        Previous
                    </button>
                    <span className="text-xs font-medium text-slate-500">
                        Page {page} of {totalPages}
                    </span>
                    <button
                        type="button"
                        disabled={page === totalPages}
                        onClick={() => setPage((p) => p + 1)}
                        className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            )}

            {/* REJECT MODAL */}
            {rejectingRequest && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
                        <h3 className="text-lg font-bold text-slate-900">Reject Maintenance Request</h3>
                        <p className="mt-1 text-xs text-slate-500">
                            Please provide a mandatory reason for rejecting this request.
                        </p>

                        {actionError && (
                            <div className="mt-3 rounded-xl bg-rose-50 p-2.5 text-xs text-rose-700 font-medium">
                                {actionError}
                            </div>
                        )}

                        <div className="mt-4">
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                                Rejection Reason <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                rows={3}
                                placeholder="Explain why this request cannot be accepted..."
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                className="w-full rounded-xl border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-[#00696b] focus:ring-[#00696b]"
                            />
                        </div>

                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setRejectingRequest(null)}
                                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    if (!rejectionReason.trim()) {
                                        setActionError("A rejection reason is required.");
                                        return;
                                    }
                                    handleAction(rejectingRequest, "REJECTED", { rejectionReason: rejectionReason.trim() });
                                }}
                                disabled={updateStatusMutation.isPending}
                                className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-700 disabled:opacity-50"
                            >
                                Confirm Rejection
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* SCHEDULE MODAL */}
            {schedulingRequest && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
                        <h3 className="text-lg font-bold text-slate-900">
                            {schedulingRequest.status === "SCHEDULED" ? "Reschedule Repair Visit" : "Schedule Repair Visit"}
                        </h3>
                        <p className="mt-1 text-xs text-slate-500">
                            Set the date and time when the technician or owner will visit the property.
                        </p>

                        {actionError && (
                            <div className="mt-3 rounded-xl bg-rose-50 p-2.5 text-xs text-rose-700 font-medium">
                                {actionError}
                            </div>
                        )}

                        <div className="mt-4">
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                                Scheduled Date & Time <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="datetime-local"
                                value={scheduledDate}
                                onChange={(e) => setScheduledDate(e.target.value)}
                                className="w-full rounded-xl border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-[#00696b] focus:ring-[#00696b]"
                            />
                        </div>

                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setSchedulingRequest(null)}
                                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    if (!scheduledDate) {
                                        setActionError("Please select a valid scheduled date & time.");
                                        return;
                                    }
                                    handleAction(schedulingRequest, "SCHEDULED", {
                                        scheduledDate: new Date(scheduledDate).toISOString(),
                                    });
                                }}
                                disabled={updateStatusMutation.isPending}
                                className="rounded-xl bg-purple-600 px-4 py-2 text-xs font-semibold text-white hover:bg-purple-700 disabled:opacity-50"
                            >
                                Confirm Visit Schedule
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* COMPLETE MODAL */}
            {completingRequest && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
                        <h3 className="text-lg font-bold text-slate-900">Mark Repair Completed</h3>
                        <p className="mt-1 text-xs text-slate-500">
                            Confirm that the maintenance repair work is finished.
                        </p>

                        <div className="mt-4">
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                                Resolution Notes (Optional)
                            </label>
                            <textarea
                                rows={3}
                                placeholder="Describe what was repaired or replaced..."
                                value={resolutionNote}
                                onChange={(e) => setResolutionNote(e.target.value)}
                                className="w-full rounded-xl border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-[#00696b] focus:ring-[#00696b]"
                            />
                        </div>

                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setCompletingRequest(null)}
                                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    handleAction(completingRequest, "COMPLETED", {
                                        resolutionNote: resolutionNote.trim(),
                                    });
                                }}
                                disabled={updateStatusMutation.isPending}
                                className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                            >
                                Confirm Completion
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* DETAIL & HISTORY MODAL */}
            {selectedRequest && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm overflow-y-auto">
                    <div className="w-full max-w-3xl rounded-3xl bg-white p-6 shadow-2xl my-8">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                            <div>
                                <div className="flex items-center gap-2">
                                    <StatusBadge status={selectedRequest.status} />
                                    <PriorityBadge priority={selectedRequest.priority} />
                                    <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                                        {selectedRequest.category}
                                    </span>
                                </div>
                                <h2 className="mt-2 text-xl font-bold text-slate-900">{selectedRequest.title}</h2>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSelectedRequest(null)}
                                className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="mt-4 space-y-6 max-h-[70vh] overflow-y-auto pr-2">
                            {/* Details Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-2xl bg-slate-50 p-4 border border-slate-200/80 text-xs">
                                <div>
                                    <span className="text-slate-400 font-medium block">Property</span>
                                    <span className="font-bold text-slate-800">{selectedRequest.property?.title}</span>
                                </div>
                                <div>
                                    <span className="text-slate-400 font-medium block">Tenant Name</span>
                                    <span className="font-bold text-slate-800">{selectedRequest.tenant?.name} ({selectedRequest.tenant?.email})</span>
                                </div>
                                <div>
                                    <span className="text-slate-400 font-medium block">Tenant Preferred Visit</span>
                                    <span className="font-semibold text-slate-700">
                                        {selectedRequest.preferredVisitDate
                                            ? new Date(selectedRequest.preferredVisitDate).toLocaleString()
                                            : "Not specified"}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-slate-400 font-medium block">Confirmed Repair Visit</span>
                                    <span className="font-semibold text-purple-700">
                                        {selectedRequest.scheduledDate
                                            ? new Date(selectedRequest.scheduledDate).toLocaleString()
                                            : "Not scheduled yet"}
                                    </span>
                                </div>
                            </div>

                            {selectedRequest.rejectionReason && (
                                <div className="rounded-2xl bg-rose-50 border border-rose-200 p-4 text-xs text-rose-900">
                                    <span className="font-bold block">Rejection Reason:</span>
                                    <p className="mt-1">{selectedRequest.rejectionReason}</p>
                                </div>
                            )}

                            {selectedRequest.resolutionNote && (
                                <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-xs text-emerald-900">
                                    <span className="font-bold block">Resolution Note:</span>
                                    <p className="mt-1">{selectedRequest.resolutionNote}</p>
                                </div>
                            )}

                            <div>
                                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Problem Description</h3>
                                <p className="text-sm text-slate-700 whitespace-pre-line bg-white p-3.5 rounded-xl border border-slate-200/80">
                                    {selectedRequest.description}
                                </p>
                            </div>

                            <div>
                                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Issue Photos</h3>
                                <PhotoGallery images={selectedRequest.images} />
                            </div>

                            <div>
                                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Status History & Timeline</h3>
                                <StatusTimeline history={selectedRequest.statusHistory} />
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end border-t border-slate-100 pt-4">
                            <button
                                type="button"
                                onClick={() => setSelectedRequest(null)}
                                className="rounded-xl bg-slate-900 px-5 py-2 text-xs font-semibold text-white hover:bg-slate-800"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OwnerMaintenanceView;
