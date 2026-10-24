/**
 * Mirrors POST /api/v1/ai/generate (spotnest-backend src/modules/geminiAI).
 *
 * The backend is a stateless single-prompt Groq completion: it accepts one
 * `prompt` string and returns the generated text as `data`. It keeps no
 * conversation state, so multi-turn context is assembled client-side.
 */
export interface AiGenerateRequest {
    prompt: string;
}

export interface AiGenerateResponse {
    success: boolean;
    /** Generated text on success. Absent when the model returned no content. */
    data?: string | null;
    /** Present on failure ("Prompt is required", or an upstream error). */
    message?: string;
}

export type ChatRole = "user" | "assistant";

export interface ChatMessage {
    id: string;
    role: ChatRole;
    content: string;
}

/**
 * Search requirements accumulated across the conversation.
 *
 * Only the fields the real property API (or a client-side pass over real
 * records) can actually satisfy. Every field is optional because the user
 * reveals them gradually and later turns refine earlier ones.
 */
export interface PropertySearchCriteria {
    city?: string;
    /** Treated as "at least this many bedrooms" — see matching.ts. */
    bedrooms?: number;
    minPrice?: number;
    maxPrice?: number;
    propertyType?: PropertyTypeValue;
    /** Normalised amenity keys, matched against each property's amenities. */
    amenities?: string[];
}

/** Mirrors the backend propertyType enum. */
export type PropertyTypeValue = "apartment" | "house" | "villa" | "studio" | "room";

/** What the extraction turn returns: updated criteria plus how to apply them. */
export interface ExtractedCriteria {
    criteria: PropertySearchCriteria;
    /** true when the user started a new search rather than refining. */
    reset: boolean;
    /** true when the message is a property search at all. */
    isSearch: boolean;
}

/** A real property record plus why it matched. Never synthesised. */
export interface MatchedProperty {
    /** The hydrated record straight from GET /properties/:id. */
    property: import("@/src/modules/properties/types").Property;
    score: number;
    /** Short human-readable reasons, derived only from real field values. */
    reasons: string[];
}

export type FallbackStepId =
    | "relax_amenities"
    | "relax_budget"
    | "relax_property_type"
    | "relax_bedrooms"
    | "expand_location";

export interface FallbackStep {
    id: FallbackStepId;
    label: string;
    description: string;
    criteria: PropertySearchCriteria;
}
