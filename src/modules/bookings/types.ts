export type BookingStatus = "PENDING" | "APPROVED" | "REJECTED" | "CONFIRMED" | "ACTIVE" | "COMPLETED";
export type BookingPaymentStatus = "NOT_DUE" | "ADVANCE_PAYMENT_PENDING" | "PAID";

export interface BookingProperty {
    _id: string;
    title: string;
    price: number;
    advanceAmount?: number;
    address?: { city: string; state: string };
    images?: { url: string }[];
}

export interface BookingUser {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    image?: string;
}

export interface Booking {
    _id: string;
    propertyId: string | BookingProperty;
    ownerId: string;
    monthlyRent: number;
    advanceAmount: number;
    currency: string;
    status: BookingStatus;
    paymentStatus: BookingPaymentStatus;
    startDate: string;
    endDate: string;
    decisionNote?: string;
    userId: string | BookingUser;
    notes?: string;
    created_at: string;
    updated_at: string;
}

export interface CreateBookingPayload {
    propertyId: string;
    startDate: string;
    endDate: string;
    notes?: string;
}

export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}
