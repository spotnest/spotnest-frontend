import api from "@/src/lib/axios";
import type {
    AdminProperty,
    AdminPropertyListParams,
    AdminPropertyListResponse,
    Property,
    PropertyListParams,
    PropertyListResponse,
} from "../types";

export const getProperties = async (params: PropertyListParams = {}): Promise<PropertyListResponse> => {
    const { data } = await api.get<PropertyListResponse>("/properties", { params });
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
