"use client";

import React, { useState } from "react";
import {
    useCreateMaintenanceRequest,
    useEligibleProperties,
    useTenantMaintenanceRequests,
    useUpdateMaintenanceStatus,
} from "../hooks/useMaintenance";
import type {
    MaintenanceCategory,
    MaintenancePriority,
    MaintenanceRequest,
    MaintenanceStatus,
} from "../types/maintenance";
import StatusBadge from "./StatusBadge";
import PriorityBadge from "./PriorityBadge";
import StatusTimeline from "./StatusTimeline";
import PhotoGallery from "./PhotoGallery";

export const TenantMaintenanceView: React.FC = () => {
    // Filters & Pagination
    const [statusFilter, setStatusFilter] = useState<string>("ALL");
    const [priorityFilter, setPriorityFilter] = useState<string>("ALL");
    const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
    const [search, setSearch] = useState<string>("");
    const [page, setPage] = useState<number>(1);

    // Modal States
    const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);
    const [selectedRequest, setSelectedRequest] = useState<MaintenanceRequest | null>(null);
    const [cancelModalRequest, setCancelModalRequest] = useState<MaintenanceRequest | null>(null);

    // Queries & Mutations
    const { data: eligibleProps, isLoading: isLoadingProps } = useEligibleProperties();
    const { data: reqData, isLoading: isLoadingReqs, isError, error, refetch } = useTenantMaintenanceRequests({
        status: statusFilter,
        priority: priorityFilter,
        category: categoryFilter,
        search,
        page,
        limit: 10,
    });
    const createMutation = useCreateMaintenanceRequest();
    const updateStatusMutation = useUpdateMaintenanceStatus();

    // Form state
    const [formPropertyId, setFormPropertyId] = useState<string>("");
    const [formTitle, setFormTitle] = useState<string>("");
    const [formDescription, setFormDescription] = useState<string>("");
    const [formCategory, setFormCategory] = useState<MaintenanceCategory>("Plumbing");
    const [formPriority, setFormPriority] = useState<MaintenancePriority>("Normal");
    const [formVisitDate, setFormVisitDate] = useState<string>("");
    const [formNotes, setFormNotes] = useState<string>("");
    const [formFiles, setFormFiles] = useState<File[]>([]);
    const [formError, setFormError] = useState<string>("");

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;
        const filesArray = Array.from(e.target.files);
        if (formFiles.length + filesArray.length > 5) {
            setFormError("You can upload a maximum of 5 photos.");
            return;
        }
        for (const f of filesArray) {
            if (!["image/jpeg", "image/png", "image/webp"].includes(f.type)) {
                setFormError("Only JPEG, PNG, and WebP images are allowed.");
                return;
            }
            if (f.size > 5 * 1024 * 1024) {
                setFormError("Each photo must be 5MB or less.");
                return;
            }
        }
        setFormError("");
        setFormFiles((prev) => [...prev, ...filesArray]);
    };

    const removeFile = (index: number) => {
        setFormFiles((prev) => prev.filter((_, i) => i !== index));
    };

    const handleCreateSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError("");

        if (!formTitle.trim() || formTitle.trim().length < 3) {
            setFormError("Please enter a valid title (at least 3 characters).");
            return;
        }
        if (!formDescription.trim() || formDescription.trim().length < 5) {
            setFormError("Please provide a detailed description (at least 5 characters).");
            return;
        }

        const formData = new FormData();
        if (formPropertyId) {
            formData.append("propertyId", formPropertyId);
        }
        formData.append("title", formTitle.trim());
        formData.append("description", formDescription.trim());
        formData.append("category", formCategory);
        formData.append("priority", formPriority);
        if (formVisitDate) {
            formData.append("preferredVisitDate", new Date(formVisitDate).toISOString());
        }
        if (formNotes.trim()) {
            formData.append("tenantNotes", formNotes.trim());
        }
        formFiles.forEach((file) => {
            formData.append("photos", file);
        });

        try {
            await createMutation.mutateAsync(formData);
            setIsCreateOpen(false);
            // Reset form
            setFormTitle("");
            setFormDescription("");
            setFormCategory("Plumbing");
            setFormPriority("Normal");
            setFormVisitDate("");
            setFormNotes("");
            setFormFiles([]);
            setFormError("");
        } catch (err: any) {
            setFormError(err?.response?.data?.message || "Failed to submit maintenance request.");
        }
    };

    const handleCancelRequest = async () => {
        if (!cancelModalRequest) return;
        try {
            await updateStatusMutation.mutateAsync({
                id: cancelModalRequest.id,
                payload: {
                    status: "CANCELLED",
                    note: "Cancelled by tenant",
                },
            });
            setCancelModalRequest(null);
            if (selectedRequest?.id === cancelModalRequest.id) {
                setSelectedRequest(null);
            }
        } catch (err: any) {
            alert(err?.response?.data?.message || "Failed to cancel request.");
        }
    };

    const requests = reqData?.requests || [];
    const totalPages = reqData?.pagination?.pages || 1;

    return (
        <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 pb-5">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                        Maintenance & Repairs
                    </h1>
                    <p className="mt-1 text-sm text-slate-500">
                        Submit and track repair requests for your active rental properties.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => {
                        if (eligibleProps && eligibleProps.length > 0 && !formPropertyId) {
                            setFormPropertyId(eligibleProps[0]!.property.id);
                        }
                        setIsCreateOpen(true);
                    }}
                    disabled={!eligibleProps || eligibleProps.length === 0}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#00696b] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#005456] transition-colors focus:outline-none focus:ring-2 focus:ring-[#00696b] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    New Maintenance Request
                </button>
            </div>

            {/* No Active Rental Notice */}
            {!isLoadingProps && (!eligibleProps || eligibleProps.length === 0) && (
                <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-4 sm:p-6 text-amber-900">
                    <div className="flex items-start gap-3">
                        <svg className="h-6 w-6 text-amber-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <div>
                            <h3 className="font-semibold text-base">No Active Rental Found</h3>
                            <p className="mt-1 text-sm text-amber-700">
                                You must have an active rental agreement to create maintenance requests. Please ensure your rental agreement has been confirmed.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Filters Bar */}
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
                        <option value="ALL">All Statuses</option>
                        <option value="PENDING">Pending</option>
                        <option value="ACCEPTED">Accepted</option>
                        <option value="SCHEDULED">Scheduled</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="COMPLETED">Completed</option>
                        <option value="REJECTED">Rejected</option>
                        <option value="CANCELLED">Cancelled</option>
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
                        <option value="ALL">All Priorities</option>
                        <option value="Low">Low</option>
                        <option value="Normal">Normal</option>
                        <option value="High">High</option>
                        <option value="Emergency">Emergency</option>
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
                        <option value="ALL">All Categories</option>
                        <option value="Plumbing">Plumbing</option>
                        <option value="Electrical">Electrical</option>
                        <option value="Appliance">Appliance</option>
                        <option value="Structural">Structural</option>
                        <option value="Cleaning">Cleaning</option>
                        <option value="Other">Other</option>
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Search</label>
                    <input
                        type="text"
                        placeholder="Search title or description..."
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setPage(1);
                        }}
                        className="w-full rounded-xl border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 focus:border-[#00696b] focus:ring-[#00696b]"
                    />
                </div>
            </div>

            {/* Loading & Error States */}
            {isLoadingReqs && (
                <div className="py-12 text-center">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#00696b] border-r-transparent"></div>
                    <p className="mt-2 text-xs text-slate-500">Loading maintenance requests...</p>
                </div>
            )}

            {isError && (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-800 flex justify-between items-center">
                    <p className="text-sm">{error instanceof Error ? error.message : "Failed to load maintenance requests"}</p>
                    <button type="button" onClick={() => refetch()} className="text-xs font-bold underline">Retry</button>
                </div>
            )}

            {/* Request List */}
            {!isLoadingReqs && requests.length === 0 && (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
                    <svg className="mx-auto h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    <h3 className="mt-3 text-base font-bold text-slate-900">No maintenance requests</h3>
                    <p className="mt-1 text-xs text-slate-500">
                        No requests match your selected filters. Create a new request if you need assistance.
                    </p>
                </div>
            )}

            {!isLoadingReqs && requests.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {requests.map((req) => (
                        <div
                            key={req.id}
                            className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
                        >
                            <div>
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <StatusBadge status={req.status} />
                                        <PriorityBadge priority={req.priority} />
                                        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                                            {req.category}
                                        </span>
                                    </div>
                                    <span className="text-xs text-slate-400 font-medium">
                                        {new Date(req.createdAt).toLocaleDateString()}
                                    </span>
                                </div>

                                <h3 className="mt-3 text-base font-bold text-slate-900 line-clamp-1">
                                    {req.title}
                                </h3>

                                <p className="mt-1.5 text-xs text-slate-600 line-clamp-2">
                                    {req.description}
                                </p>

                                <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                                    <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                    <span className="font-semibold text-slate-700">{req.property?.title}</span>
                                </div>

                                {req.scheduledDate && (
                                    <div className="mt-2 flex items-center gap-2 text-xs text-purple-700 bg-purple-50 p-2 rounded-xl">
                                        <svg className="h-4 w-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <span>
                                            Scheduled: <strong>{new Date(req.scheduledDate).toLocaleString()}</strong>
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-3">
                                <button
                                    type="button"
                                    onClick={() => setSelectedRequest(req)}
                                    className="text-xs font-semibold text-[#00696b] hover:text-[#005456] hover:underline"
                                >
                                    View Details & History →
                                </button>
                                {["PENDING", "ACCEPTED", "SCHEDULED"].includes(req.status) && (
                                    <button
                                        type="button"
                                        onClick={() => setCancelModalRequest(req)}
                                        className="text-xs font-medium text-rose-600 hover:text-rose-800 hover:underline"
                                    >
                                        Cancel Request
                                    </button>
                                )}
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

            {/* CREATE REQUEST MODAL */}
            {isCreateOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm overflow-y-auto">
                    <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl my-8">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                            <h2 className="text-xl font-bold text-slate-900">Create Maintenance Request</h2>
                            <button
                                type="button"
                                onClick={() => setIsCreateOpen(false)}
                                className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                            >
                                ✕
                            </button>
                        </div>

                        {formPriority === "Emergency" && (
                            <div className="mt-4 rounded-2xl bg-red-50 p-4 border border-red-200 text-red-900 text-xs">
                                <div className="flex items-start gap-2.5">
                                    <svg className="h-5 w-5 text-red-600 shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                    <div>
                                        <p className="font-bold">IMMEDIATE SAFETY NOTICE</p>
                                        <p className="mt-1">
                                            If there is immediate danger to life or safety (e.g. gas leak, fire, flooding), please contact local emergency services (112 / 911 / Fire department) immediately before submitting this request.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {formError && (
                            <div className="mt-4 rounded-2xl bg-rose-50 p-3.5 border border-rose-200 text-rose-700 text-xs font-medium">
                                {formError}
                            </div>
                        )}

                        <form onSubmit={handleCreateSubmit} className="mt-4 space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">
                                    Select Property <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={formPropertyId}
                                    onChange={(e) => setFormPropertyId(e.target.value)}
                                    required
                                    className="w-full rounded-xl border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-[#00696b] focus:ring-[#00696b]"
                                >
                                    {eligibleProps?.map((item) => (
                                        <option key={item.property.id} value={item.property.id}>
                                            {item.property.title} ({item.owner.name})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                                        Category <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={formCategory}
                                        onChange={(e) => setFormCategory(e.target.value as MaintenanceCategory)}
                                        className="w-full rounded-xl border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-[#00696b] focus:ring-[#00696b]"
                                    >
                                        <option value="Plumbing">Plumbing</option>
                                        <option value="Electrical">Electrical</option>
                                        <option value="Appliance">Appliance</option>
                                        <option value="Structural">Structural</option>
                                        <option value="Cleaning">Cleaning</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                                        Priority <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={formPriority}
                                        onChange={(e) => setFormPriority(e.target.value as MaintenancePriority)}
                                        className="w-full rounded-xl border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-[#00696b] focus:ring-[#00696b]"
                                    >
                                        <option value="Low">Low</option>
                                        <option value="Normal">Normal</option>
                                        <option value="High">High</option>
                                        <option value="Emergency">Emergency</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">
                                    Issue Title <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. Leaking kitchen sink pipe"
                                    value={formTitle}
                                    onChange={(e) => setFormTitle(e.target.value)}
                                    required
                                    className="w-full rounded-xl border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-[#00696b] focus:ring-[#00696b]"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">
                                    Detailed Problem Description <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    rows={4}
                                    placeholder="Explain the problem clearly, including where it is located and when it started..."
                                    value={formDescription}
                                    onChange={(e) => setFormDescription(e.target.value)}
                                    required
                                    className="w-full rounded-xl border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-[#00696b] focus:ring-[#00696b]"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                                        Preferred Visit Date & Time (Optional)
                                    </label>
                                    <input
                                        type="datetime-local"
                                        value={formVisitDate}
                                        onChange={(e) => setFormVisitDate(e.target.value)}
                                        className="w-full rounded-xl border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-[#00696b] focus:ring-[#00696b]"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                                        Additional Notes (Optional)
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Gate code, pet at home"
                                        value={formNotes}
                                        onChange={(e) => setFormNotes(e.target.value)}
                                        className="w-full rounded-xl border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-[#00696b] focus:ring-[#00696b]"
                                    />
                                </div>
                            </div>

                            {/* Photo upload */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">
                                    Upload Photos (Optional, max 5)
                                </label>
                                <input
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    multiple
                                    onChange={handleFileChange}
                                    disabled={formFiles.length >= 5}
                                    className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#00696b]/10 file:text-[#00696b] hover:file:bg-[#00696b]/20"
                                />
                                {formFiles.length > 0 && (
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {formFiles.map((file, idx) => (
                                            <div key={idx} className="relative rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-700 flex items-center gap-1.5">
                                                <span className="truncate max-w-[120px]">{file.name}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => removeFile(idx)}
                                                    className="text-rose-500 hover:text-rose-700 font-bold ml-1"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsCreateOpen(false)}
                                    className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={createMutation.isPending}
                                    className="rounded-xl bg-[#00696b] px-5 py-2 text-xs font-semibold text-white hover:bg-[#005456] disabled:opacity-50"
                                >
                                    {createMutation.isPending ? "Submitting..." : "Submit Request"}
                                </button>
                            </div>
                        </form>
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
                                    <span className="text-slate-400 font-medium block">Property Owner</span>
                                    <span className="font-bold text-slate-800">{selectedRequest.owner?.name}</span>
                                </div>
                                <div>
                                    <span className="text-slate-400 font-medium block">Preferred Visit Date</span>
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

                            {/* Rejection / Resolution Notes if present */}
                            {selectedRequest.rejectionReason && (
                                <div className="rounded-2xl bg-rose-50 border border-rose-200 p-4 text-xs text-rose-900">
                                    <span className="font-bold block">Owner Rejection Reason:</span>
                                    <p className="mt-1">{selectedRequest.rejectionReason}</p>
                                </div>
                            )}

                            {selectedRequest.resolutionNote && (
                                <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-xs text-emerald-900">
                                    <span className="font-bold block">Owner Resolution Note:</span>
                                    <p className="mt-1">{selectedRequest.resolutionNote}</p>
                                </div>
                            )}

                            {/* Description */}
                            <div>
                                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Problem Description</h3>
                                <p className="text-sm text-slate-700 whitespace-pre-line bg-white p-3.5 rounded-xl border border-slate-200/80">
                                    {selectedRequest.description}
                                </p>
                            </div>

                            {/* Photos */}
                            <div>
                                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Attached Photos</h3>
                                <PhotoGallery images={selectedRequest.images} />
                            </div>

                            {/* Status Timeline */}
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

            {/* CANCEL CONFIRMATION MODAL */}
            {cancelModalRequest && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
                        <h3 className="text-lg font-bold text-slate-900">Cancel Maintenance Request?</h3>
                        <p className="mt-2 text-xs text-slate-600">
                            Are you sure you want to cancel request <strong>&quot;{cancelModalRequest.title}&quot;</strong>? This action will notify the owner.
                        </p>
                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setCancelModalRequest(null)}
                                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                            >
                                Keep Request
                            </button>
                            <button
                                type="button"
                                onClick={handleCancelRequest}
                                disabled={updateStatusMutation.isPending}
                                className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-700 disabled:opacity-50"
                            >
                                {updateStatusMutation.isPending ? "Cancelling..." : "Confirm Cancellation"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TenantMaintenanceView;
