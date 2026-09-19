"use client";

import Link from "next/link";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import DashboardShell from "@/src/modules/dashboard/components/DashboardShell";
import {
    archiveProperty,
    getAdminProperties,
    updatePropertyStatus,
} from "@/src/modules/properties";
import type { AdminProperty, PropertyStatus } from "@/src/modules/properties";

const statusTabs: Array<{ label: string; value?: PropertyStatus }> = [
    { label: "All" },
    { label: "Listed", value: "active" },
    { label: "Unlisted", value: "inactive" },
    { label: "Archived", value: "archived" },
];

const propertyTypeLabels: Record<string, string> = {
    apartment: "Apartment",
    house: "House",
    villa: "Villa",
    studio: "Studio",
    room: "Room",
};

function ListingStatus({ status }: { status: PropertyStatus }) {
    const label = status === "active" ? "Listed" : status === "inactive" ? "Unlisted" : "Archived";
    const style = status === "active" ? "bg-[#d9f4f3] text-[#00696b]" : status === "inactive" ? "bg-[#fff0dc] text-[#95611d]" : "bg-[#f3f4f5] text-[#44474d]";
    return <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ${style}`}>{label}</span>;
}

function RentalStatus({ status }: { status: AdminProperty["rentalStatus"] }) {
    const label = status === "available" ? "Available" : "Rented";
    const style = status === "available" ? "bg-[#d9f4f3] text-[#00696b]" : "bg-[#fff0dc] text-[#95611d]";
    return <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ${style}`}>{label}</span>;
}

function formatDate(value: string) {
    if (!value) return "N/A";
    return new Intl.DateTimeFormat("en-US", { month: "short", day: "2-digit", year: "numeric" }).format(new Date(value));
}

export default function AdminPropertiesPage() {
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState<PropertyStatus | undefined>();
    const queryClient = useQueryClient();
    const propertiesQuery = useQuery({
        queryKey: ["admin-properties", search, status],
        queryFn: () => getAdminProperties({ search: search.trim() || undefined, status, limit: 50 }),
    });
    const statusMutation = useMutation({
        mutationFn: ({ id, nextStatus }: { id: string; nextStatus: "active" | "inactive" }) => updatePropertyStatus(id, nextStatus),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-properties"] }),
    });
    const archiveMutation = useMutation({
        mutationFn: archiveProperty,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-properties"] }),
    });

    const handleArchive = (property: AdminProperty) => {
        if (window.confirm(`Archive ${property.title}?`)) archiveMutation.mutate(property._id);
    };

    return (
        <DashboardShell role="admin">
            <main className="mx-auto max-w-[1500px] px-4 py-7 sm:px-6 sm:py-9 lg:px-10 lg:py-10">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                    <div>
                        <p className="text-sm font-semibold text-[#00696b]">Admin workspace</p>
                        <h1 className="mt-2 text-3xl font-bold tracking-[-0.04em] text-[#191c1d]">Properties</h1>
                        <p className="mt-2 text-sm leading-6 text-[#44474d]">Review listings, owners, and property records.</p>
                    </div>
                    <Link href="/properties" className="text-sm font-semibold text-[#00696b] hover:text-[#004f51]">Open public listings <span aria-hidden="true">→</span></Link>
                </div>

                <section className="mt-8 rounded-2xl border border-[#e1e3e4] bg-white p-4">
                    <label className="block text-[11px] font-bold uppercase tracking-[0.12em] text-[#75777e]" htmlFor="property-search">Search properties</label>
                    <input id="property-search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by title, city, or state" className="mt-2 h-11 w-full rounded-lg border border-[#c5c6cd] px-3 text-sm text-[#191c1d] outline-none focus:border-[#00696b] focus:ring-2 focus:ring-[#d9f4f3]" />
                    <div className="mt-4 flex flex-wrap gap-2" role="tablist" aria-label="Property status filters">
                        {statusTabs.map((tab) => <button key={tab.label} type="button" onClick={() => setStatus(tab.value)} className={`rounded-lg px-3.5 py-2 text-sm font-semibold transition ${status === tab.value ? "bg-[#00696b] text-white" : "border border-[#e1e3e4] text-[#44474d] hover:bg-[#f3f4f5]"}`}>{tab.label}</button>)}
                    </div>
                </section>

                <section className="mt-6 overflow-x-auto rounded-2xl border border-[#e1e3e4] bg-white">
                    {propertiesQuery.isLoading ? <p className="px-5 py-8 text-sm text-[#75777e]">Loading properties...</p> : propertiesQuery.isError ? <p className="px-5 py-8 text-sm text-[#95611d]">Unable to load properties.</p> : propertiesQuery.data?.items.length === 0 ? <p className="px-5 py-8 text-sm text-[#75777e]">No properties match this view.</p> : (
                        <table className="w-full min-w-[1040px] border-collapse text-left">
                            <thead><tr className="border-b border-[#eef0f1] text-[11px] font-bold uppercase tracking-[0.12em] text-[#75777e]"><th className="px-5 py-4">Property</th><th className="px-3 py-4">Owner</th><th className="px-3 py-4">Location</th><th className="px-3 py-4">Price</th><th className="px-3 py-4">Listing status</th><th className="px-3 py-4">Rental status</th><th className="px-3 py-4">Created</th><th className="px-5 py-4 text-right">Actions</th></tr></thead>
                            <tbody>{propertiesQuery.data?.items.map((property) => <tr key={property._id} className="border-b border-[#eef0f1] last:border-0"><td className="px-5 py-4"><p className="text-sm font-semibold text-[#191c1d]">{property.title ?? "Untitled property"}</p><p className="mt-1 text-xs text-[#75777e]">{propertyTypeLabels[property.propertyType] ?? property.propertyType ?? "Unknown type"} · {property.bedrooms ?? "N/A"} bed · {property.bathrooms ?? "N/A"} bath</p></td><td className="px-3 py-4"><p className="text-sm font-semibold text-[#191c1d]">{property.owner?.name ?? "Unknown Owner"}</p><p className="mt-1 text-xs text-[#75777e]">{property.owner?.email ?? "No email"}</p></td><td className="px-3 py-4 text-sm text-[#44474d]">{property.address?.city ?? "Unknown city"}, {property.address?.state ?? "Unknown state"}</td><td className="px-3 py-4 text-sm font-semibold text-[#191c1d]">{property.price != null ? `₹${property.price.toLocaleString("en-IN")}` : "N/A"}</td><td className="px-3 py-4">{property.status ? <ListingStatus status={property.status} /> : <span className="text-xs text-[#75777e]">Unknown</span>}</td><td className="px-3 py-4"><RentalStatus status={property.rentalStatus} /></td><td className="px-3 py-4 text-xs text-[#75777e]">{formatDate(property.created_at)}</td><td className="px-5 py-4"><div className="flex items-center justify-end gap-3"><Link href={`/admin/properties/${property._id}`} className="text-xs font-bold text-[#00696b] hover:text-[#004f51]">View details</Link>{property.status !== "archived" && <button type="button" onClick={() => statusMutation.mutate({ id: property._id, nextStatus: property.status === "active" ? "inactive" : "active" })} className="text-xs font-bold text-[#44474d] hover:text-[#191c1d]">{property.status === "active" ? "Unlist" : "List"}</button>}{property.status !== "archived" && <button type="button" onClick={() => handleArchive(property)} className="text-xs font-bold text-[#95611d] hover:text-[#714914]">Archive</button>}</div></td></tr>)}</tbody>
                        </table>
                    )}
                </section>
            </main>
        </DashboardShell>
    );
}
