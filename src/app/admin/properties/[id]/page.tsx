"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import DashboardShell from "@/src/modules/dashboard/components/DashboardShell";
import { getAdminPropertyById } from "@/src/modules/properties";
import type { AdminProperty } from "@/src/modules/properties";

const propertyTypeLabels: Record<string, string> = {
    apartment: "Apartment",
    house: "House",
    villa: "Villa",
    studio: "Studio",
    room: "Room",
};

function formatDate(value: string) {
    return new Intl.DateTimeFormat("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(new Date(value));
}

function Detail({
    label,
    value,
}: {
    label: string;
    value: string | number | undefined;
}) {
    return (
        <div>
            <dt className="text-xs font-semibold uppercase tracking-[0.1em] text-[#75777e]">
                {label}
            </dt>
            <dd className="mt-1 text-sm text-[#191c1d]">
                {value ?? "Not provided"}
            </dd>
        </div>
    );
}

function ListingStatus({
    status,
}: {
    status: AdminProperty["status"];
}) {
    const label =
        status === "active"
            ? "Listed"
            : status === "inactive"
              ? "Unlisted"
              : "Archived";

    return (
        <span className="inline-flex rounded-full bg-[#d9f4f3] px-2.5 py-1 text-xs font-bold text-[#00696b]">
            {label}
        </span>
    );
}

function RentalStatus({
    status,
}: {
    status: AdminProperty["rentalStatus"];
}) {
    const label = status === "available" ? "Available" : "Rented";

    return (
        <span className="inline-flex rounded-full bg-[#d9f4f3] px-2.5 py-1 text-xs font-bold text-[#00696b]">
            {label}
        </span>
    );
}

export default function AdminPropertyDetailsPage() {
    const params = useParams<{ id: string }>();

    const propertyQuery = useQuery({
        queryKey: ["admin-property", params.id],
        queryFn: () => getAdminPropertyById(params.id),
        enabled: Boolean(params.id),
    });

    const property = propertyQuery.data;

    return (
        <DashboardShell role="admin">
            <main className="mx-auto max-w-[1200px] px-4 py-7 sm:px-6 sm:py-9 lg:px-10 lg:py-10">
                <Link
                    href="/admin/properties"
                    className="text-sm font-semibold text-[#00696b] hover:text-[#004f51]"
                >
                    ← Back to properties
                </Link>

                {propertyQuery.isLoading ? (
                    <p className="py-10 text-sm text-[#75777e]">
                        Loading property...
                    </p>
                ) : propertyQuery.isError || !property ? (
                    <p className="py-10 text-sm text-[#95611d]">
                        Unable to load property details.
                    </p>
                ) : (
                    <>
                        <header className="mt-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                            <div>
                                <p className="text-sm font-semibold text-[#00696b]">
                                    Property details
                                </p>

                                <h1 className="mt-2 text-3xl font-bold tracking-[-0.04em] text-[#191c1d]">
                                    {property.title}
                                </h1>

                                <p className="mt-2 text-sm text-[#44474d]">
                                    {propertyTypeLabels[property.propertyType] ??
                                        property.propertyType}{" "}
                                    · ID {property._id}
                                </p>
                            </div>

                            <ListingStatus status={property.status} />
                        </header>

                        <div className="mt-8 grid gap-6 lg:grid-cols-[1.35fr_1fr]">
                            <section className="space-y-6">
                                {property.images.length > 0 && (
                                    <div className="grid grid-cols-2 gap-3 overflow-hidden rounded-2xl">
                                        {property.images.map((image) => (
                                            <div
                                                key={
                                                    image.publicId ||
                                                    image.url
                                                }
                                                className="relative aspect-[1.4/1] overflow-hidden"
                                            >
                                                <Image
                                                    src={image.url}
                                                    alt={property.title}
                                                    fill
                                                    sizes="(max-width: 1024px) 50vw, 60vw"
                                                    className="object-cover"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="rounded-2xl border border-[#e1e3e4] bg-white p-6">
                                    <h2 className="text-lg font-bold text-[#191c1d]">
                                        Property information
                                    </h2>

                                    <dl className="mt-5 grid gap-5 sm:grid-cols-2">
                                        <Detail
                                            label="Property type"
                                            value={
                                                propertyTypeLabels[
                                                    property.propertyType
                                                ] ?? property.propertyType
                                            }
                                        />

                                        <Detail
                                            label="Bedrooms"
                                            value={property.bedrooms}
                                        />

                                        <Detail
                                            label="Bathrooms"
                                            value={property.bathrooms}
                                        />

                                        <Detail
                                            label="Area"
                                            value={
                                                property.areaSqFt
                                                    ? `${property.areaSqFt.toLocaleString(
                                                          "en-IN"
                                                      )} sq ft`
                                                    : undefined
                                            }
                                        />

                                        <Detail
                                            label="Street"
                                            value={property.address.street}
                                        />

                                        <Detail
                                            label="City"
                                            value={property.address.city}
                                        />

                                        <Detail
                                            label="State / region"
                                            value={property.address.state}
                                        />

                                        <Detail
                                            label="Country"
                                            value={property.address.country}
                                        />

                                        <Detail
                                            label="Postal code"
                                            value={property.address.zipCode}
                                        />
                                    </dl>

                                    <div className="mt-6 border-t border-[#eef0f1] pt-5">
                                        <dt className="text-xs font-semibold uppercase tracking-[0.1em] text-[#75777e]">
                                            Amenities
                                        </dt>

                                        <dd className="mt-2 flex flex-wrap gap-2">
                                            {property.amenities.length ? (
                                                property.amenities.map(
                                                    (amenity) => (
                                                        <span
                                                            key={amenity}
                                                            className="rounded-full bg-[#f3f4f5] px-3 py-1 text-xs font-medium text-[#44474d]"
                                                        >
                                                            {amenity}
                                                        </span>
                                                    )
                                                )
                                            ) : (
                                                <span className="text-sm text-[#75777e]">
                                                    Not provided
                                                </span>
                                            )}
                                        </dd>
                                    </div>

                                    <div className="mt-6 border-t border-[#eef0f1] pt-5">
                                        <dt className="text-xs font-semibold uppercase tracking-[0.1em] text-[#75777e]">
                                            Description
                                        </dt>

                                        <dd className="mt-2 text-sm leading-6 text-[#44474d]">
                                            {property.description}
                                        </dd>
                                    </div>
                                </div>
                            </section>

                            <aside className="space-y-6">
                                <section className="rounded-2xl border border-[#e1e3e4] bg-white p-6">
                                    <h2 className="text-lg font-bold text-[#191c1d]">
                                        Owner information
                                    </h2>

                                    <dl className="mt-5 space-y-4">
                                        <Detail
                                            label="Name"
                                            value={
                                                property.owner?.name ??
                                                "Unknown Owner"
                                            }
                                        />

                                        <Detail
                                            label="Email"
                                            value={
                                                property.owner?.email ??
                                                "No email"
                                            }
                                        />

                                        <Detail
                                            label="Phone"
                                            value={
                                                property.owner?.phone ??
                                                "Not provided"
                                            }
                                        />

                                        <Detail
                                            label="Owner ID"
                                            value={
                                                property.owner?._id ??
                                                "Not available"
                                            }
                                        />

                                        <Detail
                                            label="Owner verification"
                                            value={
                                                property.owner
                                                    ? property.owner
                                                          .verificationStatus ??
                                                      (property.owner
                                                          .isVerified
                                                          ? "Approved"
                                                          : "Pending email verification")
                                                    : "Owner not available"
                                            }
                                        />
                                    </dl>
                                </section>

                                <section className="rounded-2xl border border-[#e1e3e4] bg-white p-6">
                                    <h2 className="text-lg font-bold text-[#191c1d]">
                                        Property status
                                    </h2>

                                    <dl className="mt-5 space-y-4">
                                        <div>
                                            <dt className="text-xs font-semibold uppercase tracking-[0.1em] text-[#75777e]">
                                                Listing status
                                            </dt>

                                            <dd className="mt-1">
                                                <ListingStatus
                                                    status={property.status}
                                                />
                                            </dd>
                                        </div>

                                        <div>
                                            <dt className="text-xs font-semibold uppercase tracking-[0.1em] text-[#75777e]">
                                                Rental status
                                            </dt>

                                            <dd className="mt-1">
                                                <RentalStatus
                                                    status={
                                                        property.rentalStatus
                                                    }
                                                />
                                            </dd>
                                        </div>

                                        <Detail
                                            label="Monthly price"
                                            value={
                                                property.price != null
                                                    ? `₹${property.price.toLocaleString(
                                                          "en-IN"
                                                      )}`
                                                    : "N/A"
                                            }
                                        />
                                    </dl>
                                </section>

                                <section className="rounded-2xl border border-[#e1e3e4] bg-white p-6">
                                    <h2 className="text-lg font-bold text-[#191c1d]">
                                        Dates
                                    </h2>

                                    <dl className="mt-5 space-y-4">
                                        <Detail
                                            label="Created"
                                            value={formatDate(
                                                property.created_at
                                            )}
                                        />

                                        <Detail
                                            label="Updated"
                                            value={formatDate(
                                                property.updated_at
                                            )}
                                        />
                                    </dl>
                                </section>
                            </aside>
                        </div>
                    </>
                )}
            </main>
        </DashboardShell>
    );
}