import type { Property } from "@/src/modules/properties/types";
import type { MatchedProperty, PropertySearchCriteria } from "../types/ai";
import { amenityLabel, canonicalAmenity, canonicalCity } from "./criteria";

const inr = (value: number) => `₹${value.toLocaleString("en-IN")}`;

const propertyAmenityKeys = (property: Property): Set<string> =>
    new Set((property.amenities ?? []).map(canonicalAmenity));

/**
 * Applies the criteria the list API cannot express, against real records only.
 *
 * - bedrooms: the API filters on exact equality, so "2 BHK" there would hide a
 *   3 BHK. We request without it and treat the number as a minimum here.
 * - amenities: absent from list payloads entirely, so they are matched on the
 *   hydrated detail records.
 * - city: the API's anchored regex misses case/spacing variants, so it is
 *   re-checked loosely here as a safety net.
 */
export const matchesCriteria = (property: Property, criteria: PropertySearchCriteria): boolean => {
    if (criteria.bedrooms !== undefined && property.bedrooms < criteria.bedrooms) return false;
    if (criteria.maxPrice !== undefined && property.price > criteria.maxPrice) return false;
    if (criteria.minPrice !== undefined && property.price < criteria.minPrice) return false;
    if (criteria.propertyType && property.propertyType !== criteria.propertyType) return false;

    if (criteria.city) {
        const want = canonicalCity(criteria.city).toLowerCase().replace(/\s+/g, "");
        const got = canonicalCity(property.address?.city ?? "").toLowerCase().replace(/\s+/g, "");
        if (got !== want) return false;
    }

    if (criteria.amenities?.length) {
        const have = propertyAmenityKeys(property);
        if (!criteria.amenities.every((a) => have.has(a))) return false;
    }

    return true;
};

/**
 * Ranks matches by how well they fit, and records the reason for each point.
 * Reasons quote real stored values only — nothing is inferred or invented.
 */
export const scoreProperty = (
    property: Property,
    criteria: PropertySearchCriteria
): { score: number; reasons: string[] } => {
    const reasons: string[] = [];
    let score = 0;

    if (criteria.city && property.address?.city) {
        score += 3;
        reasons.push(`In ${property.address.city}`);
    }

    if (criteria.bedrooms !== undefined) {
        score += 2;
        reasons.push(
            property.bedrooms === criteria.bedrooms
                ? `${property.bedrooms} bedrooms as requested`
                : `${property.bedrooms} bedrooms (more than the ${criteria.bedrooms} asked for)`
        );
    }

    if (criteria.maxPrice !== undefined) {
        const under = criteria.maxPrice - property.price;
        // Cheaper relative to the ceiling ranks higher, capped so price never
        // dominates an otherwise better match.
        score += 2 + Math.min(2, (under / criteria.maxPrice) * 4);
        reasons.push(
            under > 0
                ? `${inr(property.price)}/month — ${inr(under)} under budget`
                : `${inr(property.price)}/month — at your budget`
        );
    }

    if (criteria.propertyType && property.propertyType === criteria.propertyType) {
        score += 1;
        reasons.push(`Listed as ${property.propertyType}`);
    }

    if (criteria.amenities?.length) {
        const have = propertyAmenityKeys(property);
        const matched = criteria.amenities.filter((a) => have.has(a));
        if (matched.length) {
            score += matched.length;
            reasons.push(`Has ${matched.map(amenityLabel).join(", ")}`);
        }
    }

    return { score, reasons };
};

export const rankProperties = (
    properties: Property[],
    criteria: PropertySearchCriteria
): MatchedProperty[] =>
    properties
        .filter((property) => matchesCriteria(property, criteria))
        .map((property) => ({ property, ...scoreProperty(property, criteria) }))
        .sort((a, b) => b.score - a.score || a.property.price - b.property.price);

/**
 * Compact, factual digest of the current results, appended to the prompt so
 * follow-ups like "which is best for a family?" reason over the real listings
 * instead of the model's imagination.
 */
export const summariseMatchesForPrompt = (matches: MatchedProperty[]): string =>
    matches
        .slice(0, 8)
        .map((m, i) => {
            const p = m.property;
            const amenities = (p.amenities ?? []).join(", ") || "none listed";
            return `${i + 1}. "${p.title}" — ${p.address?.city ?? "unknown city"}, ${p.bedrooms} bed, ${p.bathrooms} bath, ${inr(p.price)}/month${p.areaSqFt ? `, ${p.areaSqFt} sq ft` : ""}, type ${p.propertyType}, amenities: ${amenities}`;
        })
        .join("\n");
