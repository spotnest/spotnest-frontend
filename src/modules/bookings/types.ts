export type BookingStatus = "PENDING" | "APPROVED" | "REJECTED" | "CONFIRMED" | "ACTIVE" | "COMPLETED" | "EXPIRED";
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

export type TenantInquiryStatus =
    | "PENDING"
    | "ACCEPTED_MOVE_OUT"
    | "WANTS_EXTENSION"
    | "CUSTOM_MESSAGE"
    | "EXPIRED_DEEMED_CONSENT";

export type TenantInquiryChoice = "MOVE_OUT" | "EXTEND" | "CUSTOM";

export interface TenantInquiry {
    currentTenantId: string;
    currentRentalId?: string;
    status: TenantInquiryStatus;
    deadline: string;
    question: string;
    respondedAt?: string;
    responseChoice?: TenantInquiryChoice;
    responseMessage?: string;
    deemedConsentApplied?: boolean;
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
    tenantInquiry?: TenantInquiry;
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
