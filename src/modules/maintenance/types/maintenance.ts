export type MaintenanceStatus =
    | "PENDING"
    | "ACCEPTED"
    | "SCHEDULED"
    | "IN_PROGRESS"
    | "COMPLETED"
    | "REJECTED"
    | "CANCELLED";

export type MaintenanceCategory =
    | "Plumbing"
    | "Electrical"
    | "Appliance"
    | "Structural"
    | "Cleaning"
    | "Other";

export type MaintenancePriority = "Low" | "Normal" | "High" | "Emergency";

export interface MaintenanceImage {
    publicId?: string;
    url: string;
}

export interface StatusHistoryItem {
    previousStatus?: MaintenanceStatus;
    newStatus: MaintenanceStatus;
    changedBy: {
        id: string;
        name?: string;
        role?: string;
    };
    note?: string;
    timestamp: string;
}

export interface MaintenanceRequest {
    id: string;
    property: {
        id: string;
        title: string;
        address?: {
            street?: string;
            city?: string;
            state?: string;
            zipCode?: string;
        };
    };
    tenant: {
        id: string;
        name: string;
        email: string;
        phone?: string;
    };
    owner: {
        id: string;
        name: string;
        email: string;
        phone?: string;
    };
    rentalId: string;
    title: string;
    description: string;
    category: MaintenanceCategory;
    priority: MaintenancePriority;
    images: MaintenanceImage[];
    status: MaintenanceStatus;
    preferredVisitDate?: string;
    scheduledDate?: string;
    rejectionReason?: string;
    resolutionNote?: string;
    tenantNotes?: string;
    statusHistory: StatusHistoryItem[];
    createdAt: string;
    updatedAt: string;
}

export interface MaintenanceSummary {
    pending: number;
    accepted: number;
    scheduled: number;
    inProgress: number;
    completed: number;
    rejected: number;
    cancelled: number;
    total: number;
}

export interface EligibleProperty {
    rentalId: string;
    property: {
        id: string;
        title: string;
        propertyType?: string;
        address?: any;
        images?: { url: string }[];
    };
    owner: {
        id: string;
        name: string;
    };
}

export interface ListMaintenanceParams {
    status?: string;
    priority?: string;
    category?: string;
    propertyId?: string;
    search?: string;
    page?: number;
    limit?: number;
}

export interface ListMaintenanceResponse {
    requests: MaintenanceRequest[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
}

export interface UpdateStatusPayload {
    status: MaintenanceStatus;
    rejectionReason?: string;
    scheduledDate?: string;
    resolutionNote?: string;
    note?: string;
}
