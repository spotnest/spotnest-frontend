import type { FallbackStep, PropertySearchCriteria, PropertyTypeValue } from "../types/ai";

export const PROPERTY_TYPE_VALUES: readonly PropertyTypeValue[] = [
    "apartment",
    "house",
    "villa",
    "studio",
    "room",
];

/**
 * Amenity strings are free text on the backend and genuinely inconsistent in
 * the data ("Wi-Fi" and "WiFi" both exist, "AC" vs "Air conditioning"), so
 * every comparison goes through this canonical key.
 */
export const amenityKey = (value: string): string =>
    value.toLowerCase().replace(/[^a-z0-9]/g, "");

const AMENITY_ALIASES: Record<string, string> = {
    wifi: "wifi",
    internet: "wifi",
    broadband: "wifi",
    ac: "airconditioning",
    aircon: "airconditioning",
    airconditioner: "airconditioning",
    airconditioning: "airconditioning",
    furnished: "furnished",
    fullyfurnished: "furnished",
    semifurnished: "furnished",
    parking: "parking",
    carparking: "parking",
    gym: "gym",
    fitnesscentre: "gym",
    lift: "lift",
    elevator: "lift",
    balcony: "balcony",
    garden: "garden",
    security: "security",
    powerbackup: "powerbackup",
    watersupply: "watersupply",
    water: "watersupply",
    swimmingpool: "swimmingpool",
    pool: "swimmingpool",
    laundry: "laundry",
    petfriendly: "petfriendly",
};

/** Maps any spelling onto a canonical amenity key. */
export const canonicalAmenity = (value: string): string => {
    const key = amenityKey(value);
    return AMENITY_ALIASES[key] ?? key;
};

/** Human label for a canonical key, used in match explanations. */
export const amenityLabel = (value: string): string => {
    const canonical = canonicalAmenity(value);
    const labels: Record<string, string> = {
        wifi: "Wi-Fi",
        airconditioning: "Air conditioning",
        furnished: "Furnished",
        parking: "Parking",
        gym: "Gym",
        lift: "Lift",
        balcony: "Balcony",
        garden: "Garden",
        security: "Security",
        powerbackup: "Power backup",
        watersupply: "Water supply",
        swimmingpool: "Swimming pool",
        laundry: "Laundry",
        petfriendly: "Pet friendly",
    };
    return labels[canonical] ?? value;
};

const isPositive = (value: unknown): value is number =>
    typeof value === "number" && Number.isFinite(value) && value > 0;

/** Drops empty/invalid fields so merging never stores junk. */
export const sanitizeCriteria = (input: PropertySearchCriteria): PropertySearchCriteria => {
    const out: PropertySearchCriteria = {};

    const city = input.city?.trim();
    if (city) out.city = city;

    if (isPositive(input.bedrooms)) out.bedrooms = Math.floor(input.bedrooms);
    if (isPositive(input.minPrice)) out.minPrice = Math.floor(input.minPrice);
    if (isPositive(input.maxPrice)) out.maxPrice = Math.floor(input.maxPrice);

    if (input.propertyType && PROPERTY_TYPE_VALUES.includes(input.propertyType)) {
        out.propertyType = input.propertyType;
    }

    const amenities = (input.amenities ?? [])
        .map((a) => (typeof a === "string" ? a.trim() : ""))
        .filter(Boolean)
        .map(canonicalAmenity);
    if (amenities.length) out.amenities = [...new Set(amenities)];

    return out;
};

/**
 * Refinement: later turns overwrite only the fields they mention, so
 * "increase the budget to 15000" keeps the city and bedrooms from before.
 * Amenities accumulate rather than replace.
 */
export const mergeCriteria = (
    current: PropertySearchCriteria,
    incoming: PropertySearchCriteria
): PropertySearchCriteria => {
    const next = sanitizeCriteria(incoming);
    const merged: PropertySearchCriteria = { ...current, ...next };

    if (next.amenities?.length) {
        merged.amenities = [...new Set([...(current.amenities ?? []), ...next.amenities])];
    }

    return merged;
};

export const hasAnyCriteria = (criteria: PropertySearchCriteria): boolean =>
    Object.values(criteria).some((v) => (Array.isArray(v) ? v.length > 0 : v !== undefined));

const inr = (value: number) => `₹${value.toLocaleString("en-IN")}`;

/** Readable one-line description of the active filters, for the chat + UI. */
export const describeCriteria = (criteria: PropertySearchCriteria): string => {
    const parts: string[] = [];
    if (criteria.bedrooms) parts.push(`${criteria.bedrooms}+ BHK`);
    if (criteria.propertyType) parts.push(criteria.propertyType);
    if (criteria.city) parts.push(`in ${criteria.city}`);
    if (criteria.minPrice && criteria.maxPrice) {
        parts.push(`between ${inr(criteria.minPrice)} and ${inr(criteria.maxPrice)}`);
    } else if (criteria.maxPrice) {
        parts.push(`under ${inr(criteria.maxPrice)}`);
    } else if (criteria.minPrice) {
        parts.push(`above ${inr(criteria.minPrice)}`);
    }
    if (criteria.amenities?.length) {
        parts.push(`with ${criteria.amenities.map(amenityLabel).join(", ")}`);
    }
    return parts.join(" ");
};

