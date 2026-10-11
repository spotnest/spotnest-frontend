import api from "@/src/lib/axios";
import type { ApiResponse, Booking, CreateBookingPayload } from "../types";

export const createBooking = async (payload: CreateBookingPayload): Promise<Booking> => {
    const response = await api.post<ApiResponse<Booking>>("/bookings", payload);
    return response.data.data;
};

export const getMyBookings = async (): Promise<Booking[]> => {
    const response = await api.get<ApiResponse<Booking[]>>("/bookings/mine");
    return response.data.data;
};

export const getBookingById = async (id: string): Promise<Booking> => {
    const response = await api.get<ApiResponse<Booking>>(`/bookings/${id}`);
    return response.data.data;
};

export const getOwnerBookingRequests = async (): Promise<Booking[]> => {
    const response = await api.get<ApiResponse<Booking[]>>("/bookings/owner/requests");
    return response.data.data;
};

export const reviewBooking = async (input: { bookingId: string; decision: "APPROVED" | "REJECTED" }) => {
    const { bookingId, decision } = input;
    const response = await api.patch<ApiResponse<Booking>>(`/bookings/${bookingId}/review`, { decision });
    return response.data.data;
};
