import api from "@/src/lib/axios";
import type {
    AdminProperty,
    AdminPropertyListParams,
    AdminPropertyListResponse,
    NearbyPropertyParams,
    NearbyPropertyResponse,
    Property,
    PropertyListParams,
    PropertyListResponse,
} from "../types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

// The listing fetch runs on the server (page.tsx). Using native fetch lets
// Next.js's Data Cache hold each query-string variant for 5 minutes and tag
// it for on-demand revalidation. Axios (below) bypasses the Data Cache, so
// the server list path steers clear of it.
export const getProperties = async (params: PropertyListParams = {}): Promise<PropertyListResponse> => {
    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null && value !== "") {
            searchParams.set(key, String(value));
        }
    }
    const query = searchParams.toString();
    const url = `${API_BASE_URL}/properties${query ? `?${query}` : ""}`;
    const response = await fetch(url, {
        next: { revalidate: 300, tags: ["properties"] },
    });
    if (!response.ok) {
        throw new Error(`Failed to fetch properties (${response.status})`);
    }
    return response.json() as Promise<PropertyListResponse>;
};

// /properties/nearby returns the raw body — no { success, data } wrapper.
export const getNearbyProperties = async (params: NearbyPropertyParams = {}): Promise<NearbyPropertyResponse> => {
    const { data } = await api.get<NearbyPropertyResponse>("/properties/nearby", { params });
    return data;
};

export const getPropertyById = async (id: string): Promise<Property> => {
    const { data } = await api.get<Property>(`/properties/${id}`);
    return data;
};

export const getAdminProperties = async (params: AdminPropertyListParams = {}): Promise<AdminPropertyListResponse> => {
    const { data } = await api.get<AdminPropertyListResponse>("/properties/admin/all", { params });
    return data;
};

export const getAdminPropertyById = async (id: string): Promise<AdminProperty> => {
    const { data } = await api.get<AdminProperty>(`/properties/admin/${id}`);
    return data;
};

export const updatePropertyStatus = async (id: string, status: "active" | "inactive") => {
    const { data } = await api.patch<{ message: string }>(`/properties/${id}/status`, { status });
    return data;
};

export const archiveProperty = async (id: string) => {
    const { data } = await api.delete<{ message: string }>(`/properties/${id}`);
    return data;
};
