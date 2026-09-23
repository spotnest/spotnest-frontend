import Navbar from "@/src/components/layout/Navbar";
import Footer from "@/src/modules/landing/components/Footer";
import NearMeSection from "@/src/modules/properties/components/NearMeSection";
import NearMeToggle from "@/src/modules/properties/components/NearMeToggle";
import PaginationLinks from "@/src/modules/properties/components/PaginationLinks";
import PropertiesGrid from "@/src/modules/properties/components/PropertiesGrid";
import PropertyFilters from "@/src/modules/properties/components/PropertyFilters";
import PropertyListHeader from "@/src/modules/properties/components/PropertyListHeader";
import { getProperties } from "@/src/modules/properties";
import { parsePropertySearchParams, toApiParams } from "@/src/modules/properties/utils/filters";

export const revalidate = 300;

type PropertySearchParams = Record<string, string | string[] | undefined>;

const toSingle = (value: string | string[] | undefined): string | undefined =>
  typeof value === "string" ? value : undefined;

export default async function PropertiesPage({
  searchParams,
}: {
  searchParams: Promise<PropertySearchParams>;
}) {
  const sp = await searchParams;
  const near = toSingle(sp.near) === "1";

  // The near-me flow depends on the signed-in user's saved location (auth
  // cookie + Redux), so it's isolated to a client island that only ships with
  // ?near=1. The default view below is 100% server-rendered.
  if (near) {
    return (
      <>
        <Navbar />
        <main className="bg-[#f8f9fa] px-4 pb-20 pt-10 sm:px-6 lg:px-10">
          <div className="mx-auto max-w-[1280px]">
            <NearMeSection />
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const params = parsePropertySearchParams(sp);
  const data = await getProperties(toApiParams(params));

  return (
    <>
      <Navbar />
      <main className="bg-[#f8f9fa] px-4 pb-20 pt-10 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-[1280px]">
          <PropertyListHeader total={data.pagination.total} />

          <div className="mt-8 flex justify-center">
            <NearMeToggle />
          </div>

          <div className="mt-10">
            <PropertyFilters
              city={params.city}
              propertyType={params.propertyType}
              budget={params.budget}
            />
          </div>

          <div className="mt-10">
            <PropertiesGrid properties={data.items} />
            {data.pagination.pages > 1 && (
              <PaginationLinks
                params={params}
                page={data.pagination.page}
                pages={data.pagination.pages}
              />
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}