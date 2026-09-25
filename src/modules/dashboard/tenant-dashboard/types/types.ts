import type { PropertyAddress } from "@/src/modules/properties/types/property";

export type PaymentStatus = "paid" | "pending" | "due" | "overdue" | "failed";
export type MaintenanceStatus = "pending" | "in_progress" | "resolved" | "rejected" | "cancelled";

export interface TenantRental {
  id: string; status: "active" | "ended" | "cancelled"; monthlyRent: number; securityDeposit: number;
  leaseStart: string; leaseEnd: string; paymentFrequency: "monthly";
  property: { id: string; title: string; propertyType: string; address: PropertyAddress; image?: string; bedrooms: number; bathrooms: number; areaSqFt?: number; amenities: string[] };
  owner: { id: string; name: string; email: string; phone?: string };
}
export interface TenantPayment { id: string; type: "rent" | "security_deposit" | "late_fee" | "other"; amount: number; status: PaymentStatus; dueDate?: string; paidAt?: string; method?: string; referenceId?: string; lateFee: number; lateFeeReason?: string; createdAt: string; }
export interface PaymentSummary { totalPaid: number; outstanding: number; fine: number; recentPayment: TenantPayment | null; nextPayment: TenantPayment | null; depositStatus: "paid" | "unpaid"; }
export interface MaintenanceRequest { id: string; title: string; description: string; priority: "low" | "medium" | "high" | "urgent"; category?: string; status: MaintenanceStatus; ownerResponse?: string; resolution?: string; createdAt: string; updatedAt: string; }
export interface TenantDashboardData { rental: TenantRental | null; payments: { payments: TenantPayment[]; summary: PaymentSummary | null }; maintenance: MaintenanceRequest[]; }
export interface TenantPaymentsData { rental: TenantRental | null; payments: TenantPayment[]; summary: PaymentSummary | null; }
export interface TenantMaintenanceData { rental: TenantRental | null; requests: MaintenanceRequest[]; }
export interface CreateMaintenanceInput { title: string; description: string; priority: "low" | "medium" | "high" | "urgent"; category?: string; }
