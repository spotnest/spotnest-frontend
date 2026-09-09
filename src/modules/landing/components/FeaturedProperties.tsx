import Link from "next/link";

const propertyImages = [
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=85",
  "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=85",
  "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=85",
];

const propertyDetails = [
  ["2 Beds", "2 Baths", "1,050 sq ft"],
  ["3 Beds", "2 Baths", "1,600 sq ft"],
  ["1 Bed", "1 Bath", "700 sq ft"],
];

const properties = [
  {
    id: 1,
    title: "Modern 2BHK Apartment",
    location: "Kochi, Kerala",
    rent: "₹18,000/month",
  },
  {
    id: 2,
    title: "Spacious Family Home",
    location: "Calicut, Kerala",
    rent: "₹22,000/month",
  },
  {
    id: 3,
    title: "Cozy 1BHK Apartment",
    location: "Thrissur, Kerala",
    rent: "₹12,000/month",
  },
];

export default function FeaturedProperties() {
  return (
    <section className="px-4 py-20 sm:px-6 lg:px-10 lg:py-24">
      <div className="mx-auto max-w-[1280px]">
        <div className="mb-9 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#00696b]">
              Available now
            </p>
            <h2 className="text-3xl font-bold tracking-[-0.035em] text-[#191c1d] sm:text-[32px]">
              Featured Properties
            </h2>
            <p className="mt-2 text-base text-[#44474d]">
              Explore some of the properties available on SpotNest.
            </p>
          </div>
          <Link href="/properties" className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-[#00696b] transition hover:text-[#004f51]">
            View all properties <span aria-hidden="true">→</span>
          </Link>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 lg:gap-7">
          {properties.map((property, index) => (
            <article
              key={property.id}
              className="group flex overflow-hidden rounded-2xl border border-[#e1e3e4] bg-white shadow-[0_4px_20px_rgba(0,0,0,0.05)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(10,25,47,0.1)]"
            >
              <div className="flex w-full flex-col">
                <div className="relative aspect-[1.55/1] overflow-hidden bg-[#e7e8e9]">
                  <img
                    src={propertyImages[index]}
                    alt={`${property.title} in ${property.location}`}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                  {property.id === 1 && (
                    <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-bold text-[#191c1d] shadow-sm backdrop-blur">
                      New listing
                    </span>
                  )}
                  <button type="button" aria-label={`Save ${property.title}`} className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/95 text-[#44474d] shadow-sm backdrop-blur transition hover:bg-white hover:text-[#00696b]">
                    <svg aria-hidden="true" className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78Z" />
                    </svg>
                  </button>
                </div>

                <div className="flex flex-1 flex-col p-5">
                  <p className="text-xl font-bold tracking-[-0.025em] text-[#191c1d]">
                    {property.rent}
                  </p>
                  <h3 className="mt-2 text-lg font-semibold text-[#191c1d]">{property.title}</h3>
                  <p className="mt-2 flex items-center gap-1.5 text-sm text-[#44474d]">
                    <svg aria-hidden="true" className="h-4 w-4 shrink-0 text-[#00696b]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 10c0 5.25-7 10-7 10S5 15.25 5 10a7 7 0 1 1 14 0Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.5 10a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Z" />
                    </svg>
                    {property.location}
                  </p>
                  <div className="mt-5 flex flex-wrap gap-x-3 gap-y-1 border-t border-[#e7e8e9] pt-4 text-xs font-medium text-[#44474d]">
                    {propertyDetails[index].map((detail) => (
                      <span key={detail} className="inline-flex items-center gap-1.5">
                        <span aria-hidden="true" className="h-1 w-1 rounded-full bg-[#00696b]" />
                        {detail}
                      </span>
                    ))}
                  </div>
                  <button type="button" className="mt-5 w-full rounded-lg border border-[#191c1d] px-4 py-2.5 text-sm font-semibold text-[#191c1d] transition hover:bg-[#191c1d] hover:text-white">
                    View details
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
