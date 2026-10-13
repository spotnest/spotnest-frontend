import axios from "@/src/lib/axios";

export interface TenantRentalResponse {
    rental: {
        id: string;
        bookingId: string;
        status: string;
        monthlyRent: number;
        securityDeposit: number;
        leaseStart: string;
        leaseEnd: string;
        paymentFrequency: string;
        splitMode: "EQUAL" | "CUSTOM";
        property: {
            id: string;
            title: string;
            propertyType: string;
            address: { street: string; city: string; state: string; zipCode: string; country: string };
            image?: string;
            bedrooms: number;
            bathrooms: number;
            areaSqFt?: number;
            amenities: string[];
        };
        owner: {
            id: string;
            name: string;
            email: string;
            phone?: string;
        };
    };
    myOccupant: {
        id: string;
        rentAmount: number;
        securityDepositShare: number;
        status: string;
    };
    occupants: Array<{
        id: string;
        tenant: {
            id: string;
            name: string;
            email: string;
        };
        rentAmount: number;
        securityDepositShare: number;
        status: string;
    }>;
    agreement: {
        id: string;
        status: string;
        monthlyRent: number;
        securityDepositShare: number;
        leaseStart: string;
        leaseEnd: string;
        terms: string;
        tenantAcceptedAt?: string | null;
        ownerAcceptedAt?: string | null;
        paymentDeadline?: string | null;
    } | null;
    payments: Array<{
        id: string;
        type: string;
        amount: number;
        status: string;
        dueDate?: string | null;
        paidAt?: string | null;
        billingMonth?: string;
        razorpayOrderId?: string;
        created_at: string;
    }>;
    inquiry?: {
        bookingId: string;
        propertyTitle?: string;
        startDate: string;
        endDate: string;
        deadline: string;
        question: string;
        status: string;
        deemedConsentNotice: string;
    } | null;
}

export interface OwnerRentalItem {
    id: string;
    bookingId: string;
    property: {
        id: string;
        title: string;
        address: { city: string; state: string };
        price: number;
    };
    monthlyRent: number;
    securityDeposit: number;
    leaseStart: string;
    leaseEnd: string;
    status: string;
    splitMode: "EQUAL" | "CUSTOM";
    occupants: Array<{
        id: string;
        tenant: {
            id: string;
            name: string;
            email: string;
            phone?: string;
        };
        rentAmount: number;
        securityDepositShare: number;
        status: string;
        agreementStatus: string;
        agreementId?: string;
        tenantAcceptedAt?: string | null;
        ownerAcceptedAt?: string | null;
        paymentDeadline?: string | null;
        monthlyPaymentStatus: string;
        latestPaymentAmount?: number;
        latestPaymentMonth?: string;
    }>;
}

export const getMyRental = async (bookingId?: string): Promise<TenantRentalResponse | null> => {
    const url = bookingId
        ? `/rentals/my-rental?bookingId=${encodeURIComponent(bookingId)}`
        : "/rentals/my-rental";
    const response = await axios.get(url);
    return response.data.data;
};

export const getAgreement = async (agreementId?: string) => {
    const url = agreementId ? `/rentals/agreements/${agreementId}` : "/rentals/agreements/my-agreement";
    const response = await axios.get(url);
    return response.data.data;
};


export const acceptAgreement = async (
    agreementId: string,
    acceptedTerms: boolean
) => {
    const response = await axios.post(
        `/rentals/agreements/${agreementId}/accept`,
        { acceptedTerms }
    );

    return response.data;
};


export const confirmAgreement = async (agreementId: string) => {
    const response = await axios.post(`/rentals/owner/agreements/${agreementId}/confirm`);
    return response.data;
};

export const getOwnerRentals = async (): Promise<OwnerRentalItem[]> => {
    const response = await axios.get("/rentals/owner/list");
    return response.data.data;
};

export const setRentSplit = async (
    rentalId: string,
    payload: {
        splitMode: "EQUAL" | "CUSTOM";
        occupants: Array<{
            tenantEmail?: string;
            tenantId?: string;
            rentAmount?: number;
            securityDepositShare?: number;
        }>;
    }
) => {
    const response = await axios.post(`/rentals/owner/${rentalId}/split`, payload);
    return response.data;
};

export const terminateRental = async (rentalId: string, reason?: string) => {
    const response = await axios.post(`/rentals/owner/${rentalId}/terminate`, { reason });
    return response.data;
};

export interface OwnerAgreementItem {
    _id: string;
    rental: {
        _id: string;
        status: string;
        splitMode?: string;
    };
    property: {
        _id: string;
        title: string;
        address?: { city: string; state: string; street?: string };
        propertyType?: string;
        price?: number;
        images?: Array<{ url: string }>;
    };
    tenant: {
        _id: string;
        name: string;
        email: string;
        phone?: string;
    };
    monthlyRent: number;
    securityDepositShare: number;
    maintenanceFee?: number;
    paymentFrequency?: string;
    noticePeriodDays?: number;
    leaseStart: string;
    leaseEnd: string;
    terms: string;
    status: string;
    tenantAcceptedAt?: string | null;
    ownerAcceptedAt?: string | null;
    paymentDeadline?: string | null;
    version?: number;
    deliveryStatus?: "PENDING" | "DELIVERED" | "FAILED";
    deliveryError?: string;
    created_at: string;
    updated_at: string;
    history?: Array<{
        version: number;
        terms: string;
        monthlyRent: number;
        securityDepositShare: number;
        modifiedAt: string;
        note?: string;
    }>;
}

export interface CreateManualAgreementPayload {
    propertyId: string;
    tenantEmail: string;
    monthlyRent: number;
    securityDeposit: number;
    maintenanceFee?: number;
    paymentFrequency?: "monthly";
    noticePeriodDays?: number;
    leaseStart: string;
    leaseEnd: string;
    terms?: string;
    autoSend?: boolean;
}

export interface UpdateAgreementPayload {
    terms?: string;
    monthlyRent?: number;
    securityDepositShare?: number;
    maintenanceFee?: number;
    leaseStart?: string;
    leaseEnd?: string;
    noticePeriodDays?: number;
    revisionNote?: string;
}

export interface TenantLookupResponse {
    id: string;
    name: string;
    email: string;
    phone?: string;
    role: string;
    isEligible: boolean;
}

export const getOwnerAgreements = async (): Promise<OwnerAgreementItem[]> => {
    const response = await axios.get("/rentals/owner/agreements");
    return response.data.data;
};

export const getOwnerAgreement = async (agreementId: string): Promise<OwnerAgreementItem> => {
    const response = await axios.get(`/rentals/owner/agreements/${agreementId}`);
    return response.data.data;
};

export const createManualAgreement = async (payload: CreateManualAgreementPayload) => {
    const response = await axios.post("/rentals/owner/agreements/manual", payload);
    return response.data;
};

export const updateAgreement = async (agreementId: string, payload: UpdateAgreementPayload) => {
    const response = await axios.put(`/rentals/owner/agreements/${agreementId}`, payload);
    return response.data;
};

export const deleteOrCancelAgreement = async (agreementId: string) => {
    const response = await axios.delete(`/rentals/owner/agreements/${agreementId}`);
    return response.data;
};

export const resendAgreementNotification = async (agreementId: string) => {
    const response = await axios.post(`/rentals/owner/agreements/${agreementId}/resend`);
    return response.data;
};

export const lookupTenant = async (email: string): Promise<TenantLookupResponse | null> => {
    const response = await axios.get(`/rentals/owner/tenants/lookup?email=${encodeURIComponent(email)}`);
    return response.data.data;
};
