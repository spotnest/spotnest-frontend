import api from "@/src/lib/axios";

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

export const createVisit = async (
    payload: CreateVisitPayload
): Promise<Visit> => {
    const { data } = await api.post<Visit>(
        "/visits",
        payload
    );

    return data;
};

export const getMyVisits = async (): Promise<Visit[]> => {
    const { data } = await api.get<Visit[]>(
        "/visits/my"
    );

    return data;
};

export const getOwnerVisits = async (): Promise<Visit[]> => {
    const { data } = await api.get<Visit[]>(
        "/visits/owner"
    );

    return data;
};

export const getVisitById = async (
    visitId: string
): Promise<Visit> => {
    const { data } = await api.get<Visit>(
        `/visits/${visitId}`
    );

    return data;
};

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

export const cancelVisit = async (
    visitId: string
): Promise<Visit> => {
    const { data } = await api.patch<Visit>(
        `/visits/${visitId}/cancel`
    );

    return data;
};

export const completeVisit = async (
    visitId: string
): Promise<Visit> => {
    const { data } = await api.patch<Visit>(
        `/visits/${visitId}/complete`
    );

    return data;
};