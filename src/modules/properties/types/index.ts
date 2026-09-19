export type PropertyType = "apartment" | "house" | "villa" | "studio" | "room";
export type PropertyStatus = "active" | "inactive" | "archived";

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
