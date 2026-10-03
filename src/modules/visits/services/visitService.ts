import api from "@/src/lib/axios";
import type { PropertyAddress } from "@/src/modules/properties/types";
export type VisitStatus =
    | "pending"
    | "accepted"
    | "rejected"
    | "rescheduled"
    | "cancelled"
    | "completed";

export interface CreateVisitPayload {
    propertyId: string;
    requestedDate: string;
    requestedTime: string;
    message?: string;
}

export interface AcceptVisitPayload {
    scheduledDate: string;
    scheduledTime: string;
}

export interface RejectVisitPayload {
    rejectionReason: string;
}

export interface RescheduleVisitPayload {
    scheduledDate: string;
    scheduledTime: string;
    rescheduleReason: string;
}

export interface Visit {
    _id: string;
    property: string;
    requester: string;
    owner: string;
    requestedDate: string;
    requestedTime: string;
    scheduledDate?: string;
    scheduledTime?: string;
    status: VisitStatus;
    message?: string;
    rejectionReason?: string;
    rescheduleReason?: string;
    created_at: string;
    updated_at: string;
}

// -----------------------------------------------------
// ADMIN VISIT TYPES
// -----------------------------------------------------

export interface AdminVisitProperty {
    _id: string;
    title: string;
    address: PropertyAddress;
    images?: string[];
}

export interface AdminVisitUser {
    _id: string;
    name: string;
    email: string;
    image?: string;
}

export interface AdminVisit
    extends Omit<
        Visit,
        "property" | "requester" | "owner"
    > {
    property: AdminVisitProperty;
    requester: AdminVisitUser;
    owner: AdminVisitUser;
}

export interface GetAdminVisitsParams {
    page?: number;
    limit?: number;
    status?: VisitStatus;
}

export interface AdminVisitsResponse {
    visits: AdminVisit[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
}

// -----------------------------------------------------
// CREATE VISIT
// -----------------------------------------------------

export const createVisit = async (
    payload: CreateVisitPayload
): Promise<Visit> => {
    const { data } = await api.post<Visit>(
        "/visits",
        payload
    );

    return data;
};

// -----------------------------------------------------
// GET MY VISITS
// -----------------------------------------------------

export const getMyVisits = async (): Promise<Visit[]> => {
    const { data } = await api.get<Visit[]>(
        "/visits/my"
    );

    return data;
};

// -----------------------------------------------------
// GET OWNER VISITS
// -----------------------------------------------------

export const getOwnerVisits = async (): Promise<Visit[]> => {
    const { data } = await api.get<Visit[]>(
        "/visits/owner"
    );

    return data;
};

// -----------------------------------------------------
// GET ADMIN VISITS
// -----------------------------------------------------

export const getAdminVisits = async (
    params: GetAdminVisitsParams = {}
): Promise<AdminVisitsResponse> => {
    const { data } =
        await api.get<AdminVisitsResponse>(
            "/visits/admin",
            {
                params,
            }
        );

    return data;
};

// -----------------------------------------------------
// GET SINGLE VISIT
// -----------------------------------------------------

export const getVisitById = async (
    visitId: string
): Promise<Visit> => {
    const { data } = await api.get<Visit>(
        `/visits/${visitId}`
    );

    return data;
};

// -----------------------------------------------------
// ACCEPT VISIT
// -----------------------------------------------------

export const acceptVisit = async (
    visitId: string,
    payload: AcceptVisitPayload
): Promise<Visit> => {
    const { data } = await api.patch<Visit>(
        `/visits/${visitId}/accept`,
        payload
    );

    return data;
};

// -----------------------------------------------------
// REJECT VISIT
// -----------------------------------------------------

export const rejectVisit = async (
    visitId: string,
    payload: RejectVisitPayload
): Promise<Visit> => {
    const { data } = await api.patch<Visit>(
        `/visits/${visitId}/reject`,
        payload
    );

    return data;
};

// -----------------------------------------------------
// RESCHEDULE VISIT
// -----------------------------------------------------

export const rescheduleVisit = async (
    visitId: string,
    payload: RescheduleVisitPayload
): Promise<Visit> => {
    const { data } = await api.patch<Visit>(
        `/visits/${visitId}/reschedule`,
        payload
    );

    return data;
};

// -----------------------------------------------------
// CANCEL VISIT
// -----------------------------------------------------

export const cancelVisit = async (
    visitId: string
): Promise<Visit> => {
    const { data } = await api.patch<Visit>(
        `/visits/${visitId}/cancel`
    );

    return data;
};

// -----------------------------------------------------
// COMPLETE VISIT
// -----------------------------------------------------

export const completeVisit = async (
    visitId: string
): Promise<Visit> => {
    const { data } = await api.patch<Visit>(
        `/visits/${visitId}/complete`
    );

    return data;
};