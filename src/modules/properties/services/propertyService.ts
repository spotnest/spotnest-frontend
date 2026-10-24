import api from "@/src/lib/axios";
import { API_BASE_URL } from "@/src/lib/apiConfig";
import type {
    AdminProperty,
    AdminPropertyListParams,
    AdminPropertyListResponse,
    NearbyPropertyParams,
    NearbyPropertyResponse,
    OwnerPropertyInput,
    Property,
    PropertyListParams,
    PropertyListResponse,
} from "../types";

// The listing fetch runs on the server (page.tsx), so avoid serving stale
// listings from Next.js's Data Cache.
export const getProperties = async (params: PropertyListParams = {}): Promise<PropertyListResponse> => {
    try {
        const searchParams = new URLSearchParams();
        for (const [key, value] of Object.entries(params)) {
            if (value !== undefined && value !== null && value !== "") {
                searchParams.set(key, String(value));
            }
        }
        const query = searchParams.toString();
        const response = await fetch(`${API_BASE_URL}/properties${query ? `?${query}` : ""}`, {
            cache: "no-store",
        });
        if (!response.ok) {
            throw new Error(`Failed to fetch properties (${response.status})`);
        }

        const data = await response.json() as Partial<PropertyListResponse> | null;
        const items = Array.isArray(data?.items) ? data.items : [];

        return {
            items,
            pagination: data?.pagination ?? {
                page: params.page ?? 1,
                limit: params.limit ?? 10,
                total: items.length,
                pages: Math.ceil(items.length / (params.limit ?? 10)) || 1,
            },
        };
    } catch (error) {
        console.error("Failed to fetch properties:", error);
        return {
            items: [],
            pagination: {
                page: params.page ?? 1,
                limit: params.limit ?? 10,
                total: 0,
                pages: 1,
            },
        };
    }
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

export const updatePropertyStatus = async (id: string, status: "active" | "inactive" | "archived") => {
    const { data } = await api.patch<{ message: string }>(`/properties/${id}/status`, { status });
    return data;
};

export const archiveProperty = async (id: string) => {
    const { data } = await api.delete<{ message: string }>(`/properties/${id}`);
    return data;
};

export const adminDeleteProperty = async (id: string) => {
    const { data } = await api.delete<{ message: string }>(`/properties/admin/${id}`);
    return data;
};


// /properties/mine/all — returns a bare array (no pagination wrapper).
export const getMyProperties = async (): Promise<Property[]> => {
    const { data } = await api.get<Property[]>("/properties/mine/all");
    return data;
};

export const getMyPropertyById = async (id: string): Promise<Property> => {
    const { data } = await api.get<Property>(`/properties/mine/${id}`);
    return data;
};

// Multipart create: image fields live in the same form as the listing fields,
// so this path builds ONE FormData. The axios request interceptor clears the
// JSON Content-Type for FormData bodies so the upload stays multipart.
export const createProperty = async (formData: FormData): Promise<Property> => {
    const { data } = await api.post<Property>("/properties", formData);
    return data;
};

// PATCH is JSON-only on the backend (no multer, no images). Text-change
// submissions go through here; photos change via the dedicated endpoints.
export const updateProperty = async (
    id: string,
    payload: Partial<OwnerPropertyInput>
): Promise<Property> => {
    const { data } = await api.patch<Property>(`/properties/${id}`, payload);
    return data;
};

export const addPropertyImages = async (id: string, files: File[]): Promise<Property> => {
    const formData = new FormData();
    files.forEach((file) => formData.append("images", file));
    const { data } = await api.post<Property>(`/properties/${id}/images`, formData);
    return data;
};

export const removePropertyImage = async (
    id: string,
    publicId: string
): Promise<{ message: string; property?: Property }> => {
    const { data } = await api.post<{ message: string; property?: Property }>(
        `/properties/${id}/images/remove`,
        { publicId }
    );
    return data;
};
