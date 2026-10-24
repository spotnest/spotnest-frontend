"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/src/store/hook";
import BookingPaymentCard from "@/src/modules/bookings/components/BookingPaymentCard";
import VisitRequestButton from "@/src/modules/visits/components/VisitRequestButton";
import { StartChatButton } from "@/src/modules/chat";
import {
    updatePropertyStatus,
    adminDeleteProperty,
} from "@/src/modules/properties/services/propertyService";
import type { PropertyStatus } from "@/src/modules/properties/types";

interface Props {
    propertyId: string;
    propertyTitle: string;
    propertyPrice: number;
    advanceAmount?: number;
    isOccupied?: boolean;
    occupiedUntil?: string | null;
    ownerId: string;
    ownerName?: string;
    ownerEmail?: string;
    ownerPhone?: string;
    propertyStatus?: PropertyStatus;
}

export default function PropertySidebarActions({
    propertyId,
    propertyTitle,
    propertyPrice,
    advanceAmount,
    isOccupied,
    occupiedUntil,
    ownerId,
    ownerName,
    ownerEmail,
    ownerPhone,
    propertyStatus = "active",
}: Props) {
    const router = useRouter();
    const { user, isInitialized } = useAppSelector((state) => state.auth);

    const [status, setStatus] = useState<PropertyStatus>(propertyStatus);
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [feedback, setFeedback] = useState("");
    const [error, setError] = useState("");

    const isAdmin = isInitialized && user?.role === "admin";
    const isOwnerOfListing = isInitialized && user?.role === "owner" && user?.id === ownerId;

    const handleStatusChange = async (newStatus: PropertyStatus) => {
        setIsUpdatingStatus(true);
        setFeedback("");
        setError("");
        try {
            await updatePropertyStatus(propertyId, newStatus);
            setStatus(newStatus);
            setFeedback(`Listing status updated to ${newStatus}.`);
        } catch (err: unknown) {
            setError(
                (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
                    "Failed to update listing status."
            );
        } finally {
            setIsUpdatingStatus(false);
        }
    };

    const handleDelete = async () => {
        setIsDeleting(true);
        setError("");
        try {
            await adminDeleteProperty(propertyId);
            setShowDeleteModal(false);
            router.push("/admin/properties");
        } catch (err: unknown) {
            setError(
                (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
                    "Failed to delete listing."
            );
            setIsDeleting(false);
        }
    };

    // ----------------------------------------------------
    // 1. ADMIN VIEW: Full Control & Verification Oversight
    // ----------------------------------------------------
    if (isAdmin) {
        return (
            <aside className="h-fit rounded-2xl border-2 border-[#00696b] bg-white p-6 shadow-md">
                <div className="flex items-center justify-between gap-2 border-b border-[#e1e3e4] pb-4">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#d9f4f3] px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#00696b]">
                        <span className="h-2 w-2 rounded-full bg-[#00696b]" />
                        Admin Oversight
                    </span>
                    <span className="text-xs font-semibold uppercase text-[#75777e]">
                        {status}
                    </span>
                </div>

                <div className="mt-4">
                    <h2 className="text-lg font-bold text-[#191c1d]">Property Moderation</h2>
                    <p className="mt-1 text-xs leading-5 text-[#44474d]">
                        Admins monitor, verify, and moderate platform properties. Rental booking and buying are strictly disabled for administrators.
                    </p>
                </div>

                {feedback && (
                    <div className="mt-4 rounded-xl bg-[#d9f4f3] p-3 text-xs font-bold text-[#00696b]">
                        {feedback}
                    </div>
                )}
                {error && (
                    <div className="mt-4 rounded-xl bg-[#fff0ee] p-3 text-xs font-bold text-[#b42318]">
                        {error}
                    </div>
                )}

                {/* Status Switcher */}
                <div className="mt-5 rounded-xl border border-[#e1e3e4] bg-[#fafafa] p-4">
                    <label className="block text-xs font-bold uppercase text-[#75777e]">
                        Change Listing Status
                    </label>
                    <select
                        disabled={isUpdatingStatus}
                        value={status}
                        onChange={(e) => handleStatusChange(e.target.value as PropertyStatus)}
                        className="mt-2 h-10 w-full rounded-xl border border-[#c5c6cd] bg-white px-3 text-sm font-semibold text-[#191c1d] outline-none focus:border-[#00696b] disabled:opacity-50"
                    >
                        <option value="active">Active (Visible to renters)</option>
                        <option value="inactive">Inactive (Hidden from search)</option>
                        <option value="archived">Archived (Delisted)</option>
                    </select>

                    <div className="mt-3 flex items-center justify-between text-xs text-[#75777e]">
                        <span>Rental Status:</span>
                        <span className="font-bold uppercase text-[#00696b]">
                            {isOccupied ? "Occupied" : "Available"}
                        </span>
                    </div>
                    {isOccupied && occupiedUntil && (
                        <p className="mt-1 text-[11px] text-[#95611d]">
                            Leased until: {new Date(occupiedUntil).toLocaleDateString("en-IN")}
                        </p>
                    )}
                </div>

                {/* Owner Information */}
                <div className="mt-4 rounded-xl border border-[#e1e3e4] bg-[#fafafa] p-4 text-xs">
                    <p className="font-bold uppercase tracking-wider text-[#75777e]">Property Owner</p>
                    <p className="mt-1 text-sm font-bold text-[#191c1d]">{ownerName || "Owner Account"}</p>
                    {ownerEmail && <p className="mt-0.5 text-[#44474d]">{ownerEmail}</p>}
                    {ownerPhone && <p className="mt-0.5 text-[#44474d]">Phone: {ownerPhone}</p>}

                    <div className="mt-3 flex gap-2">
                        {ownerEmail && (
                            <a
                                href={`mailto:${ownerEmail}`}
                                className="flex-1 rounded-lg border border-[#c5c6cd] bg-white py-1.5 text-center text-xs font-bold text-[#191c1d] hover:bg-[#f1f5f9]"
                            >
                                Email Owner
                            </a>
                        )}
                        {ownerPhone && (
                            <a
                                href={`tel:${ownerPhone}`}
                                className="flex-1 rounded-lg border border-[#c5c6cd] bg-white py-1.5 text-center text-xs font-bold text-[#191c1d] hover:bg-[#f1f5f9]"
                            >
                                Call
                            </a>
                        )}
                    </div>
                </div>

                {/* Admin Actions */}
                <div className="mt-5 space-y-2.5">
                    <Link
                        href={`/admin/properties/${propertyId}`}
                        className="flex w-full items-center justify-center rounded-xl bg-[#00696b] py-3 text-center text-sm font-bold text-white transition hover:bg-[#005153]"
                    >
                        Open Full Admin Inspection Panel
                    </Link>

                    <StartChatButton propertyId={propertyId} ownerId={ownerId} />

                    <button
                        type="button"
                        onClick={() => setShowDeleteModal(true)}
                        className="w-full rounded-xl bg-[#fff0ee] py-2.5 text-xs font-bold text-[#b42318] transition hover:bg-[#fdd8d4]"
                    >
                        Delete Property Listing
                    </button>
                </div>

                {/* Delete Modal */}
                {showDeleteModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                        <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
                            <h3 className="text-xl font-bold text-[#b42318]">Delete Property Listing</h3>
                            <p className="mt-2 text-sm text-[#44474d]">
                                Are you sure you want to permanently delete{" "}
                                <strong className="text-[#191c1d]">{propertyTitle}</strong>?
                            </p>
                            <p className="mt-2 text-xs text-[#75777e]">
                                This will remove the listing and its associated image assets from Cloudinary.
                            </p>
                            <div className="mt-5 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowDeleteModal(false)}
                                    className="rounded-xl border border-[#c5c6cd] px-4 py-2 text-sm font-bold text-[#44474d] hover:bg-[#f1f5f9]"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    disabled={isDeleting}
                                    onClick={handleDelete}
                                    className="rounded-xl bg-[#b42318] px-4 py-2 text-sm font-bold text-white hover:bg-[#911d13] disabled:opacity-50"
                                >
                                    {isDeleting ? "Deleting..." : "Permanently Delete"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </aside>
        );
    }

    // ----------------------------------------------------
    // 2. OWNER VIEW: Property Owner Management
    // ----------------------------------------------------
    if (isOwnerOfListing) {
        return (
            <aside className="h-fit rounded-2xl border border-[#e1e3e4] bg-white p-6 shadow-sm">
                <span className="inline-flex rounded-full bg-[#ede9fe] px-3 py-1 text-xs font-bold text-[#5b21b6]">
                    Your Property Listing
                </span>
                <h2 className="mt-3 text-lg font-bold text-[#191c1d]">Manage This Property</h2>
                <p className="mt-1 text-xs text-[#75777e]">
                    You are the owner of this property. Use your owner dashboard to manage requests, view visits, or edit listing details.
                </p>
                <div className="mt-5 space-y-2">
                    <Link
                        href={`/owner/properties/${propertyId}`}
                        className="block w-full rounded-xl bg-[#00696b] py-2.5 text-center text-sm font-bold text-white hover:bg-[#005153]"
                    >
                        Manage Property
                    </Link>
                    <Link
                        href="/owner/requests"
                        className="block w-full rounded-xl border border-[#c5c6cd] py-2.5 text-center text-sm font-bold text-[#191c1d] hover:bg-[#f1f5f9]"
                    >
                        View Rental Requests
                    </Link>
                </div>
            </aside>
        );
    }

    // ----------------------------------------------------
    // 3. RENTER / VISITOR VIEW: Normal Rental & Booking
    // ----------------------------------------------------
    return (
        <aside className="h-fit rounded-2xl border border-[#e1e3e4] bg-white p-6 shadow-xs">
            <h2 className="text-lg font-bold tracking-tight text-[#191c1d]">
                Interested in this property?
            </h2>
            <p className="mt-2 text-sm leading-6 text-[#75777e]">
                Request a visit or contact the property owner to learn more.
            </p>

            <BookingPaymentCard
                propertyId={propertyId}
                propertyTitle={propertyTitle}
                propertyPrice={propertyPrice}
                advanceAmount={advanceAmount ?? propertyPrice}
                isOccupied={isOccupied}
                occupiedUntil={occupiedUntil}
            />

            <VisitRequestButton propertyId={propertyId} />
            <StartChatButton propertyId={propertyId} ownerId={ownerId} />

            {ownerEmail && (
                <a
                    href={`mailto:${ownerEmail}?subject=Inquiry about ${encodeURIComponent(propertyTitle)}`}
                    className="mt-3 block w-full rounded-lg border border-[#191c1d] px-4 py-3 text-center text-sm font-semibold text-[#191c1d] transition hover:bg-[#191c1d] hover:text-white"
                >
                    Contact Owner
                </a>
            )}
        </aside>
    );
}

