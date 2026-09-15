"use client";

import { useEffect, useState } from "react";
import { notFound, useParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/src/components/layout/Navbar";
import Footer from "@/src/modules/landing/components/Footer";
import { getPropertyById } from "@/src/modules/properties";
import type { Property } from "@/src/modules/properties";

const propertyTypeLabels: Record<string, string> = {
  apartment: "Apartment",
  house: "House",
  villa: "Villa",
  studio: "Studio",
  room: "Room",
};

const formatPrice = (price: number) => {
  return `₹${price.toLocaleString("en-IN")}/month`;
};

export default function PropertyDetailPage() {
  const params = useParams<{ id: string }>();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    const id = params?.id;
    if (!id) return;

    let cancelled = false;
    getPropertyById(id)
      .then((result) => {
        if (cancelled) return;
        setProperty(result);
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setError(true);
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [params]);

  if (!params?.id) notFound();

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="mx-auto max-w-[1280px] animate-pulse px-4 py-10 sm:px-6 lg:px-10">
          <div className="h-10 w-72 rounded bg-[#e7e8e9]" />
          <div className="mt-10 grid gap-8 lg:grid-cols-2">
            <div className="aspect-[1.2/1] rounded-2xl bg-[#e7e8e9]" />
            <div className="space-y-4">
              <div className="h-8 w-48 rounded bg-[#e7e8e9]" />
              <div className="h-6 w-64 rounded bg-[#e7e8e9]" />
              <div className="h-4 w-40 rounded bg-[#e7e8e9]" />
              <div className="h-24 w-full rounded bg-[#e7e8e9]" />
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (error || !property) {
    notFound();
  }

  const images = property.images;
  const image = images[activeImage]?.url ?? images[0]?.url;

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
              {image && (
                <div className="overflow-hidden rounded-2xl bg-[#e7e8e9]">
                  <img
                    src={image}
                    alt={property.title}
                    className="aspect-[1.2/1] w-full object-cover"
                  />
                </div>
              )}

              {images.length > 1 && (
                <div className="mt-4 flex flex-wrap gap-3">
                  {images.map((img, index) => (
                    <button
                      key={img.publicId || index}
                      type="button"
                      onClick={() => setActiveImage(index)}
                      aria-label={`View image ${index + 1}`}
                      className={`overflow-hidden rounded-lg border-2 transition ${
                        index === activeImage
                          ? "border-[#00696b]"
                          : "border-transparent opacity-70 hover:opacity-100"
                      }`}
                    >
                      <img
                        src={img.url}
                        alt=""
                        className="h-20 w-28 object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}

              <div className="mt-10 rounded-2xl border border-[#e1e3e4] bg-white p-6 sm:p-8">
                <h2 className="text-xl font-semibold tracking-[-0.02em] text-[#191c1d]">
                  About this property
                </h2>
                <p className="mt-4 leading-7 text-[#44474d]">{property.description}</p>
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
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#75777e]">Property type</span>
                    <span className="font-medium capitalize text-[#191c1d]">{property.propertyType}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#75777e]">Bedrooms</span>
                    <span className="font-medium text-[#191c1d]">{property.bedrooms}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#75777e]">Bathrooms</span>
                    <span className="font-medium text-[#191c1d]">{property.bathrooms}</span>
                  </div>
                  {property.areaSqFt !== undefined && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[#75777e]">Area</span>
                      <span className="font-medium text-[#191c1d]">
                        {property.areaSqFt.toLocaleString("en-IN")} sq ft
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#75777e]">Location</span>
                    <span className="font-medium text-[#191c1d]">{property.address.city}</span>
                  </div>
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