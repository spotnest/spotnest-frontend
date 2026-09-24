"use client";

import Link from "next/link";
import { useState } from "react";
import axios from "axios";
import { useAppSelector } from "@/src/store/hook";
import NearMeToggle from "./NearMeToggle";
import PropertiesGrid from "./PropertiesGrid";
import { useNearbyProperties } from "../hooks/useProperties";
import { PROPERTY_TYPES, PRICE_RANGES } from "../utils/filters";
import type { NearbyPropertyParams, PropertyType } from "../types";

const emptyPagination = { page: 1, limit: 9, total: 0, pages: 1 };

// The near-me flow is inherently personalized (auth cookie + saved location),
// so it stays a small client island. The default /properties list is fully
// server-rendered; this island only ships when ?near=1.
export default function NearMeSection() {
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  const [params, setParams] = useState<NearbyPropertyParams>({ page: 1, limit: 9 });

  const nearbyEnabled = isAuthenticated && !!user?.locationName;

  const nearbyQuery = useNearbyProperties(params, {
    enabled: nearbyEnabled,
    locationName: user?.locationName,
  });

  const data = nearbyQuery.data;

  const showLoginCta = !isAuthenticated;
  const showLocationCta = isAuthenticated && !user?.locationName;
  const missingLocation =
    nearbyEnabled &&
    axios.isAxiosError(nearbyQuery.error) &&
    nearbyQuery.error.response?.status === 400;

  const pagination = data?.pagination ?? emptyPagination;
  const searchedFrom =
    data && "searchedFrom" in data ? data.searchedFrom : undefined;
  const total = pagination.total;

  const headerLabel =
    total > 0 ? `${total} nearby within 10 km` : "Browse nearby rentals";

  const subText = `Showing rentals within 10 km of ${
    searchedFrom ?? user?.locationName ?? "your saved location"
  }.`;

  const handleApplyFilters = (next: NearbyPropertyParams) => {
    setParams((prev) => ({ ...prev, ...next }));
  };

  const goToPage = (page: number) => {
    if (page < 1 || page > pagination.pages) return;
    setParams((prev) => ({ ...prev, page }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <div className="text-center">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#00696b]">
          {headerLabel}
        </p>
        <h1 className="text-4xl font-bold tracking-[-0.04em] text-[#191c1d] sm:text-5xl">
          Explore Properties
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-[#44474d]">
          {subText}
        </p>
      </div>

      <div className="mt-8 flex justify-center">
        <NearMeToggle active />
      </div>

      {isAuthenticated && user?.locationName && (
        <p className="mt-3 text-center text-xs font-medium text-[#75777e]">
          {user.locationResolvedName ?? user.locationName} ·{" "}
          <Link href="/user/dashboard" className="font-bold text-[#00696b] hover:text-[#004f51]">
            Change location
          </Link>
        </p>
      )}

      <div className="mt-10">
        <NearbyFilters onApply={handleApplyFilters} />
      </div>

      <div className="mt-10">
        {showLoginCta ? (
          <div className="rounded-2xl border border-[#e1e3e4] bg-white p-10 text-center shadow-xs">
            <h2 className="text-xl font-bold tracking-tight text-[#191c1d]">
              Log in to search nearby
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#75777e]">
              Near-me search finds rentals within 10 km of your location. Log in to set one up.
            </p>
            <Link
              href="/login"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#00696b] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#004f51]"
            >
              Log in
            </Link>
          </div>
        ) : showLocationCta || missingLocation ? (
          <div className="rounded-2xl border border-[#e1e3e4] bg-white p-10 text-center shadow-xs">
            <h2 className="text-xl font-bold tracking-tight text-[#191c1d]">
              Set your location first
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#75777e]">
              Set your location before searching nearby properties — add it from your
              Dashboard to see rentals within 10 km.
            </p>
            <Link
              href="/user/dashboard"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#00696b] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#004f51]"
            >
              Set my location
            </Link>
          </div>
        ) : nearbyQuery.isPending ? (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 lg:gap-7">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="animate-pulse overflow-hidden rounded-2xl border border-[#e1e3e4] bg-white"
              >
                <div className="aspect-[1.55/1] bg-[#e7e8e9]" />
                <div className="space-y-3 p-5">
                  <div className="h-6 w-28 rounded bg-[#e7e8e9]" />
                  <div className="h-5 w-3/4 rounded bg-[#e7e8e9]" />
                  <div className="h-4 w-1/2 rounded bg-[#e7e8e9]" />
                  <div className="h-9 w-full rounded-lg bg-[#e7e8e9]" />
                </div>
              </div>
            ))}
          </div>
        ) : nearbyQuery.error ? (
          <div className="rounded-2xl border border-[#ffdad6] bg-[#fff5f4] p-8 text-center">
            <p className="text-lg font-semibold text-[#ba1a1a]">Something went wrong</p>
            <p className="mt-2 text-sm text-[#8c3a3a]">
              Could not load nearby properties. Make sure the backend is running.
            </p>
          </div>
        ) : (
          <>
            <PropertiesGrid properties={data?.items ?? []} />

            {pagination.pages > 1 && (
              <nav aria-label="Pagination" className="mt-12 flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => goToPage(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  className="inline-flex min-h-10 items-center gap-1 rounded-lg border border-[#c5c6cd] bg-white px-4 text-sm font-medium text-[#191c1d] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <span aria-hidden="true">←</span> Previous
                </button>

                <span className="px-3 text-sm font-medium text-[#44474d]">
                  Page {pagination.page} of {pagination.pages}
                </span>

                <button
                  type="button"
                  onClick={() => goToPage(pagination.page + 1)}
                  disabled={pagination.page >= pagination.pages}
                  className="inline-flex min-h-10 items-center gap-1 rounded-lg border border-[#c5c6cd] bg-white px-4 text-sm font-medium text-[#191c1d] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next <span aria-hidden="true">→</span>
                </button>
              </nav>
            )}
          </>
        )}
      </div>
    </>
  );
}

interface NearbyFiltersProps {
  onApply: (params: NearbyPropertyParams) => void;
}

function NearbyFilters({ onApply }: NearbyFiltersProps) {
  const [propertyType, setPropertyType] = useState<PropertyType | "">("");
  const [priceRange, setPriceRange] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const range = PRICE_RANGES[priceRange];
    onApply({
      page: 1,
      propertyType: propertyType || undefined,
      minPrice: range.min,
      maxPrice: range.max,
    });
  };

  const handleReset = () => {
    setPropertyType("");
    setPriceRange(0);
    onApply({ page: 1 });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-[#e1e3e4] bg-white p-3 shadow-[0_10px_28px_rgba(25,28,29,0.1)] sm:p-3.5"
    >
      <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-[1.1fr_1fr_1fr_auto]">
        <label className="flex min-h-[58px] flex-col justify-center gap-1 rounded-lg border border-[#e7e8e9] bg-[#f8f9fa] px-3.5 transition cursor-not-allowed">
          <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#75777e]">
            Location
          </span>
          <input
            value="Near me mode — city filter off"
            readOnly
            disabled
            className="w-full cursor-not-allowed bg-transparent text-sm font-medium text-[#9c9da3] outline-none"
          />
        </label>

        <label className="flex min-h-[58px] flex-col justify-center gap-1 rounded-lg border border-[#c5c6cd] px-3.5 transition focus-within:border-[#00696b] focus-within:ring-2 focus-within:ring-[#56f5f8]/45">
          <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#75777e]">
            Property type
          </span>
          <select
            value={propertyType}
            onChange={(e) => setPropertyType(e.target.value as PropertyType | "")}
            className="mt-0.5 w-full appearance-none bg-transparent text-sm font-medium text-[#191c1d] outline-none"
          >
            {PROPERTY_TYPES.map((type) => (
              <option key={type.value || "all"} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex min-h-[58px] flex-col justify-center gap-1 rounded-lg border border-[#c5c6cd] px-3.5 transition focus-within:border-[#00696b] focus-within:ring-2 focus-within:ring-[#56f5f8]/45">
          <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#75777e]">
            Rent range
          </span>
          <select
            value={priceRange}
            onChange={(e) => setPriceRange(Number(e.target.value))}
            className="mt-0.5 w-full appearance-none bg-transparent text-sm font-medium text-[#191c1d] outline-none"
          >
            {PRICE_RANGES.map((range, index) => (
              <option key={range.label} value={index}>
                {range.label}
              </option>
            ))}
          </select>
        </label>

        <div className="flex items-center gap-2">
          <button
            type="submit"
            className="flex min-h-[58px] flex-1 items-center justify-center gap-2 rounded-lg bg-[#191c1d] px-5 text-sm font-semibold text-white transition hover:bg-[#00696b] lg:flex-none"
          >
            <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="6" />
              <path strokeLinecap="round" d="m16 16 4 4" />
            </svg>
            <span className="lg:sr-only">Search</span>
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="flex min-h-[58px] items-center justify-center rounded-lg border border-[#c5c6cd] px-4 text-sm font-medium text-[#44474d] transition hover:bg-[#f3f4f5]"
            aria-label="Reset filters"
          >
            <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5M20 20v-5h-5M4.5 14.5a7 7 0 0 0 11.5 4l2-2M19.5 9.5A7 7 0 0 0 8 5.5l-2 2" />
            </svg>
          </button>
        </div>
      </div>
    </form>
  );
}