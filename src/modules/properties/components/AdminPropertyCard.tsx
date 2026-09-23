import Image from "next/image";
import type { AdminProperty } from "../types";
import { formatPrice, propertyTypeLabels } from "../utils/format";

type Props = {
    property: AdminProperty;
};

const listingTone: Record<AdminProperty["status"], string> = {
    active: "bg-[#d9f4f3] text-[#00696b]",
    inactive: "bg-[#fff0dc] text-[#95611d]",
    archived: "bg-[#eef0f1] text-[#44474d]",
};

const formatListedDate = (value?: string) => {
    if (!value) return "Date unavailable";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Date unavailable";
    return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(date);
};

export default function AdminPropertyCard({ property }: Props) {
    // Older listings created before images had a schema default can omit the
    // field entirely. Admin must still be able to review those listings.
    const images = property.images ?? [];
    const image = images[0]?.url;
    const owner = property.owner;
    const area = property.areaSqFt ? `${property.areaSqFt.toLocaleString("en-IN")} sq ft` : null;

    return (
        <article className="overflow-hidden rounded-2xl border border-[#e1e3e4] bg-white shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
            <div className="relative aspect-[1.75/1] overflow-hidden bg-[#e7e8e9]">
                {image ? (
                    <Image src={image} alt={`${property.title} in ${property.address.city}`} fill sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw" className="object-cover" />
                ) : (
                    <div className="flex h-full items-center justify-center text-sm text-[#75777e]">No image available</div>
                )}
                <div className="absolute left-3 top-3 flex flex-wrap gap-2">
                    <span className="rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-bold text-[#191c1d] shadow-sm backdrop-blur">{propertyTypeLabels[property.propertyType] ?? property.propertyType}</span>
                    <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold capitalize shadow-sm ${listingTone[property.status]}`}>{property.status}</span>
                </div>
            </div>

            <div className="p-5">
                <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                        <h2 className="truncate text-lg font-bold text-[#191c1d]">{property.title}</h2>
                        <p className="mt-1 truncate text-sm text-[#44474d]">{property.address.street}, {property.address.city}, {property.address.state}</p>
                    </div>
                    <p className="shrink-0 text-base font-bold text-[#00696b]">{property.price === null ? "Price unavailable" : formatPrice(property.price)}</p>
                </div>

                <div className="mt-4 flex flex-wrap gap-x-3 gap-y-1 border-y border-[#eef0f1] py-3 text-xs font-semibold text-[#44474d]">
                    <span>{property.bedrooms} {property.bedrooms === 1 ? "Bed" : "Beds"}</span>
                    <span>{property.bathrooms} {property.bathrooms === 1 ? "Bath" : "Baths"}</span>
                    {area && <span>{area}</span>}
                    <span>{images.length} {images.length === 1 ? "Photo" : "Photos"}</span>
                </div>

                <div className="mt-4 rounded-xl bg-[#f8f9fa] p-3.5">
                    <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                            <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#75777e]">Property owner</p>
                            <p className="mt-1 truncate text-sm font-bold text-[#191c1d]">{owner?.name ?? "Owner unavailable"}</p>
                            {owner?.email && <p className="mt-0.5 truncate text-xs text-[#44474d]">{owner.email}</p>}
                            {owner?.phone && <p className="mt-0.5 text-xs text-[#44474d]">{owner.phone}</p>}
                        </div>
                        {owner && <span className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-bold ${owner.verificationStatus === "approved" ? "bg-[#d9f4f3] text-[#00696b]" : "bg-[#fff0dc] text-[#95611d]"}`}>{owner.verificationStatus === "approved" ? "Verified" : "Unverified"}</span>}
                    </div>
                </div>

                <div className="mt-4 flex items-center justify-between gap-3 text-xs">
                    <span className="font-semibold text-[#44474d]">Rental availability</span>
                    <span className="rounded-full bg-[#d9f4f3] px-2.5 py-1 font-bold capitalize text-[#00696b]">{property.rentalStatus}</span>
                </div>
                <p className="mt-3 text-[11px] text-[#75777e]">Listed {formatListedDate(property.created_at)}</p>
            </div>
        </article>
    );
}
