"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import DashboardShell from "@/src/modules/dashboard/components/DashboardShell";
import AdminPropertyCard from "@/src/modules/properties/components/AdminPropertyCard";
import { getAdminProperties } from "@/src/modules/properties/services/propertyService";
import type { PropertyStatus } from "@/src/modules/properties/types";
import { dashboardPathForRole } from "@/src/constants/routes";
import { useAppSelector } from "@/src/store/hook";

const PAGE_SIZE = 50;

export default function AdminPropertiesPage() {
    const router = useRouter();

    const { user, initialized } = useAppSelector(
        (state) => state.auth,
    );

    const isAdmin = user?.role === "admin";

    const [page, setPage] = useState(1);
    const [status, setStatus] = useState<PropertyStatus | "">("");
    const [search, setSearch] = useState("");

    /*
     * Protect the admin page.
     *
     * Wait until Redux has restored the authentication state.
     * Non-admin users are redirected to their own dashboard route.
     */
    useEffect(() => {
        if (!initialized) {
            return;
        }

        if (!user) {
            router.replace("/login");
            return;
        }

        if (!isAdmin) {
            router.replace(dashboardPathForRole(user.role));
        }
    }, [initialized, isAdmin, router, user]);

    const propertiesQuery = useQuery({
        queryKey: ["admin-properties", page, status, search],

        queryFn: () =>
            getAdminProperties({
                page,
                limit: PAGE_SIZE,
                ...(status ? { status } : {}),
                ...(search.trim()
                    ? { search: search.trim() }
                    : {}),
            }),

        enabled: initialized && isAdmin,
    });

    /*
     * Do not render anything until authentication has been restored.
     */
    if (!initialized) {
        return null;
    }

    /*
     * Prevent unauthorized users from seeing admin content
     * while the redirect is happening.
     */
    if (!user || !isAdmin) {
        return null;
    }

    const errorMessage =
        axios.isAxiosError(propertiesQuery.error) &&
        typeof propertiesQuery.error.response?.data?.message === "string"
            ? propertiesQuery.error.response.data.message
            : "Unable to load properties. Please refresh and try again.";

    const pagination = propertiesQuery.data?.pagination;

    return (
        <DashboardShell role="admin">
            <main className="mx-auto max-w-[1500px] px-4 py-7 sm:px-6 sm:py-9 lg:px-10 lg:py-10">
                <p className="text-sm font-semibold text-[#00696b]">
                    Admin workspace
                </p>

                <h1 className="mt-2 text-3xl font-bold tracking-[-0.04em] text-[#191c1d]">
                    Properties
                </h1>

                <p className="mt-2 text-sm leading-6 text-[#44474d]">
                    View every platform listing, its owner details,
                    listing state, and rental availability.
                </p>

                {/* Search and filters */}
                <div className="mt-7 flex flex-col gap-3 rounded-2xl border border-[#e1e3e4] bg-white p-4 sm:flex-row sm:items-center">
                    <input
                        value={search}
                        onChange={(event) => {
                            setSearch(event.target.value);
                            setPage(1);
                        }}
                        placeholder="Search title or location"
                        aria-label="Search properties"
                        className="h-11 min-w-0 flex-1 rounded-xl border border-[#c5c6cd] px-3 text-sm text-[#191c1d] outline-none transition focus:border-[#00696b] focus:ring-2 focus:ring-[#d9f4f3]"
                    />

                    <select
                        value={status}
                        onChange={(event) => {
                            setStatus(
                                event.target.value as PropertyStatus | "",
                            );
                            setPage(1);
                        }}
                        aria-label="Filter by listing status"
                        className="h-11 rounded-xl border border-[#c5c6cd] bg-white px-3 text-sm font-semibold text-[#44474d] outline-none focus:border-[#00696b]"
                    >
                        <option value="">
                            All listing statuses
                        </option>

                        <option value="active">
                            Active
                        </option>

                        <option value="inactive">
                            Inactive
                        </option>

                        <option value="archived">
                            Archived
                        </option>
                    </select>
                </div>

                {/* Property results */}
                <section
                    className="mt-6"
                    aria-label="All properties"
                >
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
                    ) : propertiesQuery.data?.items.length ? (
                        <>
                            <p className="mb-4 text-sm font-semibold text-[#75777e]">
                                {pagination?.total ?? 0} properties found
                            </p>

                            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                                {propertiesQuery.data.items.map(
                                    (property) => (
                                        <AdminPropertyCard
                                            key={property._id}
                                            property={property}
                                        />
                                    ),
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="rounded-2xl border border-dashed border-[#c5c6cd] bg-white px-5 py-12 text-center">
                            <p className="text-sm font-bold text-[#191c1d]">
                                No properties found
                            </p>

                            <p className="mt-1 text-sm text-[#75777e]">
                                Try another search or listing status.
                            </p>
                        </div>
                    )}
                </section>

                {/* Pagination */}
                {!!pagination && pagination.pages > 1 && (
                    <div className="mt-8 flex items-center justify-between rounded-xl border border-[#e1e3e4] bg-white px-4 py-3 text-sm">
                        <span className="text-[#75777e]">
                            Page {pagination.page} of{" "}
                            {pagination.pages}
                        </span>

                        <div className="flex gap-2">
                            <button
                                type="button"
                                disabled={page === 1}
                                onClick={() =>
                                    setPage(
                                        (current) =>
                                            current - 1,
                                    )
                                }
                                className="rounded-lg border border-[#c5c6cd] px-3 py-2 font-bold text-[#44474d] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Previous
                            </button>

                            <button
                                type="button"
                                disabled={
                                    page === pagination.pages
                                }
                                onClick={() =>
                                    setPage(
                                        (current) =>
                                            current + 1,
                                    )
                                }
                                className="rounded-lg bg-[#00696b] px-3 py-2 font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </main>
        </DashboardShell>
    );
}