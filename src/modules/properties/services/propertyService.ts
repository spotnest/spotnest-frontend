import api from "@/src/lib/axios";
import type { Property, PropertyListParams, PropertyListResponse } from "../types";

export const getProperties = async (params: PropertyListParams = {}): Promise<PropertyListResponse> => {
    const { data } = await api.get<PropertyListResponse>("/properties", { params });
    return data;
};

export const getPropertyById = async (id: string): Promise<Property> => {
    const { data } = await api.get<Property>(`/properties/${id}`);
    return data;
};
