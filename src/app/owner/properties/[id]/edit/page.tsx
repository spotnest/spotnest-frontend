"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";

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
import { dashboardPathForRole } from "@/src/constants/routes";
import { useAppSelector } from "@/src/store/hook";

const MAX_IMAGES = 8;

const statusTone: Record<Property["status"], string> = {
    active: "bg-[#d9f4f3] text-[#00696b]",
    inactive: "bg-[#fff0dc] text-[#95611d]",
    archived: "bg-[#eef0f1] text-[#44474d]",
};

export default function EditOwnerPropertyPage() {
    const params = useParams<{ id: string }>();
    const router = useRouter();

    const { user, isInitialized } = useAppSelector((state) => state.auth);

    const isOwner =
        user?.role === "owner" &&
        user.verificationStatus === "approved";

    const queryClient = useQueryClient();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [notice, setNotice] = useState<string | null>(null);
    const [confirmArchive, setConfirmArchive] = useState(false);

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
            setNotice(
                updated.locationResolvedName
                    ? `Saved. Location verified: ${updated.locationResolvedName}`
                    : "Saved."
            );
        },
    });

    const statusMutation = useMutation({
        mutationFn: (status: "active" | "inactive") =>
            updatePropertyStatus(params.id as string, status),
        onSuccess: () => {
            refreshList();
            setNotice("Listing status updated.");
        },
    });

    const archiveMutation = useMutation({
        mutationFn: () => archiveProperty(params.id as string),
        onSuccess: () => {
            queryClient.removeQueries({ queryKey: ["owner-property", params.id] });
            router.replace("/owner/properties");
        },
    });

    const addImagesMutation = useMutation({
        mutationFn: (files: File[]) => addPropertyImages(params.id as string, files),
        onSuccess: (updated) => {
            writeBack(updated);
            setNotice("Photos added.");
        },
    });

    const removeImageMutation = useMutation({
        mutationFn: (publicId: string) =>
            removePropertyImage(params.id as string, publicId),
        onSuccess: (result, publicId) => {
            if (property) {
                writeBack({
                    ...property,
                    images: property.images.filter(
                        (image) => image.publicId !== publicId
                    ),
                } as Property);
            }
            setNotice(result.message);
        },
    });

    const handleFormSubmit = async (values: OwnerPropertyFormValues) => {
        await updateMutation.mutateAsync(values);
    };

    const handleFiles = (list: FileList | null) => {
        if (!list) return;
        const remaining = property ? MAX_IMAGES - property.images.length : MAX_IMAGES;
        const files = Array.from(list).slice(0, Math.max(remaining, 0));
        if (files.length > 0) {
            addImagesMutation.mutate(files);
        }
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
                            <div className="mt-6 rounded-2xl border border-[#cfddd6] bg-[#eef8f2] px-5 py-4 text-sm text-[#2c6a48]">
                                {notice}
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
                                            {property.images.length}/{MAX_IMAGES}
                                        </span>
                                    </div>

                                    {property.images.length < MAX_IMAGES && (
                                        <label className="mt-4 flex h-24 cursor-pointer flex-col items-center justify-center gap-1 rounded-2xl border border-dashed border-[#c5c6cd] bg-[#f8f9fa] text-[#00696b] transition hover:border-[#00696b] hover:bg-[#dff7f5]">
                                            <span className="text-sm font-semibold">
                                                Add photos
                                            </span>
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                accept="image/jpeg,image/png,image/webp"
                                                multiple
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
                                        {property.images.map((image, index) => (
                                            <div
                                                key={image.publicId || image.url}
                                                className="group relative aspect-[1.3/1] overflow-hidden rounded-xl border border-[#e1e3e4] bg-[#f3f4f5]"
                                            >
                                                <Image
                                                    src={image.url}
                                                    alt={`${property.title} photo ${index + 1}`}
                                                    fill
                                                    sizes="(max-width: 1024px) 50vw, 25vw"
                                                    className="object-cover"
                                                />

                                                {property.images.length > 1 && (
                                                    <button
                                                        type="button"
                                                        disabled={removeImageMutation.isPending}
                                                        aria-label="Remove photo"
                                                        title="Remove photo"
                                                        onClick={() =>
                                                            removeImageMutation.mutate(
                                                                image.publicId
                                                            )
                                                        }
                                                        className="absolute right-1.5 top-1.5 grid h-7 w-7 place-items-center rounded-full bg-[#191c1d]/75 text-white opacity-0 transition hover:bg-[#b42318] group-hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-50"
                                                    >
                                                        <svg aria-hidden="true" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                                        </svg>
                                                    </button>
                                                )}
                                            </div>
                                        ))}
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
            </main>
        </DashboardShell>
    );
}