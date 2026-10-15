import type { PropertyAddress } from "@/src/modules/properties/types/property";
import type {
    MaintenancePriority,
    MaintenanceRequest as CanonicalMaintenanceRequest,
    MaintenanceStatus as CanonicalMaintenanceStatus,
} from "@/src/modules/maintenance/types/maintenance";

export type PaymentStatus = "paid" | "pending" | "due" | "overdue" | "failed" | "PAID" | "PENDING" | "DUE" | "OVERDUE" | "FAILED";
// Maintenance is served by the maintenance module, so these mirror its enums
// rather than the lowercase names this dashboard used before that move.
export type MaintenanceStatus = CanonicalMaintenanceStatus;

export interface TenantRental {
  id: string; bookingId: string; status: "scheduled" | "active" | "ended" | "cancelled"; monthlyRent: number; securityDeposit: number;
  leaseStart: string; leaseEnd: string; paymentFrequency: "monthly";
  property: { id: string; title: string; propertyType: string; address: PropertyAddress; image?: string; bedrooms: number; bathrooms: number; areaSqFt?: number; amenities: string[] };
  owner: { id: string; name: string; email: string; phone?: string };
}
export interface TenantPayment { id: string; type: "ADVANCE" | "MONTHLY_RENT" | "rent" | "security_deposit" | "late_fee" | "other"; amount: number; status: PaymentStatus; dueDate?: string; paidAt?: string; method?: string; referenceId?: string; lateFee: number; lateFeeReason?: string; billingMonth?: string; createdAt: string; }
export interface PaymentSummary { totalPaid: number; outstanding: number; fine: number; recentPayment: TenantPayment | null; nextPayment: TenantPayment | null; depositStatus: "paid" | "unpaid"; }
/** The trimmed shape the dashboard overview returns for recent activity. */
export interface MaintenanceRequest { id: string; title: string; description: string; priority: MaintenancePriority; category?: string; status: MaintenanceStatus; rejectionReason?: string; resolutionNote?: string; createdAt: string; updatedAt: string; }
export interface TenantDashboardData { rental: TenantRental | null; payments: { payments: TenantPayment[]; summary: PaymentSummary | null }; maintenance: MaintenanceRequest[]; }
export interface TenantPaymentsData { rental: TenantRental | null; payments: TenantPayment[]; summary: PaymentSummary | null; }
// GET /tenant/maintenance delegates to the maintenance module, so it returns
// that module's full request objects.
export interface TenantMaintenanceData { rental: TenantRental | null; requests: CanonicalMaintenanceRequest[]; }
export interface CreateMaintenanceInput { title: string; description: string; priority: MaintenancePriority; category?: string; }
