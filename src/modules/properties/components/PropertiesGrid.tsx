import PropertyCard from "./PropertyCard";
import type { PropertySummary } from "../types";

interface PropertiesGridProps {
  properties: PropertySummary[];
}

export default function PropertiesGrid({ properties }: PropertiesGridProps) {
  if (properties.length === 0) {
    return (
      <div className="rounded-2xl border border-[#e1e3e4] bg-white p-12 text-center">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#eef6f5]">
          <svg aria-hidden="true" className="h-7 w-7 text-[#00696b]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 10c0 5.25-7 10-7 10S5 15.25 5 10a7 7 0 1 1 14 0Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.5 10a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Z" />
          </svg>
        </div>
        <p className="mt-4 text-lg font-semibold text-[#191c1d]">No properties found</p>
        <p className="mt-2 text-sm text-[#75777e]">
          Try adjusting your filters or check back later.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 lg:gap-7">
      {properties.map((property, index) => (
        <PropertyCard key={property._id} property={property} imagePriority={index < 3} />
      ))}
    </div>
  );
}