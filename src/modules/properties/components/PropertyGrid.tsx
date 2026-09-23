import type { Property } from "../types/property";
import PropertyCard from "./PropertyCard";

interface PropertyGridProps {
  properties: Property[];
}

export default function PropertyGrid({
  properties,
}: PropertyGridProps) {
  if (properties.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed p-12 text-center">
        <h2 className="text-lg font-semibold">
          No properties found
        </h2>

        <p className="mt-2 text-sm text-gray-500">
          Try adjusting your search filters.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {properties.map((property) => (
        <PropertyCard
          key={property._id}
          property={property}
        />
      ))}
    </div>
  );
}