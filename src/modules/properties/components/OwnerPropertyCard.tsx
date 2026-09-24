"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import {
    archiveProperty,
    updatePropertyStatus,
} from "../services/propertyService";
import { formatPrice, propertyTypeLabels } from "../utils/format";
import type { Property } from "../types";

type Props = {
    property: Property;
};

const statusTone: Record<Property["status"], string> = {
    active: "bg-[#d9f4f3] text-[#00696b]",
    inactive: "bg-[#fff0dc] text-[#95611d]",
    archived: "bg-[#eef0f1] text-[#44474d]",
};

export default function OwnerPropertyCard({ property }: Props) {
    const queryClient = useQueryClient();
    const [actionError, setActionError] = useState<string | null>(null);
    const [confirmArchive, setConfirmArchive] = useState(false);

    const refresh = () =>
        queryClient.invalidateQueries({ queryKey: ["owner-properties"] });

    const statusMutation = useMutation({
        mutationFn: (status: "active" | "inactive") =>
            updatePropertyStatus(property._id, status),
        onSuccess: refresh,
        onError: (err: unknown) =>
            setActionError(
                axios.isAxiosError(err) &&
                    typeof err.response?.data?.message === "string"
                    ? err.response.data.message
                    : "Could not update the listing status."
            ),
    });

    const archiveMutation = useMutation({
        mutationFn: () => archiveProperty(property._id),
        onSuccess: refresh,
        onError: (err: unknown) =>
            setActionError(
                axios.isAxiosError(err) &&
                    typeof err.response?.data?.message === "string"
                    ? err.response.data.message
                    : "Could not archive the property."
            ),
    });

    const image = property.images[0]?.url;
    const area = property.areaSqFt
        ? `${property.areaSqFt.toLocaleString("en-IN")} sq ft`
        : null;
    const isArchived = property.status === "archived";

    return (
        <article className="overflow-hidden rounded-2xl border border-[#e1e3e4] bg-white shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
            <div className="relative aspect-[1.75/1] overflow-hidden bg-[#e7e8e9]">
                {image ? (
                    <Image
                        src={image}
                        alt={`${property.title} in ${property.address.city}`}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                        className="object-cover"
                    />
                ) : (
                    <div className="flex h-full items-center justify-center text-sm text-[#75777e]">
                        No image available
                    </div>
                )}

                <div className="absolute left-3 top-3 flex flex-wrap gap-2">
                    <span className="rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-bold text-[#191c1d] shadow-sm backdrop-blur">
                        {propertyTypeLabels[property.propertyType] ?? property.propertyType}
                    </span>
                    <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold capitalize shadow-sm ${statusTone[property.status]}`}>
                        {property.status}
                    </span>
                </div>
            </div>

            <div className="p-5">
                <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                        <h2 className="truncate text-lg font-bold text-[#191c1d]">
                            {property.title}
                        </h2>
                        <p className="mt-1 truncate text-sm text-[#44474d]">
                            {property.address.street}, {property.address.city}, {property.address.state}
                        </p>
                    </div>
                    <p className="shrink-0 text-base font-bold text-[#00696b]">
                        {formatPrice(property.price)}
                    </p>
                </div>

                <div className="mt-4 flex flex-wrap gap-x-3 gap-y-1 border-y border-[#eef0f1] py-3 text-xs font-semibold text-[#44474d]">
                    <span>{property.bedrooms} {property.bedrooms === 1 ? "Bed" : "Beds"}</span>
                    <span>{property.bathrooms} {property.bathrooms === 1 ? "Bath" : "Baths"}</span>
                    {area && <span>{area}</span>}
                    <span>{property.images.length} {property.images.length === 1 ? "Photo" : "Photos"}</span>
                </div>

                {property.locationResolvedName && (
                    <p className="mt-3 flex items-start gap-1.5 text-xs leading-5 text-[#75777e]">
                        <svg aria-hidden="true" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#00696b]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 10c0 5.25-7 10-7 10S5 15.25 5 10a7 7 0 1 1 14 0Z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.5 10a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Z" />
                        </svg>
                        <span>{property.locationResolvedName}</span>
                    </p>
                )}

                {actionError && (
                    <p role="alert" className="mt-3 rounded-lg border border-[#f0b5ae] bg-[#fff0ee] px-3 py-2 text-xs font-medium text-[#b42318]">
                        {actionError}
                    </p>
                )}

                <div className="mt-4 flex flex-wrap items-center gap-2">
                    <Link
                        href={`/owner/properties/${property._id}/edit`}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-[#c5c6cd] px-3 py-2 text-xs font-semibold text-[#191c1d] transition hover:border-[#00696b] hover:text-[#00696b]"
                    >
                        Edit
                    </Link>

                    {!isArchived && (
                        <button
                            type="button"
                            onClick={() =>
                                statusMutation.mutate(
                                    property.status === "active" ? "inactive" : "active"
                                )
                            }
                            disabled={statusMutation.isPending}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-[#c5c6cd] px-3 py-2 text-xs font-semibold text-[#191c1d] transition hover:border-[#00696b] hover:text-[#00696b] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {statusMutation.isPending
                                ? "Updating…"
                                : property.status === "active"
                                  ? "Deactivate"
                                  : "Activate"}
                        </button>
                    )}

                    {!isArchived &&
                        (confirmArchive ? (
                            <span className="inline-flex items-center gap-2 rounded-lg bg-[#fff0ee] px-3 py-2">
                                <span className="text-xs font-semibold text-[#b42318]">Archive?</span>
                                <button
                                    type="button"
                                    onClick={() => archiveMutation.mutate()}
                                    disabled={archiveMutation.isPending}
                                    className="text-xs font-bold text-[#b42318] underline"
                                >
                                    {archiveMutation.isPending ? "Archiving…" : "Yes"}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setConfirmArchive(false)}
                                    className="text-xs font-semibold text-[#44474d] underline"
                                >
                                    No
                                </button>
                            </span>
                        ) : (
                            <button
                                type="button"
                                onClick={() => {
                                    setActionError(null);
                                    setConfirmArchive(true);
                                }}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-[#c5c6cd] px-3 py-2 text-xs font-semibold text-[#b42318] transition hover:border-[#b42318]"
                            >
                                Archive
                            </button>
                        ))}
                </div>
            </div>
        </article>
    );
}