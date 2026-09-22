import Link from "next/link";
import { notFound } from "next/navigation";
import { getProperty } from "@/src/modules/properties/services/propertyServer";

interface PropertyDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: PropertyDetailPageProps) {
  const { id } = await params;
  try {
    const property = await getProperty(id);
    return {
      title: `${property.title} | SpotNest`,
      description: property.description,
    };
  } catch {
    return {
      title: "Property Details | SpotNest",
    };
  }
}

export default async function PropertyDetailPage({
  params,
}: PropertyDetailPageProps) {
  const { id } = await params;

  let property;
  try {
    property = await getProperty(id);
  } catch {
    notFound();
  }

  const primaryImage = property.images?.[0]?.url;
  const additionalImages = property.images?.slice(1) || [];

  return (
    <main className="min-h-screen bg-[#f8f9fa] py-8 text-[#191c1d]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-sm text-[#75777e]">
          <Link href="/properties" className="transition hover:text-[#00696b]">
            Properties
          </Link>
          <span>/</span>
          <span className="font-medium text-[#191c1d] truncate max-w-[300px]">
            {property.title}
          </span>
        </nav>

        {/* Top Title Bar */}
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <div className="mb-2 flex items-center gap-3">
              <span className="rounded-full bg-[#d9f4f3] px-3.5 py-1 text-xs font-bold capitalize text-[#00696b]">
                {property.propertyType}
              </span>
              <span
                className={`rounded-full px-3.5 py-1 text-xs font-bold capitalize ${
                  property.status === "active"
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {property.status}
              </span>
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-[#191c1d] sm:text-4xl">
              {property.title}
            </h1>

            <p className="mt-2 text-base text-[#44474d]">
              {[property.address.street, property.address.city, property.address.state, property.address.country]
                .filter(Boolean)
                .join(", ")}
            </p>
          </div>

          <div className="shrink-0 text-left md:text-right">
            <p className="text-sm font-semibold uppercase tracking-wider text-[#75777e]">
              Rent Price
            </p>
            <p className="text-3xl font-extrabold text-[#00696b]">
              ₹{property.price.toLocaleString("en-IN")}
              <span className="text-base font-normal text-[#75777e]">/mo</span>
            </p>
          </div>
        </div>

        {/* Gallery */}
        <section className="mb-10 overflow-hidden rounded-2xl border border-[#e1e3e4] bg-white shadow-xs">
          {primaryImage ? (
            <div className="grid gap-2 md:grid-cols-3">
              <div className="aspect-[4/3] md:col-span-2 overflow-hidden bg-gray-100">
                <img
                  src={primaryImage}
                  alt={property.title}
                  className="h-full w-full object-cover"
                />
              </div>

              {additionalImages.length > 0 ? (
                <div className="grid grid-cols-2 gap-2 md:grid-cols-1">
                  {additionalImages.slice(0, 2).map((img, idx) => (
                    <div
                      key={img.publicId || idx}
                      className="aspect-[4/3] overflow-hidden bg-gray-100"
                    >
                      <img
                        src={img.url}
                        alt={`${property.title} - image ${idx + 2}`}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          ) : (
            <div className="flex aspect-[21/9] items-center justify-center bg-gray-100 text-gray-400">
              No image available
            </div>
          )}
        </section>

        {/* Content Layout */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Details */}
          <div className="space-y-8 lg:col-span-2">
            {/* Quick Specs */}
            <div className="grid grid-cols-3 gap-4 rounded-2xl border border-[#e1e3e4] bg-white p-6 shadow-xs">
              <div className="text-center">
                <p className="text-xs font-semibold uppercase text-[#75777e]">Bedrooms</p>
                <p className="mt-1 text-2xl font-bold text-[#191c1d]">{property.bedrooms}</p>
              </div>
              <div className="border-x border-[#e1e3e4] text-center">
                <p className="text-xs font-semibold uppercase text-[#75777e]">Bathrooms</p>
                <p className="mt-1 text-2xl font-bold text-[#191c1d]">{property.bathrooms}</p>
              </div>
              <div className="text-center">
                <p className="text-xs font-semibold uppercase text-[#75777e]">Area</p>
                <p className="mt-1 text-2xl font-bold text-[#191c1d]">
                  {property.areaSqFt ? `${property.areaSqFt} sq ft` : "N/A"}
                </p>
              </div>
            </div>

            {/* Description */}
            <div className="rounded-2xl border border-[#e1e3e4] bg-white p-6 sm:p-8 shadow-xs">
              <h2 className="text-xl font-bold text-[#191c1d]">Description</h2>
              <p className="mt-4 whitespace-pre-line leading-relaxed text-[#44474d]">
                {property.description || "No description provided."}
              </p>
            </div>

            {/* Amenities */}
            {property.amenities && property.amenities.length > 0 && (
              <div className="rounded-2xl border border-[#e1e3e4] bg-white p-6 sm:p-8 shadow-xs">
                <h2 className="text-xl font-bold text-[#191c1d]">Amenities</h2>
                <div className="mt-4 flex flex-wrap gap-2.5">
                  {property.amenities.map((amenity, idx) => (
                    <span
                      key={idx}
                      className="rounded-xl bg-[#eef6f5] px-4 py-2 text-sm font-semibold text-[#00696b]"
                    >
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar CTA */}
          <div>
            <div className="sticky top-24 space-y-6 rounded-2xl border border-[#e1e3e4] bg-white p-6 sm:p-8 shadow-xs">
              <h3 className="text-lg font-bold text-[#191c1d]">Interested in this property?</h3>
              <p className="text-sm text-[#44474d]">
                Submit a viewing or rental request directly to the property owner.
              </p>

              <div className="border-t border-[#e1e3e4] pt-4">
                <p className="text-xs font-semibold uppercase text-[#75777e]">Monthly Rent</p>
                <p className="mt-1 text-2xl font-bold text-[#00696b]">
                  ₹{property.price.toLocaleString("en-IN")}
                </p>
              </div>

              <Link
                href={`/bookings?propertyId=${property._id}`}
                className="block w-full rounded-xl bg-[#00696b] px-5 py-3.5 text-center text-sm font-semibold text-white transition hover:bg-[#004f51] shadow-xs"
              >
                Request Booking
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}