const CITY_ALIASES: Record<string, string> = {
    cochin: "kochi",
    ernakulam: "kochi",
    kochi: "kochi",
    kozhikode: "calicut",
    calicut: "calicut",
    trivandrum: "thiruvananthapuram",
    thiruvananthapuram: "thiruvananthapuram",
    bengaluru: "bangalore",
    bangalore: "bangalore",
};

export const canonicalCity = (city: string): string => {
    if (!city) return "";
    const key = city.trim().toLowerCase().replace(/\s+/g, "");
    return CITY_ALIASES[key] ?? city.trim().toLowerCase();
};

export const NEARBY_CITIES: Record<string, readonly string[]> = {
    cheruthuruthy: ["shornur", "thrissur"],
    shornur: ["cheruthuruthy", "thrissur"],
    thrissur: ["cheruthuruthy", "shornur", "kochi"],
    kochi: ["thrissur"],
    calicut: ["manjeri", "kannur"],
    manjeri: ["calicut"],
    kannur: ["calicut"],
};

export const getNearbyCities = (city?: string): string[] => {
    if (!city) return [];
    const key = canonicalCity(city).toLowerCase().replace(/\s+/g, "");
    return [...(NEARBY_CITIES[key] ?? [])];
};

/**
 * Computes a predictable, finite sequence of progressively broader fallback searches
 * based on the user's original criteria.
 *
 * Sequence:
 * 1. Relax optional amenities and secondary preferences.
 * 2. Relax the budget slightly within a reasonable, bounded limit (at most once).
 * 3. Relax property-type constraint (allow any property type).
 * 4. Relax bedroom constraint (allow fewer bedrooms / any bedrooms).
 * 5. Expand location only when a valid broader location is available.
 */
export const generateFallbackSteps = (
    original: PropertySearchCriteria
): FallbackStep[] => {
    const steps: FallbackStep[] = [];
    const base = sanitizeCriteria(original);
    let current: PropertySearchCriteria = { ...base };

    // Step 1: Relax optional amenities and secondary preferences
    if (current.amenities && current.amenities.length > 0) {
        const removed = current.amenities;
        current = { ...current };
        delete current.amenities;
        steps.push({
            id: "relax_amenities",
            label: "Relax amenities",
            description: `Relaxed amenity preferences (no longer requiring ${removed.map(amenityLabel).join(", ")})`,
            criteria: { ...current },
        });
    }

    // Step 2: Relax the budget slightly within a reasonable limit (bounded, at most once)
    if (current.maxPrice !== undefined) {
        // Increase budget by ~20-25%, rounded to nearest ₹500
        const relaxedBudget = Math.round((current.maxPrice * 1.25) / 500) * 500;
        const bump = relaxedBudget > current.maxPrice ? relaxedBudget : current.maxPrice + 1000;
        current = { ...current, maxPrice: bump };
        steps.push({
            id: "relax_budget",
            label: "Increase budget slightly",
            description: `Increased budget slightly from ₹${base.maxPrice?.toLocaleString("en-IN")} to ₹${bump.toLocaleString("en-IN")}/month`,
            criteria: { ...current },
        });
    }

    // Step 3: Relax property-type constraint if appropriate
    if (current.propertyType) {
        const prevType = current.propertyType;
        current = { ...current };
        delete current.propertyType;
        steps.push({
            id: "relax_property_type",
            label: "Any property type",
            description: `Relaxed property type from ${prevType} to any type (apartments, houses, villas)`,
            criteria: { ...current },
        });
    }

    // Step 4: Relax bedroom constraint if appropriate
    if (current.bedrooms !== undefined) {
        const prevBeds = current.bedrooms;
        current = { ...current };
        if (prevBeds > 1) {
            current.bedrooms = prevBeds - 1;
            steps.push({
                id: "relax_bedrooms",
                label: "Fewer bedrooms",
                description: `Relaxed bedroom requirement to ${prevBeds - 1}+ BHK (originally ${prevBeds} BHK)`,
                criteria: { ...current },
            });
        } else {
            delete current.bedrooms;
            steps.push({
                id: "relax_bedrooms",
                label: "Any bedrooms",
                description: "Relaxed bedroom requirement (allowing any number of bedrooms)",
                criteria: { ...current },
            });
        }
    }

    // Step 5: Expand the location only when a valid broader location is available
    if (current.city) {
        const nearby = getNearbyCities(current.city);
        for (const nearbyCity of nearby.slice(0, 2)) {
            const withNearby = { ...current, city: nearbyCity };
            steps.push({
                id: "expand_location",
                label: `Search nearby in ${nearbyCity}`,
                description: `Expanded search location from ${base.city} to nearby ${nearbyCity}`,
                criteria: withNearby,
            });
        }
    }

    return steps;
};
