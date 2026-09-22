import Link from "next/link";
import Image from "next/image";
import { formatPrice, propertyTypeLabels } from "../utils/format";
import type { PropertySummary } from "../types";

interface PropertyCardProps {
    property: PropertySummary;
    // Above-the-fold cards load eagerly so the first rendered row paints fast.
    imagePriority?: boolean;
}

export default function PropertyCard({ property, imagePriority = false }: PropertyCardProps) {
  const image = property.images[0]?.url;
  const area = property.areaSqFt ? `${property.areaSqFt.toLocaleString("en-IN")} sq ft` : null;

  return (
    <article className="group flex overflow-hidden rounded-2xl border border-[#e1e3e4] bg-white shadow-[0_4px_20px_rgba(0,0,0,0.05)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(10,25,47,0.1)]">
      <div className="flex w-full flex-col">
        <Link href={`/properties/${property._id}`} className="relative block aspect-[1.55/1] overflow-hidden bg-[#e7e8e9]">
          {image ? (
            <Image
              src={image}
              alt={`${property.title} in ${property.address.city}`}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
              loading={imagePriority ? "eager" : "lazy"}
              className="object-cover transition duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm text-[#75777e]">
              No image
            </div>
          )}
          <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-[#191c1d] shadow-sm backdrop-blur">
            {propertyTypeLabels[property.propertyType] ?? property.propertyType}
          </span>
          {property.distanceKm !== undefined && (
            <span className="absolute right-3 top-3 rounded-full bg-[#00696b]/95 px-2.5 py-1 text-[11px] font-semibold text-white shadow-sm backdrop-blur">
              {property.distanceKm.toFixed(1)} km away
            </span>
          )}
        </Link>

        <div className="flex flex-1 flex-col p-5">
          <p className="text-xl font-bold tracking-[-0.025em] text-[#191c1d]">
            {formatPrice(property.price)}
          </p>
          <h3 className="mt-2 text-lg font-semibold text-[#191c1d]">
            <Link
              href={`/properties/${property._id}`}
              className="transition hover:text-[#00696b]"
            >
              {property.title}
            </Link>
          </h3>

          <p className="mt-2 flex items-center gap-1.5 text-sm text-[#44474d]">
            <svg aria-hidden="true" className="h-4 w-4 shrink-0 text-[#00696b]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 10c0 5.25-7 10-7 10S5 15.25 5 10a7 7 0 1 1 14 0Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.5 10a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Z" />
            </svg>
            {property.address.city}, {property.address.state}
          </p>

          <div className="mt-5 flex flex-wrap gap-x-3 gap-y-1 border-t border-[#e7e8e9] pt-4 text-xs font-medium text-[#44474d]">
            {property.bedrooms > 0 && (
              <span className="inline-flex items-center gap-1.5">
                <span aria-hidden="true" className="h-1 w-1 rounded-full bg-[#00696b]" />
                {property.bedrooms} {property.bedrooms === 1 ? "Bed" : "Beds"}
              </span>
            )}
            {property.bathrooms > 0 && (
              <span className="inline-flex items-center gap-1.5">
                <span aria-hidden="true" className="h-1 w-1 rounded-full bg-[#00696b]" />
                {property.bathrooms} {property.bathrooms === 1 ? "Bath" : "Baths"}
              </span>
            )}
            {area && (
              <span className="inline-flex items-center gap-1.5">
                <span aria-hidden="true" className="h-1 w-1 rounded-full bg-[#00696b]" />
                {area}
              </span>
            )}
          </div>

          <Link
            href={`/properties/${property._id}`}
            className="mt-5 w-full rounded-lg border border-[#191c1d] px-4 py-2.5 text-center text-sm font-semibold text-[#191c1d] transition hover:bg-[#191c1d] hover:text-white"
          >
            View details
          </Link>
        </div>
      </div>
    </article>
  );
}