"use client";

import axios from "axios";
import { useState, type FormEvent } from "react";
import {
    PROPERTY_TYPES,
} from "../utils/filters";
import {
    type OwnerPropertyFormValues,
    type Property,
    type PropertyAddress,
    type PropertyType,
} from "../types";

const MAX_IMAGES = 8;

// Common amenities offered as one-tap toggle chips (custom entries still work).
const AMENITY_SUGGESTIONS = [
    "Wi-Fi",
    "Furnished",
    "Parking",
    "Air conditioning",
    "Balcony",
    "Gym",
    "Security",
    "Pet friendly",
    "Laundry",
    "Water supply",
];

type Props = {
    mode: "create" | "edit";
    initial?: Property | null;
    // Create collects photos in the form itself (multipart create); edit
    // manages photos through its own panel, so no file input is rendered.
    showImages?: boolean;
    submitLabel: string;
    onSubmit: (values: OwnerPropertyFormValues, files: File[]) => Promise<void>;
};

const labelClass =
    "block text-xs font-semibold uppercase tracking-[0.12em] text-[#75777e]";
const inputClass =
    "mt-2 h-11 w-full rounded-xl border border-[#c5c6cd] bg-white px-3 text-sm text-[#191c1d] outline-none transition focus:border-[#00696b] focus:ring-2 focus:ring-[#d9f4f3]";

