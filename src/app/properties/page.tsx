import PropertyGrid from "@/src/modules/properties/components/PropertyGrid";
import { getProperties } from "@/src/modules/properties/services/propertyServer";

export default async function PropertiesPage() {
  const result = await getProperties({
    page: 1,
    limit: 12,
  });

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

      <PropertyGrid properties={result.items} />
    </main>
  );
}