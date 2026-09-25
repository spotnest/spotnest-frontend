import api from "@/src/lib/axios";
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

export const removePropertyImage = async (id: string, publicId: string) => {
    const { data } = await api.post<{ message: string }>(
        `/properties/${id}/images/remove`,
        { publicId }
    );
    return data;
};
