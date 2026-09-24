export type PropertyType = "apartment" | "house" | "villa" | "studio" | "room";
export type PropertyStatus = "active" | "inactive" | "archived";
export type PropertyRentalStatus = "available";

export interface PropertyImage {
    url: string;
    publicId: string;
}

// GeoJSON Point produced by the backend geocoding step. Coordinates are
// [longitude, latitude] — the order /properties/nearby searches against.
export interface PropertyLocation {
    type: "Point";
    coordinates: [number, number];
}

export interface PropertyAddress {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
}

export interface Property {
    _id: string;
    owner: string;
    title: string;
    description: string;
    propertyType: PropertyType;
    price: number;
    bedrooms: number;
    bathrooms: number;
    areaSqFt?: number;
    amenities: string[];
    address: PropertyAddress;
    images: PropertyImage[];
    status: PropertyStatus;
    created_at: string;
    updated_at: string;
    // set by the backend geocoder — present on owner/admin-scoped payloads
    location?: PropertyLocation;
    locationResolvedName?: string;
    // present only on /properties/nearby results
    distanceKm?: number;
}

// Lean shape returned by the public LIST endpoints (GET /properties and
// /properties/nearby): the backend omits description/amenities from those
// payloads — the card grid never renders them.
export type PropertySummary = Omit<Property, "description" | "amenities">;

export interface PropertyListParams {
    page?: number;
    limit?: number;
    city?: string;
    minPrice?: number;
    maxPrice?: number;
    bedrooms?: number;
    propertyType?: PropertyType;
}

export interface PropertyListResponse {
    items: PropertySummary[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
}

// /properties/nearby — no city filter: redundant inside a radius.
export type NearbyPropertyParams = Omit<PropertyListParams, "city">;

export interface NearbyPropertyResponse {
    items: PropertySummary[];
    searchedFrom?: string;
    radiusKm: number;
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
}

export interface AdminPropertyOwner {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    isVerified: boolean;
    verificationStatus?: "unsubmitted" | "pending" | "approved" | "rejected";
    status: "active" | "inactive" | "suspended";
}

export interface AdminProperty extends Omit<Property, "owner" | "price"> {
    owner: AdminPropertyOwner | null;
    price: number | null;
    rentalStatus: PropertyRentalStatus;
}

export interface AdminPropertyListParams extends Omit<PropertyListParams, "city"> {
    search?: string;
    status?: PropertyStatus;
    city?: string;
}

export interface AdminPropertyListResponse {
    items: AdminProperty[];
    pagination: PropertyListResponse["pagination"];
}

// Body used by an owner to create/update one of their listings. Mirrors the
// backend zod schema: address/amenities are JSON-stringified when multiplexed
// into multipart FormData (the backend controller parses them back).
export interface OwnerPropertyInput {
    title: string;
    description: string;
    propertyType: PropertyType;
    price: number;
    bedrooms: number;
    bathrooms: number;
    areaSqFt?: number;
    amenities: string[];
    address: PropertyAddress;
}

export interface OwnerPropertyFormValues extends OwnerPropertyInput {}