export default function OwnerPropertyForm({
    mode,
    initial,
    showImages = mode === "create",
    submitLabel,
    onSubmit,
}: Props) {
    const [title, setTitle] = useState(initial?.title ?? "");
    const [description, setDescription] = useState(initial?.description ?? "");
    const [propertyType, setPropertyType] = useState<PropertyType>(
        initial?.propertyType ?? "apartment"
    );
    const [price, setPrice] = useState(initial?.price != null ? String(initial.price) : "");
    const [bedrooms, setBedrooms] = useState(initial?.bedrooms != null ? String(initial.bedrooms) : "1");
    const [bathrooms, setBathrooms] = useState(initial?.bathrooms != null ? String(initial.bathrooms) : "1");
    const [areaSqFt, setAreaSqFt] = useState(initial?.areaSqFt != null ? String(initial.areaSqFt) : "");
    const [amenities, setAmenities] = useState<string[]>(initial?.amenities ?? []);
    const [address, setAddress] = useState<PropertyAddress>(
        initial?.address ?? { street: "", city: "", state: "", zipCode: "", country: "India" }
    );
    const [files, setFiles] = useState<File[]>([]);
    const [customAmenity, setCustomAmenity] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const toggleAmenity = (amenity: string) => {
        setAmenities((current) =>
            current.includes(amenity)
                ? current.filter((item) => item !== amenity)
                : [...current, amenity]
        );
    };

    const addCustomAmenity = () => {
        const value = customAmenity.trim();
        if (!value || amenities.includes(value)) return;
        setAmenities((current) => [...current, value]);
        setCustomAmenity("");
    };

    const handleFiles = (list: FileList | null) => {
        if (!list) return;
        const next = Array.from(list).slice(0, MAX_IMAGES);
        setFiles(next);
    };

    const removeFile = (index: number) => {
        setFiles((current) => current.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);

        const numericPrice = Number(price);
        const numericBedrooms = Number(bedrooms);
        const numericBathrooms = Number(bathrooms);

        if (showImages && files.length === 0) {
            setError("Add at least one photo so tenants know what the property looks like.");
            return;
        }

        if (title.trim().length < 3) {
            setError("Title must be at least 3 characters.");
            return;
        }
        if (description.trim().length < 10) {
            setError("Description must be at least 10 characters.");
            return;
        }
        if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
            setError("Monthly price must be greater than 0.");
            return;
        }
        if (!Number.isInteger(numericBedrooms) || numericBedrooms < 0) {
            setError("Bedrooms must be a whole number.");
            return;
        }
        if (!Number.isInteger(numericBathrooms) || numericBathrooms < 0) {
            setError("Bathrooms must be a whole number.");
            return;
        }
        if (!address.street.trim() || !address.city.trim() || !address.state.trim() || !address.zipCode.trim() || !address.country.trim()) {
            setError("Street, city, state, ZIP/postal code and country are required.");
            return;
        }

        const values: OwnerPropertyFormValues = {
            title: title.trim(),
            description: description.trim(),
            propertyType,
            price: numericPrice,
            bedrooms: numericBedrooms,
            bathrooms: numericBathrooms,
            ...(areaSqFt.trim()
                ? { areaSqFt: Number(areaSqFt) }
                : {}),
            amenities,
            address: Object.fromEntries(
                Object.entries(address).map(([key, value]) => [key, value.trim()])
            ) as PropertyAddress,
        };

        setSubmitting(true);
        try {
            await onSubmit(values, files);
        } catch (err) {
            setError(
                axios.isAxiosError(err) &&
                    typeof err.response?.data?.message === "string"
                    ? err.response.data.message
                    : "Unable to save the property. Please try again."
            );
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
                <div
                    role="alert"
                    className="rounded-2xl border border-[#f0b5ae] bg-[#fff0ee] px-5 py-4 text-sm text-[#b42318]"
                >
                    {error}
                </div>
            )}

            <section className="rounded-2xl border border-[#e1e3e4] bg-white p-6">
                <h2 className="text-lg font-bold text-[#191c1d]">Basics</h2>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    <label className="sm:col-span-2">
                        <span className={labelClass}>Title</span>
                        <input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g. Bright 2 BHK near Mankavu"
                            className={inputClass}
                        />
                    </label>

                    <label>
                        <span className={labelClass}>Property type</span>
                        <select
                            value={propertyType}
                            onChange={(e) => setPropertyType(e.target.value as PropertyType)}
                            className={inputClass}
                        >
                            {PROPERTY_TYPES.map((type) => (
                                <option key={type.value || "all"} value={type.value}>
                                    {type.label}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label>
                        <span className={labelClass}>Monthly rent (₹)</span>
                        <input
                            type="number"
                            min="1"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            placeholder="15000"
                            className={inputClass}
                        />
                    </label>

                    <label>
                        <span className={labelClass}>Bedrooms</span>
                        <input
                            type="number"
                            min="0"
                            value={bedrooms}
                            onChange={(e) => setBedrooms(e.target.value)}
                            className={inputClass}
                        />
                    </label>

                    <label>
                        <span className={labelClass}>Bathrooms</span>
                        <input
                            type="number"
                            min="0"
                            value={bathrooms}
                            onChange={(e) => setBathrooms(e.target.value)}
                            className={inputClass}
                        />
                    </label>

                    <label className="sm:col-span-2">
                        <span className={labelClass}>Area (sq ft) — optional</span>
                        <input
                            type="number"
                            min="1"
                            value={areaSqFt}
                            onChange={(e) => setAreaSqFt(e.target.value)}
                            placeholder="e.g. 950"
                            className={inputClass}
                        />
                    </label>

                    <label className="sm:col-span-2">
                        <span className={labelClass}>Description</span>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={4}
                            placeholder="Describe the property — condition, floor, nearby conveniences, notice period..."
                            className="mt-2 w-full rounded-xl border border-[#c5c6cd] bg-white px-3 py-3 text-sm text-[#191c1d] outline-none transition focus:border-[#00696b] focus:ring-2 focus:ring-[#d9f4f3]"
                        />
                    </label>
                </div>
            </section>

            <section className="rounded-2xl border border-[#e1e3e4] bg-white p-6">
                <h2 className="text-lg font-bold text-[#191c1d]">Amenities</h2>

                <div className="mt-4 flex flex-wrap gap-2">
                    {AMENITY_SUGGESTIONS.map((amenity) => {
                        const selected = amenities.includes(amenity);
                        return (
                            <button
                                key={amenity}
                                type="button"
                                onClick={() => toggleAmenity(amenity)}
                                className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                                    selected
                                        ? "border-[#00696b] bg-[#00696b] text-white"
                                        : "border-[#c5c6cd] bg-white text-[#44474d] hover:border-[#00696b] hover:text-[#00696b]"
                                }`}
                            >
                                {amenity}
                            </button>
                        );
                    })}
                </div>

                <div className="mt-4 flex gap-2">
                    <input
                        value={customAmenity}
                        onChange={(e) => setCustomAmenity(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                e.preventDefault();
                                addCustomAmenity();
                            }
                        }}
                        placeholder="Add a custom amenity and press Enter"
                        className="h-10 min-w-0 flex-1 rounded-xl border border-[#c5c6cd] bg-white px-3 text-sm text-[#191c1d] outline-none transition focus:border-[#00696b] focus:ring-2 focus:ring-[#d9f4f3]"
                    />
                    <button
                        type="button"
                        onClick={addCustomAmenity}
                        className="rounded-xl border border-[#c5c6cd] px-4 text-sm font-semibold text-[#44474d] transition hover:border-[#00696b] hover:text-[#00696b]"
                    >
                        Add
                    </button>
                </div>

                {amenities.length > 0 && (
                    <p className="mt-3 text-xs font-medium text-[#75777e]">
                        {amenities.length} selected
                    </p>
                )}
            </section>

            <section className="rounded-2xl border border-[#e1e3e4] bg-white p-6">
                <h2 className="text-lg font-bold text-[#191c1d]">Address</h2>
                <p className="mt-1 text-xs leading-5 text-[#75777e]">
                    The address is verified against a map so tenants can find you
                    through the &ldquo;Near me&rdquo; search.
                </p>

                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    <label className="sm:col-span-2">
                        <span className={labelClass}>Street</span>
                        <input
                            value={address.street}
                            onChange={(e) => setAddress({ ...address, street: e.target.value })}
                            placeholder="Door no, street, area"
                            className={inputClass}
                        />
                    </label>

                    <label>
                        <span className={labelClass}>City</span>
                        <input
                            value={address.city}
                            onChange={(e) => setAddress({ ...address, city: e.target.value })}
                            placeholder="e.g. Kozhikode"
                            className={inputClass}
                        />
                    </label>

                    <label>
                        <span className={labelClass}>State / region</span>
                        <input
                            value={address.state}
                            onChange={(e) => setAddress({ ...address, state: e.target.value })}
                            placeholder="e.g. Kerala"
                            className={inputClass}
                        />
                    </label>

                    <label>
                        <span className={labelClass}>ZIP / postal code</span>
                        <input
                            value={address.zipCode}
                            onChange={(e) => setAddress({ ...address, zipCode: e.target.value })}
                            placeholder="e.g. 673032"
                            className={inputClass}
                        />
                    </label>

                    <label>
                        <span className={labelClass}>Country</span>
                        <input
                            value={address.country}
                            onChange={(e) => setAddress({ ...address, country: e.target.value })}
                            className={inputClass}
                        />
                    </label>
                </div>
            </section>

            {showImages && (
                <section className="rounded-2xl border border-[#e1e3e4] bg-white p-6">
                    <h2 className="text-lg font-bold text-[#191c1d]">Photos</h2>
                    <p className="mt-1 text-xs leading-5 text-[#75777e]">
                        Up to {MAX_IMAGES} photos, JPG / PNG / WebP. The first one
                        becomes the listing cover.
                    </p>

                    <label className="mt-4 flex h-28 cursor-pointer flex-col items-center justify-center gap-1.5 rounded-2xl border border-dashed border-[#c5c6cd] bg-[#f8f9fa] text-[#00696b] transition hover:border-[#00696b] hover:bg-[#dff7f5]">
                        <svg aria-hidden="true" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 16V4m0 0 4 4m-4-4L8 8M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" />
                        </svg>
                        <span className="text-sm font-semibold">
                            {files.length > 0 ? `${files.length} photo${files.length === 1 ? "" : "s"} selected` : "Choose photos"}
                        </span>
                        <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            multiple
                            className="sr-only"
                            onChange={(e) => handleFiles(e.target.files)}
                        />
                    </label>

                    {files.length > 0 && (
                        <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4">
                            {files.map((file, index) => (
                                <div key={`${file.name}-${index}`} className="group relative aspect-[1.4/1] overflow-hidden rounded-xl border border-[#e1e3e4] bg-[#f3f4f5]">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={URL.createObjectURL(file)}
                                        alt={`Selected photo ${index + 1}`}
                                        className="h-full w-full object-cover"
                                    />
                                    <button
                                        type="button"
                                        aria-label="Remove photo"
                                        onClick={() => removeFile(index)}
                                        className="absolute right-1.5 top-1.5 grid h-7 w-7 place-items-center rounded-full bg-[#191c1d]/75 text-white opacity-0 transition group-hover:opacity-100"
                                    >
                                        <svg aria-hidden="true" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            )}

            <div className="flex items-center justify-end gap-3">
                <button
                    type="submit"
                    disabled={submitting}
                    className="rounded-xl bg-[#00696b] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#004f51] disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {submitting
                        ? mode === "create"
                            ? "Listing property…"
                            : "Saving…"
                        : submitLabel}
                </button>
            </div>
        </form>
    );
}