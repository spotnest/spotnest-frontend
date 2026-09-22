import { cache } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/src/components/layout/Navbar";
import Footer from "@/src/modules/landing/components/Footer";
import PropertyGallery from "@/src/modules/properties/components/PropertyGallery";
import { getPropertyById } from "@/src/modules/properties";
import { formatPrice, propertyTypeLabels } from "@/src/modules/properties/utils/format";
import type { Property } from "@/src/modules/properties";

export const revalidate = 300;

// React.cache dedupes the fetch between generateMetadata and the page render.
const getProperty = cache((id: string) => getPropertyById(id));

export async function generateMetadata({
    params,
}: {
    params: Promise<{ id: string }>;
}): Promise<Metadata> {
    const { id } = await params;
    const property = await getProperty(id).catch(() => null);
    if (!property) return { title: "Property not found | SpotNest" };

    const title = `${property.title} | SpotNest`;
    const description =
        property.description?.slice(0, 160) ??
        `Rent this ${propertyTypeLabels[property.propertyType] ?? property.propertyType} in ${property.address.city}, ${property.address.state}.`;

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            type: "website",
            images: property.images[0]?.url ? [property.images[0].url] : [],
        },
    };
}

export default async function PropertyDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const property: Property | null = await getProperty(id).catch(() => null);
    if (!property) notFound();

    const details = [
        { label: "Property type", value: property.propertyType },
        { label: "Bedrooms", value: String(property.bedrooms) },
        { label: "Bathrooms", value: String(property.bathrooms) },
        ...(property.areaSqFt !== undefined
            ? [{ label: "Area", value: `${property.areaSqFt.toLocaleString("en-IN")} sq ft` }]
            : []),
        { label: "Location", value: property.address.city },
    ];

    return (
        <>
            <Navbar />
            <main className="bg-[#f8f9fa] px-4 py-10 sm:px-6 lg:px-10">
                <div className="mx-auto max-w-[1280px]">
                    <Link
                        href="/properties"
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-[#00696b] transition hover:text-[#004f51]"
                    >
                        <span aria-hidden="true">←</span> Back to properties
                    </Link>

                    <p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-[#00696b]">
                        {propertyTypeLabels[property.propertyType] ?? property.propertyType}
                    </p>
                    <h1 className="mt-2 text-3xl font-bold tracking-[-0.035em] text-[#191c1d] sm:text-4xl">
                        {property.title}
                    </h1>

                    <p className="mt-3 flex items-center gap-1.5 text-base text-[#44474d]">
                        <svg aria-hidden="true" className="h-5 w-5 shrink-0 text-[#00696b]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 10c0 5.25-7 10-7 10S5 15.25 5 10a7 7 0 1 1 14 0Z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.5 10a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Z" />
                        </svg>
                        {property.address.street}, {property.address.city}, {property.address.state} {property.address.zipCode}, {property.address.country}
                    </p>

                    <div className="mt-10 grid gap-8 lg:grid-cols-[1.5fr_1fr]">
                        <div>
                            <PropertyGallery property={property} />

                            <div className="mt-10 rounded-2xl border border-[#e1e3e4] bg-white p-6 sm:p-8">
                                <h2 className="text-xl font-semibold tracking-[-0.02em] text-[#191c1d]">
                                    About this property
                                </h2>
                                <p className="mt-4 leading-7 text-[#44474d]">
                                    {property.description}
                                </p>
                            </div>

                            {property.amenities.length > 0 && (
                                <div className="mt-6 rounded-2xl border border-[#e1e3e4] bg-white p-6 sm:p-8">
                                    <h2 className="text-xl font-semibold tracking-[-0.02em] text-[#191c1d]">
                                        Amenities
                                    </h2>
                                    <div className="mt-4 flex flex-wrap gap-2">
                                        {property.amenities.map((amenity) => (
                                            <span
                                                key={amenity}
                                                className="inline-flex items-center gap-1.5 rounded-full border border-[#c5c6cd] bg-[#f8f9fa] px-3.5 py-1.5 text-sm font-medium text-[#191c1d]"
                                            >
                                                <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-[#00696b]" />
                                                {amenity}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <aside className="lg:sticky lg:top-8 lg:self-start">
                            <div className="rounded-2xl border border-[#e1e3e4] bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.05)] sm:p-8">
                                <p className="text-3xl font-bold tracking-[-0.03em] text-[#191c1d]">
                                    {formatPrice(property.price)}
                                </p>
                                <p className="mt-1 text-sm text-[#75777e]">Rent per month</p>

                                <div className="mt-6 space-y-3 border-t border-[#e7e8e9] pt-6">
                                    {details.map((detail) => (
                                        <div key={detail.label} className="flex items-center justify-between text-sm">
                                            <span className="text-[#75777e]">{detail.label}</span>
                                            <span className="font-medium capitalize text-[#191c1d]">{detail.value}</span>
                                        </div>
                                    ))}
                                </div>

                                <button
                                    type="button"
                                    className="mt-6 w-full rounded-lg bg-[#00696b] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#004f51]"
                                >
                                    Request to Rent
                                </button>

                                <button
                                    type="button"
                                    className="mt-3 w-full rounded-lg border border-[#191c1d] px-4 py-3 text-sm font-semibold text-[#191c1d] transition hover:bg-[#191c1d] hover:text-white"
                                >
                                    Save Property
                                </button>
                            </div>
                        </aside>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}