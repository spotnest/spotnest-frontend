import api from "@/src/lib/axios";
import type { AdminSettings, AdminSettingsUpdate } from "../types/settings";

export async function getAdminSettings(): Promise<AdminSettings> {
  const response = await api.get<{ success: boolean; data: AdminSettings }>("/settings");
  return response.data.data;
}

export async function updateAdminSettings(payload: AdminSettingsUpdate): Promise<AdminSettings> {
  const response = await api.patch<{ success: boolean; data: AdminSettings }>("/settings", payload);
  return response.data.data;
}
