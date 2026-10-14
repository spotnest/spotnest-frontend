import { cache } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";

import Navbar from "@/src/components/layout/Navbar";
import Footer from "@/src/modules/landing/components/Footer";
import PropertyGallery from "@/src/modules/properties/components/PropertyGallery";
import { getPropertyById } from "@/src/modules/properties";
import {
    formatPrice,
    propertyTypeLabels,
} from "@/src/modules/properties/utils/format";
import type { Property } from "@/src/modules/properties";
import PropertySidebarActions from "@/src/modules/properties/components/PropertySidebarActions";

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

    if (!property) {
        return {
            title: "Property not found | SpotNest",
        };
    }

    const title = `${property.title} | SpotNest`;

    const description =
        property.description?.slice(0, 160) ??
        `Rent this ${propertyTypeLabels[property.propertyType] ??
        property.propertyType
        } in ${property.address.city}, ${property.address.state}.`;

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            type: "website",
            images: property.images[0]?.url
                ? [property.images[0].url]
                : [],
        },
    };
}

export default async function PropertyDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    const property: Property | null = await getProperty(id).catch(
        () => null
    );

    if (!property) {
        notFound();
    }

    const details = [
        {
            label: "Property type",
            value: property.propertyType,
        },
        {
            label: "Bedrooms",
            value: String(property.bedrooms),
        },
        {
            label: "Bathrooms",
            value: String(property.bathrooms),
        },
        ...(property.areaSqFt !== undefined
            ? [
                {
                    label: "Area",
                    value: `${property.areaSqFt.toLocaleString(
                        "en-IN"
                    )} sq ft`,
                },
            ]
            : []),
        {
            label: "Location",
            value: property.address.city,
        },
    ];

    const ownerObj = typeof property.owner === "object" && property.owner !== null ? (property.owner as { _id?: string; name?: string; email?: string; phone?: string }) : null;
    const ownerId = ownerObj?._id?.toString() ?? property.ownerInfo?.id ?? String(property.owner ?? "");
    const ownerName = ownerObj?.name || property.ownerInfo?.name;
    const ownerEmail = ownerObj?.email;
    const ownerPhone = ownerObj?.phone;

    return (
        <>
            <Navbar />

            <main className="bg-[#f8f9fa] px-4 py-10 sm:px-6 lg:px-10">
                <div className="mx-auto max-w-[1280px]">
                    <Link
                        href="/properties"
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-[#00696b] transition hover:text-[#004f51]"
                    >
                        <span aria-hidden="true">←</span>
                        Back to properties
                    </Link>

                    <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
                        <div>
                            <PropertyGallery property={property} />

                            <section className="mt-8 rounded-2xl border border-[#e1e3e4] bg-white p-6">
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                    <div>
                                        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#00696b]">
                                            {propertyTypeLabels[
                                                property.propertyType
                                            ] ?? property.propertyType}
                                        </p>

                                        <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#191c1d]">
                                            {property.title}
                                        </h1>

                                        <p className="mt-2 text-sm text-[#75777e]">
                                            {property.address.city},{" "}
                                            {property.address.state}
                                        </p>
                                    </div>

                                    <p className="text-2xl font-bold text-[#191c1d]">
                                        {formatPrice(property.price)}
                                    </p>
                                </div>

                                {property.description && (
                                    <div className="mt-8">
                                        <h2 className="text-lg font-bold text-[#191c1d]">
                                            Description
                                        </h2>

                                        <p className="mt-3 whitespace-pre-line text-sm leading-7 text-[#44474d]">
                                            {property.description}
                                        </p>
                                    </div>
                                )}

                                <div className="mt-8">
                                    <h2 className="text-lg font-bold text-[#191c1d]">
                                        Property details
                                    </h2>

                                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                        {details.map((detail) => (
                                            <div
                                                key={detail.label}
                                                className="rounded-xl border border-[#e1e3e4] bg-[#fafafa] p-4"
                                            >
                                                <p className="text-xs font-semibold uppercase tracking-wide text-[#75777e]">
                                                    {detail.label}
                                                </p>

                                                <p className="mt-1 text-sm font-semibold text-[#191c1d]">
                                                    {detail.value}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </section>
                        </div>

                        <PropertySidebarActions
                            propertyId={property._id}
                            propertyTitle={property.title}
                            propertyPrice={property.price}
                            advanceAmount={property.advanceAmount ?? property.price}
                            isOccupied={property.isOccupied}
                            occupiedUntil={property.occupiedUntil}
                            ownerId={ownerId}
                            ownerName={ownerName}
                            ownerEmail={ownerEmail}
                            ownerPhone={ownerPhone}
                            propertyStatus={property.status}
                        />
                    </div>
                </div>
            </main>

            <Footer />
        </>
    );
}