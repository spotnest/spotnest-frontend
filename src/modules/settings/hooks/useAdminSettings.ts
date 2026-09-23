"use client";

import { useQuery } from "@tanstack/react-query";
import { getAdminSettings } from "../services/admin-settings";

export function useAdminSettings() {
  return useQuery({ queryKey: ["admin-settings"],
     queryFn: getAdminSettings });
}
