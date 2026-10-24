import api from "@/src/lib/axios";
import { getProperties, getPropertyById } from "@/src/modules/properties/services/propertyService";
import type { Property, PropertyListParams } from "@/src/modules/properties/types";
import type {
    AiGenerateRequest,
    AiGenerateResponse,
    ExtractedCriteria,
    PropertySearchCriteria,
} from "../types/ai";
import { PROPERTY_TYPE_VALUES, canonicalCity, sanitizeCriteria } from "../utils/criteria";

/**
 * Calls the existing Groq-backed endpoint through the shared axios client, so
 * it inherits the configured base URL and cookie/auth handling. The route
 * itself is public, but going through `api` keeps one request pipeline.
 */
export const generateAiReply = async (prompt: string): Promise<string> => {
    const payload: AiGenerateRequest = { prompt };
    const response = await api.post<AiGenerateResponse>("/ai/generate", payload);

    // `data` is `completion.choices[0]?.message?.content` on the backend, so a
    // completion with no content serialises to a missing field rather than an
    // error. Treat that as a failed turn instead of rendering an empty bubble.
    const reply = response.data?.data?.trim();
    if (!reply) {
        throw new Error("The assistant did not return a reply. Please try again.");
    }

    return reply;
};

/** Pulls the first JSON object out of a reply that may be fenced or prefixed. */
const parseJsonObject = (raw: string): Record<string, unknown> | null => {
    const withoutFence = raw.replace(/```(?:json)?/gi, "").trim();
    const start = withoutFence.indexOf("{");
    const end = withoutFence.lastIndexOf("}");
    if (start === -1 || end <= start) return null;

    try {
        const parsed: unknown = JSON.parse(withoutFence.slice(start, end + 1));
        return parsed && typeof parsed === "object" ? (parsed as Record<string, unknown>) : null;
    } catch {
        return null;
    }
};

const asNumber = (value: unknown): number | undefined => {
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string") {
        // Accepts "12,000", "12000", "₹12000".
        const cleaned = value.replace(/[^\d.]/g, "");
        const parsed = Number.parseFloat(cleaned);
        if (Number.isFinite(parsed)) return parsed;
    }
    return undefined;
};

const asStringArray = (value: unknown): string[] =>
    Array.isArray(value) ? value.filter((v): v is string => typeof v === "string") : [];

/**
 * Turns the user's sentence into structured criteria using the existing
 * /ai/generate endpoint. The endpoint only returns text, so it is asked for
 * strict JSON and the result is parsed and validated here — the model never
 * chooses which properties are shown, it only reads the requirements.
 */
export const extractCriteria = async (
    userMessage: string,
    currentCriteria: PropertySearchCriteria
): Promise<ExtractedCriteria> => {
    const prompt = [
        "You convert a property-rental request into JSON. Reply with JSON only — no prose, no code fence.",
        "",
        "Schema:",
        '{"isSearch": boolean, "reset": boolean, "city": string|null, "bedrooms": number|null, "minPrice": number|null, "maxPrice": number|null, "propertyType": "apartment"|"house"|"villa"|"studio"|"room"|null, "amenities": string[]}',
        "",
        "Rules:",
        '- "isSearch" is true if the user is describing or refining what property they want; false for general chat or questions about results already shown.',
        '- "reset" is true only if the user clearly starts a brand-new search ("start over", a totally different city with no reference to before).',
        "- Only include a field if this message states or changes it; use null otherwise.",
        '- Prices are monthly rent in Indian rupees as plain numbers. "12k" means 12000, "1.2 lakh" means 120000.',
        '- "2 BHK" means bedrooms = 2.',
        '- amenities: short tags only, e.g. ["furnished","parking","wifi","air conditioning","gym"]. Empty array if none mentioned.',
        "",
        `Current criteria already collected: ${JSON.stringify(currentCriteria)}`,
        `User message: ${JSON.stringify(userMessage)}`,
        "",
        "JSON:",
    ].join("\n");

    const raw = await generateAiReply(prompt);
    const parsed = parseJsonObject(raw);

    if (!parsed) {
        // Never guess the user's intent from unparseable output.
        return { criteria: {}, reset: false, isSearch: false };
    }

    const propertyTypeRaw =
        typeof parsed.propertyType === "string" ? parsed.propertyType.toLowerCase() : undefined;

    const criteria = sanitizeCriteria({
        ...(typeof parsed.city === "string" ? { city: parsed.city } : {}),
        ...(asNumber(parsed.bedrooms) !== undefined ? { bedrooms: asNumber(parsed.bedrooms) } : {}),
        ...(asNumber(parsed.minPrice) !== undefined ? { minPrice: asNumber(parsed.minPrice) } : {}),
        ...(asNumber(parsed.maxPrice) !== undefined ? { maxPrice: asNumber(parsed.maxPrice) } : {}),
        ...(propertyTypeRaw &&
        (PROPERTY_TYPE_VALUES as readonly string[]).includes(propertyTypeRaw)
            ? { propertyType: propertyTypeRaw as PropertySearchCriteria["propertyType"] }
            : {}),
        amenities: asStringArray(parsed.amenities),
    });

    return {
        criteria,
        reset: parsed.reset === true,
        isSearch: parsed.isSearch === true,
    };
};

/** Cap on records hydrated per search — bounds the detail fan-out. */
const MAX_CANDIDATES = 24;

/**
 * Fetches the real candidate records for the given criteria.
 *
 * Two steps, both on existing endpoints:
 *  1. GET /properties with the filters the list API supports. `bedrooms` is
 *     deliberately NOT sent — the backend matches it exactly, which would drop
 *     larger homes; it is applied as a minimum client-side instead.
 *  2. GET /properties/:id per candidate, because the list projection strips
 *     `amenities` and `description`, which amenity filters and ranking need.
 */
export const searchProperties = async (
    criteria: PropertySearchCriteria
): Promise<Property[]> => {
    const params: PropertyListParams = { page: 1, limit: 50 };
    if (criteria.city) params.city = canonicalCity(criteria.city);
    if (criteria.minPrice !== undefined) params.minPrice = criteria.minPrice;
    if (criteria.maxPrice !== undefined) params.maxPrice = criteria.maxPrice;
    if (criteria.propertyType) params.propertyType = criteria.propertyType;

    let { items } = await getProperties(params);

    // The city filter is an anchored regex on the server; if it eliminates
    // everything, retry without it so a spelling/case variant in the stored
    // data still produces candidates (re-checked client-side afterwards).
    if (items.length === 0 && criteria.city) {
        const withoutCity: PropertyListParams = { ...params };
        delete withoutCity.city;
        ({ items } = await getProperties(withoutCity));
    }

    const candidates = items.slice(0, MAX_CANDIDATES);

    const settled = await Promise.allSettled(
        candidates.map((item) => getPropertyById(item._id))
    );

    return settled
        .filter((r): r is PromiseFulfilledResult<Property> => r.status === "fulfilled")
        .map((r) => r.value);
};
