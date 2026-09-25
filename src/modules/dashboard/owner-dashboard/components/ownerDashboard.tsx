"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { getMyProperties } from "@/src/modules/properties/services/propertyService";
import { formatPrice } from "@/src/modules/properties/utils/format";

export default function OwnerDashboard() {
    const propertiesQuery = useQuery({
        queryKey: ["owner-properties"],
        queryFn: getMyProperties,
    });

    const properties = propertiesQuery.data ?? [];

    const counts = {
        total: properties.length,
        active: properties.filter((property) => property.status === "active").length,
        inactive: properties.filter((property) => property.status === "inactive").length,
    };

    const recent = [...properties]
        .sort(
            (a, b) =>
                new Date(b.updated_at ?? b.created_at).getTime() -
                new Date(a.updated_at ?? a.created_at).getTime()
        )
        .slice(0, 3);

    const statCard =
        "rounded-2xl border border-[#e1e3e4] bg-white p-5 shadow-xs";

    return (
        <div className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6 sm:py-10 lg:px-10 lg:py-12">
            <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#00696b]">
                        Owner Portal
                    </p>
                    <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#191c1d] sm:text-4xl">
                        Property Owner Dashboard
                    </h1>
                    <p className="mt-2 text-base text-[#44474d]">
                        Manage your listed properties, review tenant applications, and monitor rental earnings.
                    </p>
                </div>

                <Link
                    href="/owner/properties/new"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#00696b] px-5 py-3 text-sm font-semibold text-white shadow-xs transition hover:bg-[#004f51]"
                >
                    <span>Add a property</span>
                </Link>
            </section>

            <section className="mt-10 grid gap-4 sm:grid-cols-3">
                <div className={statCard}>
                    <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#75777e]">
                        Active listings
                    </p>
                    <p className="mt-2 text-4xl font-bold tracking-tight text-[#00696b]">
                        {counts.active}
                    </p>
                    <p className="mt-1 text-xs text-[#75777e]">
                        Visible to tenants now
                    </p>
                </div>

                <div className={statCard}>
                    <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#75777e]">
                        Inactive listings
                    </p>
                    <p className="mt-2 text-4xl font-bold tracking-tight text-[#191c1d]">
                        {counts.inactive}
                    </p>
                    <p className="mt-1 text-xs text-[#75777e]">
                        Hidden until you activate them
                    </p>
                </div>

                <div className={statCard}>
                    <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#75777e]">
                        Total properties
                    </p>
                    <p className="mt-2 text-4xl font-bold tracking-tight text-[#191c1d]">
                        {counts.total}
                    </p>
                    <p className="mt-1 text-xs text-[#75777e]">
                        All time
                    </p>
                </div>
            </section>

            <section className="mt-10 rounded-2xl border border-[#e1e3e4] bg-white p-6 shadow-xs">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold tracking-tight text-[#191c1d]">
                        Recent listings
                    </h2>
                    <Link
                        href="/owner/properties"
                        className="text-sm font-semibold text-[#00696b] transition hover:text-[#004f51]"
                    >
                        Manage all →
                    </Link>
                </div>

                {propertiesQuery.isLoading ? (
                    <p className="mt-4 text-sm text-[#75777e]">Loading…</p>
                ) : recent.length === 0 ? (
                    <div className="mt-6 border-t border-[#e1e3e4] pt-6 text-center">
                        <p className="text-sm font-semibold text-[#191c1d]">
                            No properties yet
                        </p>
                        <p className="mt-1 text-xs text-[#75777e]">
                            List your first property to start receiving tenant enquiries.
                        </p>
                        <Link
                            href="/owner/properties/new"
                            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#00696b] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#004f51]"
                        >
                            Add a property
                        </Link>
                    </div>
                ) : (
                    <ul className="mt-4 divide-y divide-[#eef0f1]">
                        {recent.map((property) => (
                            <li key={property._id}>
                                <Link
                                    href={`/owner/properties/${property._id}/edit`}
                                    className="flex items-center justify-between gap-4 py-4 transition hover:bg-[#f8f9fa]"
                                >
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-semibold text-[#191c1d]">
                                            {property.title}
                                        </p>
                                        <p className="mt-0.5 truncate text-xs text-[#75777e]">
                                            {property.address.city}, {property.address.state}
                                        </p>
                                    </div>

                                    <div className="flex shrink-0 items-center gap-3">
                                        <span className="text-sm font-bold text-[#00696b]">
                                            {formatPrice(property.price)}
                                        </span>
                                        <span
                                            className={`rounded-full px-2.5 py-1 text-[11px] font-bold capitalize ${
                                                property.status === "active"
                                                    ? "bg-[#d9f4f3] text-[#00696b]"
                                                    : property.status === "inactive"
                                                      ? "bg-[#fff0dc] text-[#95611d]"
                                                      : "bg-[#eef0f1] text-[#44474d]"
                                            }`}
                                        >
                                            {property.status}
                                        </span>
                                    </div>
                                </Link>
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </div>
    );
}