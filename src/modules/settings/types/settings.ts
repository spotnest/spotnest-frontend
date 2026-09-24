export interface AdminSettings {
  ownerApprovalRequired: boolean;
  emailVerificationRequired: boolean;
  userRegistrationEnabled: boolean;
  ownerRegistrationEnabled: boolean;
  propertyApprovalRequired: boolean;
  propertyListingEnabled: boolean;
  newOwnerRegistrationAlerts: boolean;
  ownerApprovalEmails: boolean;
  platformName: string;
  supportEmail: string;
  supportPhone: string;
  currency: string;
  timezone: string;
  defaultPaginationLimit: number;
  maintenanceMode: boolean;
}

export type AdminSettingsUpdate = Partial<AdminSettings>;
