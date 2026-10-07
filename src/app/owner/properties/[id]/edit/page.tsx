"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";

import DashboardShell from "@/src/modules/dashboard/components/DashboardShell";
import OwnerPropertyForm from "@/src/modules/properties/components/OwnerPropertyForm";
import {
    addPropertyImages,
    archiveProperty,
    getMyPropertyById,
    removePropertyImage,
    updateProperty,
    updatePropertyStatus,
} from "@/src/modules/properties/services/propertyService";
import type {
    OwnerPropertyFormValues,
    Property,
} from "@/src/modules/properties/types";
import { useSubscription } from "@/src/modules/subscriptions/hooks/useSubscription";
import { dashboardPathForRole } from "@/src/constants/routes";
import { useAppSelector } from "@/src/store/hook";

const statusTone: Record<Property["status"], string> = {
    active: "bg-[#d9f4f3] text-[#00696b]",
    inactive: "bg-[#fff0dc] text-[#95611d]",
    archived: "bg-[#eef0f1] text-[#44474d]",
};

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

export default function EditOwnerPropertyPage() {
    const params = useParams<{ id: string }>();
    const router = useRouter();

    const { user, isInitialized } = useAppSelector((state) => state.auth);

    const isOwner =
        user?.role === "owner" &&
        user.verificationStatus === "approved";

    const queryClient = useQueryClient();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [notice, setNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);
    const [confirmArchive, setConfirmArchive] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [viewingIndex, setViewingIndex] = useState<number | null>(null);

    useEffect(() => {
        if (!isInitialized) {
            return;
        }

        if (!user) {
            router.replace("/login");
            return;
        }

        if (!isOwner) {
            router.replace(dashboardPathForRole(user.role));
        }
    }, [isInitialized, isOwner, router, user]);

    const propertyQuery = useQuery({
        queryKey: ["owner-property", params.id],
        queryFn: () => getMyPropertyById(params.id as string),
        enabled: isInitialized && Boolean(params.id),
    });

    const subscriptionQuery = useSubscription({ enabled: isInitialized && isOwner });
    const maxImages = subscriptionQuery.data?.maxImages;

    const property = propertyQuery.data;

    const writeBack = (updated: Property) => {
        queryClient.setQueryData(["owner-property", params.id], updated);
        queryClient.invalidateQueries({ queryKey: ["owner-properties"] });
    };

    const refreshList = () =>
        queryClient.invalidateQueries({ queryKey: ["owner-properties"] });

    const updateMutation = useMutation({
        mutationFn: (values: OwnerPropertyFormValues) =>
            updateProperty(params.id as string, values),
        onSuccess: (updated) => {
            writeBack(updated);
            setNotice({
                type: "success",
                text: updated.locationResolvedName
                    ? `Saved. Location verified: ${updated.locationResolvedName}`
                    : "Saved.",
            });
        },
        onError: (err: unknown) => {
            const message =
                axios.isAxiosError(err) && typeof err.response?.data?.message === "string"
                    ? err.response.data.message
                    : "Failed to save property changes.";
            setNotice({ type: "error", text: message });
        },
    });

    const statusMutation = useMutation({
        mutationFn: (status: "active" | "inactive") =>
            updatePropertyStatus(params.id as string, status),
        onSuccess: () => {
            refreshList();
            setNotice({ type: "success", text: "Listing status updated." });
        },
        onError: (err: unknown) => {
            const message =
                axios.isAxiosError(err) && typeof err.response?.data?.message === "string"
                    ? err.response.data.message
                    : "Failed to update status.";
            setNotice({ type: "error", text: message });
        },
    });

    const archiveMutation = useMutation({
        mutationFn: () => archiveProperty(params.id as string),
        onSuccess: () => {
            queryClient.removeQueries({ queryKey: ["owner-property", params.id] });
            router.replace("/owner/properties");
        },
        onError: (err: unknown) => {
            const message =
                axios.isAxiosError(err) && typeof err.response?.data?.message === "string"
                    ? err.response.data.message
                    : "Failed to remove listing.";
            setNotice({ type: "error", text: message });
        },
    });

    const addImagesMutation = useMutation({
        mutationFn: (files: File[]) => addPropertyImages(params.id as string, files),
        onSuccess: (updated) => {
            writeBack(updated);
            setNotice({ type: "success", text: "Photos added successfully." });
        },
        onError: (err: unknown) => {
            const message =
                axios.isAxiosError(err) && typeof err.response?.data?.message === "string"
                    ? err.response.data.message
                    : "Failed to upload photos. Please try again.";
            setNotice({ type: "error", text: message });
        },
    });

    const setCoverMutation = useMutation({
        mutationFn: (targetIndex: number) => {
            if (!property || targetIndex <= 0 || targetIndex >= property.images.length) {
                return Promise.resolve(property!);
            }
            const targetImage = property.images[targetIndex];
            const remaining = property.images.filter((_, idx) => idx !== targetIndex);
            const newImages = [targetImage, ...remaining];
            return updateProperty(params.id as string, { images: newImages });
        },
        onSuccess: (updated) => {
            if (updated) {
                writeBack(updated);
                setNotice({ type: "success", text: "Cover photo updated successfully." });
            }
        },
        onError: (err: unknown) => {
            const message =
                axios.isAxiosError(err) && typeof err.response?.data?.message === "string"
                    ? err.response.data.message
                    : "Failed to update cover photo.";
            setNotice({ type: "error", text: message });
        },
    });

    const removeImageMutation = useMutation({
        mutationFn: (publicId: string) => {
            setDeletingId(publicId);
            return removePropertyImage(params.id as string, publicId);
        },
        onSuccess: (result) => {
            if (result.property) {
                writeBack(result.property);
            } else if (property && deletingId) {
                writeBack({
                    ...property,
                    images: property.images.filter(
                        (img) =>
                            img.publicId !== deletingId &&
                            (img as unknown as { _id?: string })._id !== deletingId &&
                            img.url !== deletingId
                    ),
                } as Property);
            }
            setNotice({ type: "success", text: result.message || "Photo removed successfully." });
        },
        onError: (err: unknown) => {
            const message =
                axios.isAxiosError(err) && typeof err.response?.data?.message === "string"
                    ? err.response.data.message
                    : "Failed to delete photo. Please try again.";
            setNotice({ type: "error", text: message });
        },
        onSettled: () => {
            setDeletingId(null);
        },
    });

    const handleFormSubmit = async (values: OwnerPropertyFormValues) => {
        await updateMutation.mutateAsync(values);
    };

    const handleFiles = (list: FileList | null) => {
        if (!list || list.length === 0) return;

        const rawFiles = Array.from(list);

        const invalidType = rawFiles.find((f) => !ALLOWED_MIME_TYPES.includes(f.type));
        if (invalidType) {
            setNotice({
                type: "error",
                text: `Invalid file format (${invalidType.name}). Only JPG, PNG, and WebP images are allowed.`,
            });
            if (fileInputRef.current) fileInputRef.current.value = "";
            return;
        }

        const oversized = rawFiles.find((f) => f.size > MAX_FILE_SIZE_BYTES);
        if (oversized) {
            setNotice({
                type: "error",
                text: `File "${oversized.name}" exceeds the 5MB size limit.`,
            });
            if (fileInputRef.current) fileInputRef.current.value = "";
            return;
        }

        const existingCount = property?.images.length ?? 0;
        if (maxImages !== undefined) {
            const available = maxImages - existingCount;
            if (available <= 0) {
                setNotice({
                    type: "error",
                    text: `You have reached the photo limit (${maxImages}) for your current plan.`,
                });
                if (fileInputRef.current) fileInputRef.current.value = "";
                return;
            }

            if (rawFiles.length > available) {
                setNotice({
                    type: "error",
                    text: `You can only add ${available} more photo${available === 1 ? "" : "s"} (plan max: ${maxImages}).`,
                });
                if (fileInputRef.current) fileInputRef.current.value = "";
                return;
            }
        }

        addImagesMutation.mutate(rawFiles);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    if (!isInitialized) {
        return null;
    }

    if (!user || !isOwner) {
        return null;
    }

    return (
        <DashboardShell role="owner">
            <main className="mx-auto max-w-[1200px] px-4 py-7 sm:px-6 sm:py-9 lg:px-10 lg:py-10">
                <Link
                    href="/owner/properties"
                    className="text-sm font-semibold text-[#00696b] hover:text-[#004f51]"
                >
                    ← Back to my properties
                </Link>

                {propertyQuery.isLoading ? (
                    <p className="py-10 text-sm text-[#75777e]">
                        Loading property...
                    </p>
                ) : propertyQuery.isError || !property ? (
                    <p className="py-10 text-sm text-[#95611d]">
                        Unable to load this property. It may have been removed or
                        you may not have access to it.
                    </p>
                ) : (
                    <>
                        <header className="mt-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                            <div>
                                <p className="text-sm font-semibold text-[#00696b]">
                                    Owner workspace
                                </p>

                                <h1 className="mt-2 text-3xl font-bold tracking-[-0.04em] text-[#191c1d]">
                                    Edit property
                                </h1>

                                <p className="mt-2 text-sm text-[#44474d]">
                                    Changes go live immediately.
                                </p>
                            </div>

                            <span
                                className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-bold capitalize ${statusTone[property.status]}`}
                            >
                                {property.status}
                            </span>
                        </header>

                        {notice && (
                            <div
                                className={`mt-6 rounded-2xl border px-5 py-4 text-sm ${
                                    notice.type === "success"
                                        ? "border-[#cfddd6] bg-[#eef8f2] text-[#2c6a48]"
                                        : "border-[#fecdca] bg-[#fef3f2] text-[#b42318]"
                                }`}
                            >
                                {notice.text}
                            </div>
                        )}

                        <div className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
                            <section>
                                <OwnerPropertyForm
                                    mode="edit"
                                    initial={property}
                                    submitLabel="Save changes"
                                    onSubmit={handleFormSubmit}
                                />
                            </section>

                            <aside className="space-y-6">
                                <section className="rounded-2xl border border-[#e1e3e4] bg-white p-6">
                                    <h2 className="text-lg font-bold text-[#191c1d]">
                                        Listing status
                                    </h2>

                                    <p className="mt-2 text-xs leading-5 text-[#75777e]">
                                        Only <span className="font-semibold">active</span>{" "}
                                        listings appear on the public listings page and in
                                        &ldquo;Near me&rdquo; searches.
                                    </p>

                                    {property.status !== "archived" && (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                statusMutation.mutate(
                                                    property.status === "active"
                                                        ? "inactive"
                                                        : "active"
                                                )
                                            }
                                            disabled={statusMutation.isPending}
                                            className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-[#191c1d] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#00696b] disabled:cursor-not-allowed disabled:opacity-60"
                                        >
                                            {statusMutation.isPending
                                                ? "Updating…"
                                                : property.status === "active"
                                                  ? "Deactivate listing"
                                                  : "Activate listing"}
                                        </button>
                                    )}

                                    <div className="mt-4 border-t border-[#eef0f1] pt-4">
                                        {archiveMutation.isPending ? (
                                            <p className="text-sm text-[#75777e]">
                                                Removing listing…
                                            </p>
                                        ) : confirmArchive ? (
                                            <div className="rounded-xl bg-[#fff0ee] p-3">
                                                <p className="text-xs font-semibold text-[#b42318]">
                                                    Remove this listing? It will disappear
                                                    from the platform.
                                                </p>
                                                <div className="mt-2 flex gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => archiveMutation.mutate()}
                                                        className="rounded-lg bg-[#b42318] px-3 py-1.5 text-xs font-bold text-white"
                                                    >
                                                        Yes, remove
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setConfirmArchive(false)}
                                                        className="rounded-lg border border-[#c5c6cd] px-3 py-1.5 text-xs font-semibold text-[#44474d]"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() => setConfirmArchive(true)}
                                                className="text-xs font-semibold text-[#b42318] transition hover:text-[#8c1512]"
                                            >
                                                Remove listing
                                            </button>
                                        )}
                                    </div>
                                </section>

                                <section className="rounded-2xl border border-[#e1e3e4] bg-white p-6">
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-lg font-bold text-[#191c1d]">
                                            Photos
                                        </h2>
                                        <span className="text-xs font-semibold text-[#75777e]">
                                            {property.images.length}
                                            {maxImages === undefined
                                                ? ""
                                                : `/${maxImages}`}
                                        </span>
                                    </div>

                                    {(maxImages === undefined ||
                                        property.images.length < maxImages) && (
                                        <label
                                            className={`mt-4 flex h-24 cursor-pointer flex-col items-center justify-center gap-1 rounded-2xl border border-dashed border-[#c5c6cd] bg-[#f8f9fa] text-[#00696b] transition hover:border-[#00696b] hover:bg-[#dff7f5] ${
                                                addImagesMutation.isPending ? "pointer-events-none opacity-50" : ""
                                            }`}
                                        >
                                            <span className="text-sm font-semibold">
                                                Add photos
                                            </span>
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                accept="image/jpeg,image/png,image/webp"
                                                multiple
                                                disabled={addImagesMutation.isPending}
                                                className="sr-only"
                                                onChange={(e) => handleFiles(e.target.files)}
                                            />
                                        </label>
                                    )}

                                    {addImagesMutation.isPending && (
                                        <p className="mt-3 text-xs text-[#75777e]">
                                            Uploading photos…
                                        </p>
                                    )}

                                    <div className="mt-4 grid grid-cols-2 gap-3">
                                        {property.images.map((image, index) => {
                                            const targetId =
                                                image.publicId ||
                                                (image as unknown as { _id?: string })._id ||
                                                image.url;
                                            const isDeletingThis = deletingId === targetId;

                                            return (
                                                <div
                                                    key={targetId}
                                                    className="group relative aspect-[1.3/1] overflow-hidden rounded-xl border border-[#e1e3e4] bg-[#f3f4f5]"
                                                >
                                                    <Image
                                                        src={image.url}
                                                        alt={`${property.title} photo ${index + 1}`}
                                                        fill
                                                        sizes="(max-width: 1024px) 50vw, 25vw"
                                                        className="cursor-pointer object-cover transition group-hover:scale-105"
                                                        onClick={() => setViewingIndex(index)}
                                                    />

                                                    {/* Cover badge or Make Cover button */}
                                                    {index === 0 ? (
                                                        <span className="absolute left-1.5 top-1.5 rounded-md bg-[#00696b] px-2 py-0.5 text-[10px] font-bold text-white shadow">
                                                            Cover
                                                        </span>
                                                    ) : (
                                                        <button
                                                            type="button"
                                                            disabled={setCoverMutation.isPending}
                                                            onClick={() => setCoverMutation.mutate(index)}
                                                            title="Set as cover photo"
                                                            className="absolute left-1.5 top-1.5 rounded-md bg-black/60 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm opacity-0 transition group-hover:opacity-100 hover:bg-[#00696b]"
                                                        >
                                                            Set Cover
                                                        </button>
                                                    )}

                                                    {/* Action buttons (View & Delete) */}
                                                    <div className="absolute right-1.5 top-1.5 flex gap-1">
                                                        <button
                                                            type="button"
                                                            title="View full photo"
                                                            onClick={() => setViewingIndex(index)}
                                                            className="grid h-7 w-7 place-items-center rounded-full bg-[#191c1d]/75 text-white opacity-0 transition hover:bg-[#00696b] group-hover:opacity-100"
                                                        >
                                                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                            </svg>
                                                        </button>

                                                        <button
                                                            type="button"
                                                            disabled={
                                                                removeImageMutation.isPending ||
                                                                addImagesMutation.isPending ||
                                                                property.images.length <= 1
                                                            }
                                                            aria-label="Remove photo"
                                                            title={
                                                                property.images.length <= 1
                                                                    ? "At least one photo is required"
                                                                    : "Remove photo"
                                                            }
                                                            onClick={() => {
                                                                if (property.images.length <= 1) {
                                                                    setNotice({
                                                                        type: "error",
                                                                        text: "At least one photo is required.",
                                                                    });
                                                                    return;
                                                                }
                                                                removeImageMutation.mutate(targetId);
                                                            }}
                                                            className={`grid h-7 w-7 place-items-center rounded-full bg-[#191c1d]/75 text-white transition hover:bg-[#b42318] ${
                                                                property.images.length <= 1
                                                                    ? "cursor-not-allowed opacity-40"
                                                                    : "opacity-0 group-hover:opacity-100"
                                                            }`}
                                                        >
                                                            <svg aria-hidden="true" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                                            </svg>
                                                        </button>
                                                    </div>

                                                    {isDeletingThis && (
                                                        <div className="absolute inset-0 grid place-items-center bg-black/40 backdrop-blur-[1px]">
                                                            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {property.images.length <= 1 && (
                                        <p className="mt-3 text-xs text-[#75777e]">
                                            A listing must keep at least one photo.
                                        </p>
                                    )}
                                </section>
                            </aside>
                        </div>
                    </>
                )}

                {/* Lightbox Modal for Viewing Entire Image */}
                {viewingIndex !== null && property && property.images[viewingIndex] && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
                        onClick={() => setViewingIndex(null)}
                    >
                        <div
                            className="relative flex w-full max-w-3xl max-h-[90vh] flex-col overflow-hidden rounded-2xl bg-[#191c1d] p-5 text-white shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between border-b border-white/10 pb-3">
                                <div className="flex items-center gap-3">
                                    <span className="text-sm font-semibold text-[#e1e3e4]">
                                        Photo {viewingIndex + 1} of {property.images.length}
                                    </span>
                                    {viewingIndex === 0 && (
                                        <span className="rounded-md bg-[#00696b] px-2 py-0.5 text-xs font-bold text-white">
                                            Cover Photo
                                        </span>
                                    )}
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setViewingIndex(null)}
                                    aria-label="Close image preview"
                                    className="grid h-8 w-8 place-items-center rounded-full bg-white/10 transition hover:bg-white/20 text-white"
                                >
                                    ✕
                                </button>
                            </div>

                            {/* Uncropped Full View */}
                            <div className="relative my-4 flex min-h-[300px] max-h-[65vh] flex-1 items-center justify-center overflow-hidden rounded-xl bg-black/50 p-2">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={property.images[viewingIndex].url}
                                    alt={`Full view photo ${viewingIndex + 1}`}
                                    className="max-h-[60vh] max-w-full rounded-lg object-contain"
                                />

                                {property.images.length > 1 && (
                                    <>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setViewingIndex((prev) =>
                                                    prev !== null
                                                        ? (prev - 1 + property.images.length) % property.images.length
                                                        : 0
                                                )
                                            }
                                            aria-label="Previous photo"
                                            className="absolute left-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-black/60 text-xl font-bold text-white backdrop-blur-sm transition hover:bg-black"
                                        >
                                            ‹
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setViewingIndex((prev) =>
                                                    prev !== null
                                                        ? (prev + 1) % property.images.length
                                                        : 0
                                                )
                                            }
                                            aria-label="Next photo"
                                            className="absolute right-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-black/60 text-xl font-bold text-white backdrop-blur-sm transition hover:bg-black"
                                        >
                                            ›
                                        </button>
                                    </>
                                )}
                            </div>

                            {/* Modal Footer Controls */}
                            <div className="flex items-center justify-between border-t border-white/10 pt-3">
                                <div>
                                    {viewingIndex !== 0 && (
                                        <button
                                            type="button"
                                            disabled={setCoverMutation.isPending}
                                            onClick={() => {
                                                setCoverMutation.mutate(viewingIndex);
                                                setViewingIndex(0);
                                            }}
                                            className="rounded-xl bg-[#00696b] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#004f51] disabled:opacity-50"
                                        >
                                            Set as Cover Photo
                                        </button>
                                    )}
                                </div>

                                <div className="flex gap-2">
                                    {property.images.length > 1 && (
                                        <button
                                            type="button"
                                            disabled={removeImageMutation.isPending}
                                            onClick={() => {
                                                const targetId =
                                                    property.images[viewingIndex].publicId ||
                                                    (property.images[viewingIndex] as unknown as { _id?: string })._id ||
                                                    property.images[viewingIndex].url;
                                                removeImageMutation.mutate(targetId);
                                                setViewingIndex(null);
                                            }}
                                            className="rounded-xl bg-[#b42318] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#8c1512] disabled:opacity-50"
                                        >
                                            Delete Photo
                                        </button>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => setViewingIndex(null)}
                                        className="rounded-xl border border-white/20 px-4 py-2 text-xs font-semibold text-white transition hover:bg-white/10"
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </DashboardShell>
    );
}