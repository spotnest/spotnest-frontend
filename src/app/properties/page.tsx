import PropertyGrid from "@/src/modules/properties/components/PropertyGrid";
import { getProperties } from "@/src/modules/properties/services/propertyServer";
import type { Property } from "@/src/modules/properties/types/property";

export const dynamic = "force-dynamic";

export default async function PropertiesPage() {
  let items: Property[] = [];

  try {
    const result = await getProperties({
      page: 1,
      limit: 12,
    });
    items = result.items;
  } catch (error) {
    console.error("Failed to load properties at build/request time:", error);
  }

  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          Properties
        </h1>

        <p className="mt-2 text-gray-500">
          Find a property that fits your needs.
        </p>
      </div>

      <PropertyGrid properties={items} />
    </main>
  );
}