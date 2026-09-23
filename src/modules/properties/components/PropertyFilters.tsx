import Link from "next/link";
import { PROPERTY_TYPES, PRICE_RANGES } from "../utils/filters";

interface PropertyFiltersProps {
  city?: string;
  propertyType?: string;
  budget?: number;
}

export default function PropertyFilters({
  city,
  propertyType,
  budget,
}: PropertyFiltersProps) {
  return (
    <form
      method="get"
      action="/properties"
      className="rounded-2xl border border-[#e1e3e4] bg-white p-3 shadow-[0_10px_28px_rgba(25,28,29,0.1)] sm:p-3.5"
    >
      <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-[1.1fr_1fr_1fr_auto]">
        <label className="flex min-h-[58px] flex-col justify-center gap-1 rounded-lg border border-[#c5c6cd] px-3.5 transition focus-within:border-[#00696b] focus-within:ring-2 focus-within:ring-[#56f5f8]/45">
          <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#75777e]">
            Location
          </span>
          <input
            name="city"
            defaultValue={city}
            placeholder="City, e.g. Kochi"
            className="w-full bg-transparent text-sm font-medium text-[#191c1d] outline-none placeholder:text-[#75777e]"
          />
        </label>

        <label className="flex min-h-[58px] flex-col justify-center gap-1 rounded-lg border border-[#c5c6cd] px-3.5 transition focus-within:border-[#00696b] focus-within:ring-2 focus-within:ring-[#56f5f8]/45">
          <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#75777e]">
            Property type
          </span>
          <select
            name="type"
            defaultValue={propertyType ?? ""}
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
            name="budget"
            defaultValue={budget ?? 0}
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
          <Link
            href="/properties"
            className="flex min-h-[58px] items-center justify-center rounded-lg border border-[#c5c6cd] px-4 text-sm font-medium text-[#44474d] transition hover:bg-[#f3f4f5]"
            aria-label="Reset filters"
          >
            <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5M20 20v-5h-5M4.5 14.5a7 7 0 0 0 11.5 4l2-2M19.5 9.5A7 7 0 0 0 8 5.5l-2 2" />
            </svg>
          </Link>
        </div>
      </div>
    </form>
  );
}