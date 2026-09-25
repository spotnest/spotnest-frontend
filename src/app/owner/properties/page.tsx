"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import DashboardShell from "@/src/modules/dashboard/components/DashboardShell";
import OwnerPropertyCard from "@/src/modules/properties/components/OwnerPropertyCard";
import { getMyProperties } from "@/src/modules/properties/services/propertyService";
import type { PropertyStatus } from "@/src/modules/properties/types";
import { dashboardPathForRole } from "@/src/constants/routes";
import { useAppSelector } from "@/src/store/hook";

type StatusFilter = PropertyStatus | "all";

export default function OwnerPropertiesPage() {
    const router = useRouter();

    const { user, isInitialized } = useAppSelector((state) => state.auth);

    const isOwner =
        user?.role === "owner" &&
        user.verificationStatus === "approved";

    const [status, setStatus] = useState<StatusFilter>("all");
    const [search, setSearch] = useState("");

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

    const propertiesQuery = useQuery({
        queryKey: ["owner-properties"],
        queryFn: getMyProperties,
        enabled: isInitialized && isOwner,
    });

    const filtered = useMemo(() => {
        const items = propertiesQuery.data ?? [];
        const trimmed = search.trim().toLowerCase();

        return items
            .filter((property) =>
                status === "all" ? true : property.status === status
            )
            .filter((property) => {
                if (!trimmed) return true;
                return (
                    property.title.toLowerCase().includes(trimmed) ||
                    property.address.city.toLowerCase().includes(trimmed) ||
                    property.address.street.toLowerCase().includes(trimmed)
                );
            });
    }, [propertiesQuery.data, search, status]);

    const counts = useMemo(() => {
        const items = propertiesQuery.data ?? [];
        return {
            active: items.filter((property) => property.status === "active").length,
            inactive: items.filter((property) => property.status === "inactive").length,
            archived: items.filter((property) => property.status === "archived").length,
        };
    }, [propertiesQuery.data]);

    if (!isInitialized) {
        return null;
    }

    if (!user || !isOwner) {
        return null;
    }

    const errorMessage =
        axios.isAxiosError(propertiesQuery.error) &&
        typeof propertiesQuery.error.response?.data?.message === "string"
            ? propertiesQuery.error.response.data.message
            : "Unable to load your properties. Please refresh and try again.";

    const tabClass = (value: StatusFilter, selected: StatusFilter) =>
        `rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
            value === selected
                ? "bg-[#00696b] text-white"
                : "bg-white text-[#44474d] hover:bg-[#f3f4f5]"
        }`;

    const countFor = (value: StatusFilter) =>
        value === "active"
            ? counts.active
            : value === "inactive"
              ? counts.inactive
              : value === "archived"
                ? counts.archived
                : propertiesQuery.data?.length ?? 0;

    return (
        <DashboardShell role="owner">
            <main className="mx-auto max-w-[1500px] px-4 py-7 sm:px-6 sm:py-9 lg:px-10 lg:py-10">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                    <div>
                        <p className="text-sm font-semibold text-[#00696b]">
                            Owner workspace
                        </p>

                        <h1 className="mt-2 text-3xl font-bold tracking-[-0.04em] text-[#191c1d]">
                            My Properties
                        </h1>

                        <p className="mt-2 text-sm leading-6 text-[#44474d]">
                            Listings you add go live immediately, so tenants across
                            the platform — including &ldquo;Near me&rdquo; — can see them.
                        </p>
                    </div>

                    <Link
                        href="/owner/properties/new"
                        className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#00696b] px-5 py-3 text-sm font-semibold text-white shadow-xs transition hover:bg-[#004f51]"
                    >
                        <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                        Add a property
                    </Link>
                </div>

                <div className="mt-7 flex flex-col gap-3 lg:flex-row lg:items-center">
                    <div className="flex flex-wrap gap-2 rounded-2xl border border-[#e1e3e4] bg-white p-2">
                        {(["all", "active", "inactive", "archived"] as StatusFilter[]).map((value) => (
                            <button
                                key={value}
                                type="button"
                                onClick={() => {
                                    setStatus(value);
                                    setSearch("");
                                }}
                                className={tabClass(value, status)}
                            >
                                {value === "all"
                                    ? `All (${countFor("all")})`
                                    : `${value[0].toUpperCase()}${value.slice(1)} (${countFor(value)})`}
                            </button>
                        ))}
                    </div>

                    <input
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Search title or city"
                        aria-label="Search your properties"
                        className="h-11 min-w-0 flex-1 rounded-xl border border-[#c5c6cd] bg-white px-3 text-sm text-[#191c1d] outline-none transition focus:border-[#00696b] focus:ring-2 focus:ring-[#d9f4f3]"
                    />
                </div>

                <section className="mt-6" aria-label="Your properties">
                    {propertiesQuery.isLoading ? (
                        <div className="rounded-2xl border border-[#e1e3e4] bg-white px-5 py-10 text-center text-sm text-[#75777e]">
                            Loading properties...
                        </div>
                    ) : propertiesQuery.isError ? (
                        <div
                            role="alert"
                            className="rounded-2xl border border-[#f0b5ae] bg-[#fff0ee] px-5 py-8 text-sm text-[#b42318]"
                        >
                            {errorMessage}
                        </div>
                    ) : filtered.length ? (
                        <>
                            <p className="mb-4 text-sm font-semibold text-[#75777e]">
                                {filtered.length} property{filtered.length === 1 ? "" : "ies"}
                                {status !== "all" ? ` · ${status}` : ""}
                                {search.trim() ? " · filtered" : ""}
                            </p>

                            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                                {filtered.map((property) => (
                                    <OwnerPropertyCard key={property._id} property={property} />
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="rounded-2xl border border-dashed border-[#c5c6cd] bg-white px-5 py-12 text-center">
                            <p className="text-sm font-bold text-[#191c1d]">
                                {propertiesQuery.data?.length
                                    ? "No properties match this filter"
                                    : "You haven't added any properties yet"}
                            </p>

                            <p className="mt-1 text-sm text-[#75777e]">
                                {propertiesQuery.data?.length
                                    ? "Try another status or search term."
                                    : "Add your first listing to start receiving tenant enquiries."}
                            </p>

                            {!propertiesQuery.data?.length && (
                                <Link
                                    href="/owner/properties/new"
                                    className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#00696b] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#004f51]"
                                >
                                    Add a property
                                </Link>
                            )}
                        </div>
                    )}
                </section>
            </main>
        </DashboardShell>
    );
}