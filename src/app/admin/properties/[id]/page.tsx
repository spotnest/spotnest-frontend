"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import DashboardShell from "@/src/modules/dashboard/components/DashboardShell";
import {
    getAdminPropertyById,
    updatePropertyStatus,
    adminDeleteProperty,
} from "@/src/modules/properties/services/propertyService";
import type { AdminProperty, PropertyStatus } from "@/src/modules/properties/types";
import { formatPrice, propertyTypeLabels } from "@/src/modules/properties/utils/format";

function formatDate(value: string) {
    return new Intl.DateTimeFormat("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(new Date(value));
}

function Detail({
    label,
    value,
}: {
    label: string;
    value: string | number | undefined;
}) {
    return (
        <div className="rounded-xl border border-[#eef0f1] bg-[#fafafa] p-3.5">
            <dt className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#75777e]">
                {label}
            </dt>
            <dd className="mt-1 text-sm font-semibold text-[#191c1d]">
                {value ?? "Not provided"}
            </dd>
        </div>
    );
}

export default function AdminPropertyDetailsPage() {
    const params = useParams<{ id: string }>();
    const router = useRouter();
    const queryClient = useQueryClient();

    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [feedback, setFeedback] = useState("");
    const [error, setError] = useState("");

    const propertyQuery = useQuery({
        queryKey: ["admin-property", params.id],
        queryFn: () => getAdminPropertyById(params.id),
        enabled: Boolean(params.id),
    });

    const statusMutation = useMutation({
        mutationFn: (newStatus: PropertyStatus) =>
            updatePropertyStatus(params.id, newStatus),
        onSuccess: (_data, newStatus) => {
            setFeedback(`Listing status updated to ${newStatus}.`);
            setError("");
            queryClient.invalidateQueries({ queryKey: ["admin-property", params.id] });
            queryClient.invalidateQueries({ queryKey: ["admin-properties"] });
            queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] });
        },
        onError: (err: unknown) => {
            setError(
                (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
                    "Failed to update listing status."
            );
        },
    });

    const deleteMutation = useMutation({
        mutationFn: () => adminDeleteProperty(params.id),
        onSuccess: () => {
            setShowDeleteModal(false);
            queryClient.invalidateQueries({ queryKey: ["admin-properties"] });
            queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] });
            router.push("/admin/properties");
        },
        onError: (err: unknown) => {
            setError(
                (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
                    "Failed to delete listing."
            );
            setIsDeleting(false);
        },
    });

    const property = propertyQuery.data;

    return (
        <DashboardShell role="admin">
            <main className="mx-auto max-w-[1300px] px-4 py-7 sm:px-6 sm:py-9 lg:px-10 lg:py-10">
                <div className="flex items-center justify-between">
                    <Link
                        href="/admin/properties"
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#00696b] transition hover:text-[#004f51]"
                    >
                        ← Back to properties
                    </Link>

                    {property && (
                        <Link
                            href={`/properties/${property._id}`}
                            target="_blank"
                            className="text-xs font-bold text-[#44474d] underline hover:text-[#191c1d]"
                        >
                            View Public Listing ↗
                        </Link>
                    )}
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

                {propertyQuery.isLoading ? (
                    <div className="py-20 text-center text-sm text-[#75777e]">
                        Loading property inspection data...
                    </div>
                ) : propertyQuery.isError || !property ? (
                    <div className="py-20 text-center text-sm text-[#95611d]">
                        Unable to load property details.
                    </div>
                ) : (
                    <>
                        {/* Admin Action Header */}
                        <header className="mt-6 flex flex-col justify-between gap-4 rounded-2xl border border-[#e1e3e4] bg-white p-6 shadow-sm sm:flex-row sm:items-center">
                            <div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="rounded-full bg-[#d9f4f3] px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-[#00696b]">
                                        Admin Inspection Panel
                                    </span>
                                    <span className="text-xs font-mono text-[#75777e]">
                                        ID: {property._id}
                                    </span>
                                </div>
                                <h1 className="mt-2 text-2xl font-bold tracking-tight text-[#191c1d] sm:text-3xl">
                                    {property.title}
                                </h1>
                                <p className="mt-1 text-sm text-[#44474d]">
                                    {propertyTypeLabels[property.propertyType] ?? property.propertyType}
                                    {" · "}
                                    {property.address.street}, {property.address.city}, {property.address.state}
                                </p>
                            </div>

                            <div className="flex flex-wrap items-center gap-3">
                                <div className="flex items-center gap-2">
                                    <label className="text-xs font-bold uppercase text-[#75777e]">
                                        Status:
                                    </label>
                                    <select
                                        disabled={statusMutation.isPending}
                                        value={property.status}
                                        onChange={(e) =>
                                            statusMutation.mutate(e.target.value as PropertyStatus)
                                        }
                                        className="h-10 rounded-xl border border-[#c5c6cd] bg-white px-3 text-xs font-bold text-[#191c1d] outline-none focus:border-[#00696b] disabled:opacity-50"
                                    >
                                        <option value="active">Active (Live)</option>
                                        <option value="inactive">Inactive</option>
                                        <option value="archived">Archived</option>
                                    </select>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setShowDeleteModal(true)}
                                    className="h-10 rounded-xl bg-[#fff0ee] px-4 text-xs font-bold text-[#b42318] transition hover:bg-[#fdd8d4]"
                                >
                                    Delete Listing
                                </button>
                            </div>
                        </header>

                        {/* Main Grid */}
                        <div className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
                            {/* Property Gallery & Specifications */}
                            <section className="space-y-6">
                                {property.images.length > 0 && (
                                    <div className="grid grid-cols-2 gap-3 overflow-hidden rounded-2xl">
                                        {property.images.map((image, idx) => (
                                            <div
                                                key={image.publicId || image.url || idx}
                                                className="relative aspect-[1.4/1] overflow-hidden rounded-xl bg-[#e7e8e9]"
                                            >
                                                <Image
                                                    src={image.url}
                                                    alt={property.title}
                                                    fill
                                                    sizes="(max-width: 1024px) 50vw, 60vw"
                                                    className="object-cover"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="rounded-2xl border border-[#e1e3e4] bg-white p-6 shadow-sm">
                                    <h2 className="text-lg font-bold text-[#191c1d]">
                                        Property Information
                                    </h2>

                                    <dl className="mt-5 grid gap-3 sm:grid-cols-2">
                                        <Detail
                                            label="Property Type"
                                            value={
                                                propertyTypeLabels[property.propertyType] ??
                                                property.propertyType
                                            }
                                        />
                                        <Detail label="Bedrooms" value={property.bedrooms} />
                                        <Detail label="Bathrooms" value={property.bathrooms} />
                                        <Detail
                                            label="Area"
                                            value={
                                                property.areaSqFt
                                                    ? `${property.areaSqFt.toLocaleString("en-IN")} sq ft`
                                                    : undefined
                                            }
                                        />
                                        <Detail label="Street" value={property.address.street} />
                                        <Detail label="City" value={property.address.city} />
                                        <Detail label="State" value={property.address.state} />
                                        <Detail label="Postal Code" value={property.address.zipCode} />
                                    </dl>

                                    <div className="mt-6 border-t border-[#eef0f1] pt-5">
                                        <p className="text-xs font-bold uppercase tracking-[0.1em] text-[#75777e]">
                                            Amenities & Features
                                        </p>
                                        <div className="mt-3 flex flex-wrap gap-2">
                                            {property.amenities?.length ? (
                                                property.amenities.map((amenity) => (
                                                    <span
                                                        key={amenity}
                                                        className="rounded-full bg-[#f3f4f5] px-3 py-1 text-xs font-semibold text-[#44474d]"
                                                    >
                                                        {amenity}
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="text-xs text-[#75777e]">
                                                    No amenities specified.
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {property.description && (
                                        <div className="mt-6 border-t border-[#eef0f1] pt-5">
                                            <p className="text-xs font-bold uppercase tracking-[0.1em] text-[#75777e]">
                                                Listing Description
                                            </p>
                                            <p className="mt-2 text-sm leading-7 text-[#44474d] whitespace-pre-wrap">
                                                {property.description}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </section>

                            {/* Sidebar: Owner & Oversight Meta */}
                            <aside className="space-y-6">
                                {/* Owner Overview */}
                                <section className="rounded-2xl border border-[#e1e3e4] bg-white p-6 shadow-sm">
                                    <h2 className="text-lg font-bold text-[#191c1d]">
                                        Owner Information
                                    </h2>

                                    <dl className="mt-5 space-y-3.5">
                                        <Detail
                                            label="Full Name"
                                            value={property.owner?.name ?? "Unknown Owner"}
                                        />
                                        <Detail
                                            label="Email Address"
                                            value={property.owner?.email ?? "Not provided"}
                                        />
                                        <Detail
                                            label="Phone Number"
                                            value={property.owner?.phone ?? "Not provided"}
                                        />
                                        <Detail
                                            label="Owner Verification"
                                            value={
                                                property.owner?.verificationStatus === "approved"
                                                    ? "Verified Owner"
                                                    : property.owner?.verificationStatus === "rejected"
                                                    ? "Rejected"
                                                    : "Pending Verification"
                                            }
                                        />
                                    </dl>

                                    <div className="mt-5 flex gap-2">
                                        {property.owner?.email && (
                                            <a
                                                href={`mailto:${property.owner.email}`}
                                                className="flex-1 rounded-xl border border-[#c5c6cd] py-2 text-center text-xs font-bold text-[#191c1d] transition hover:bg-[#f1f5f9]"
                                            >
                                                Email Owner
                                            </a>
                                        )}
                                        {property.owner?.phone && (
                                            <a
                                                href={`tel:${property.owner.phone}`}
                                                className="flex-1 rounded-xl border border-[#c5c6cd] py-2 text-center text-xs font-bold text-[#191c1d] transition hover:bg-[#f1f5f9]"
                                            >
                                                Call Owner
                                            </a>
                                        )}
                                    </div>
                                </section>

                                {/* Financials & Status */}
                                <section className="rounded-2xl border border-[#e1e3e4] bg-white p-6 shadow-sm">
                                    <h2 className="text-lg font-bold text-[#191c1d]">
                                        Rental Availability & Pricing
                                    </h2>

                                    <div className="mt-5 space-y-4">
                                        <div className="flex items-center justify-between border-b border-[#eef0f1] pb-3">
                                            <span className="text-xs font-bold uppercase text-[#75777e]">
                                                Monthly Rent
                                            </span>
                                            <span className="text-lg font-bold text-[#00696b]">
                                                {property.price != null
                                                    ? formatPrice(property.price)
                                                    : "N/A"}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between border-b border-[#eef0f1] pb-3">
                                            <span className="text-xs font-bold uppercase text-[#75777e]">
                                                Rental Status
                                            </span>
                                            <span className="rounded-full bg-[#d9f4f3] px-2.5 py-0.5 text-xs font-bold capitalize text-[#00696b]">
                                                {property.rentalStatus}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between border-b border-[#eef0f1] pb-3">
                                            <span className="text-xs font-bold uppercase text-[#75777e]">
                                                Created At
                                            </span>
                                            <span className="text-xs text-[#75777e]">
                                                {formatDate(property.created_at)}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-bold uppercase text-[#75777e]">
                                                Last Updated
                                            </span>
                                            <span className="text-xs text-[#75777e]">
                                                {formatDate(property.updated_at)}
                                            </span>
                                        </div>
                                    </div>
                                </section>
                            </aside>
                        </div>

                        {/* Delete Confirmation Modal */}
                        {showDeleteModal && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                                <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
                                    <h3 className="text-xl font-bold text-[#b42318]">
                                        Delete Property Listing
                                    </h3>
                                    <p className="mt-2 text-sm text-[#44474d]">
                                        Are you sure you want to permanently delete{" "}
                                        <strong className="text-[#191c1d]">
                                            {property.title}
                                        </strong>
                                        ?
                                    </p>
                                    <p className="mt-2 text-xs text-[#75777e]">
                                        This action is irreversible and removes the listing and its
                                        Cloudinary image assets permanently.
                                    </p>
                                    <div className="mt-6 flex justify-end gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setShowDeleteModal(false)}
                                            className="rounded-xl border border-[#c5c6cd] px-4 py-2 text-sm font-bold text-[#44474d] hover:bg-[#f1f5f9]"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="button"
                                            disabled={deleteMutation.isPending}
                                            onClick={() => deleteMutation.mutate()}
                                            className="rounded-xl bg-[#b42318] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#911d13] disabled:opacity-50"
                                        >
                                            {deleteMutation.isPending ? "Deleting..." : "Permanently Delete"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </main>
        </DashboardShell>
    );
}