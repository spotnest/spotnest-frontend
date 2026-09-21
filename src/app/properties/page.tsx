"use client";

import { useEffect, useState } from "react";
import Navbar from "@/src/components/layout/Navbar";
import Footer from "@/src/modules/landing/components/Footer";
import {
  getProperties,
  PropertyFilters,
  PropertiesGrid,
} from "@/src/modules/properties";
import type { Property, PropertyListParams } from "@/src/modules/properties";

export default function PropertiesPage() {
  const [params, setParams] = useState<PropertyListParams>({ page: 1, limit: 9 });
  const [properties, setProperties] = useState<Property[]>([]);
  const [pagination, setPagination] = useState<{
    page: number;
    limit: number;
    total: number;
    pages: number;
  }>({ page: 1, limit: 9, total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getProperties(params)
      .then((result) => {
        if (cancelled) return;
        setProperties(result.items);
        setPagination(result.pagination);
        setError(null);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("Failed to load properties:", err);
        setError("Could not load properties. Make sure the backend is running.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [params]);

  const handleApplyFilters = (next: PropertyListParams) => {
    setLoading(true);
    setError(null);
    setParams((prev) => ({ ...prev, ...next }));
  };

  const goToPage = (page: number) => {
    if (page < 1 || page > pagination.pages) return;
    setLoading(true);
    setError(null);
    setParams((prev) => ({ ...prev, page }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <Navbar />
      <main className="bg-[#f8f9fa] px-4 pb-20 pt-10 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-[1280px]">
          <div className="text-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#00696b]">
              {pagination.total > 0 ? `${pagination.total} properties available` : "Browse rentals"}
            </p>
            <h1 className="text-4xl font-bold tracking-[-0.04em] text-[#191c1d] sm:text-5xl">
              Explore Properties
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-[#44474d]">
              Discover rental homes that fit your lifestyle — search by location, type, and budget.
            </p>
          </div>

          <div className="mt-10">
            <PropertyFilters onApply={handleApplyFilters} />
          </div>

          <div className="mt-10">
            <PropertiesGrid properties={properties} loading={loading} error={error} />
          </div>

          {!loading && !error && pagination.pages > 1 && (
            <nav aria-label="Pagination" className="mt-12 flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => goToPage(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="inline-flex min-h-10 items-center gap-1 rounded-lg border border-[#c5c6cd] px-4 text-sm font-medium text-[#191c1d] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
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
                className="inline-flex min-h-10 items-center gap-1 rounded-lg border border-[#c5c6cd] px-4 text-sm font-medium text-[#191c1d] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next <span aria-hidden="true">→</span>
              </button>
            </nav>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}