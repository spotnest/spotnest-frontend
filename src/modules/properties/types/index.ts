export type PropertyType = "apartment" | "house" | "villa" | "studio" | "room";
export type PropertyStatus = "active" | "inactive" | "archived";
export type PropertyRentalStatus = "available";

export interface PropertyImage {
    url: string;
    publicId: string;
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
}

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
    items: Property[];
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
