import Link from "next/link";
import type { Property } from "../types/property";

interface PropertyCardProps {
  property: Property;
}

export default function PropertyCard({
  property,
}: PropertyCardProps) {
  const image = property.images?.[0]?.url;

  return (
    <article className="overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:shadow-md">
      <div className="aspect-[4/3] overflow-hidden bg-gray-100">
        {image ? (
          <img
            src={image}
            alt={property.title}
            className="h-full w-full object-cover transition duration-300 hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-gray-500">
            No image available
          </div>
        )}
      </div>

      <div className="p-5">
        <div className="mb-2 flex items-start justify-between gap-3">
          <h2 className="line-clamp-2 text-lg font-semibold">
            {property.title}
          </h2>

          <span className="shrink-0 rounded-full bg-gray-100 px-3 py-1 text-xs capitalize">
            {property.propertyType}
          </span>
        </div>

        <p className="text-sm text-gray-500">
          {property.address.city}, {property.address.state}
        </p>

        <p className="mt-3 text-xl font-bold">
          ₹{property.price.toLocaleString("en-IN")}
        </p>

        <div className="mt-3 flex gap-4 text-sm text-gray-600">
          <span>{property.bedrooms} beds</span>
          <span>{property.bathrooms} baths</span>

          {property.areaSqFt && (
            <span>{property.areaSqFt} sq ft</span>
          )}
        </div>

        <Link
          href={`/properties/${property._id}`}
          className="mt-5 block rounded-xl bg-black px-4 py-3 text-center text-sm font-medium text-white transition hover:opacity-90"
        >
          View details
        </Link>
      </div>
    </article>
  );
}