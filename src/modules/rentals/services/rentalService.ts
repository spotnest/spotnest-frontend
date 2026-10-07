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
        tenantAcceptedAt?: string;
        ownerAcceptedAt?: string;
    } | null;
    payments: Array<{
        id: string;
        type: string;
        amount: number;
        status: string;
        dueDate?: string;
        paidAt?: string;
        billingMonth?: string;
        razorpayOrderId?: string;
        created_at: string;
    }>;
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
        tenantAcceptedAt?: string;
        ownerAcceptedAt?: string;
        monthlyPaymentStatus: string;
        latestPaymentAmount?: number;
        latestPaymentMonth?: string;
    }>;
}

export const getMyRental = async (): Promise<TenantRentalResponse | null> => {
    const response = await axios.get("/rentals/my-rental");
    return response.data.data;
};

export const getAgreement = async (agreementId?: string) => {
    const url = agreementId ? `/rentals/agreements/${agreementId}` : "/rentals/agreements/my-agreement";
    const response = await axios.get(url);
    return response.data.data;
};

export const acceptAgreement = async (agreementId: string) => {
    const response = await axios.post(`/rentals/agreements/${agreementId}/accept`);
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
