"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createMaintenance, getTenantDashboard, getTenantMaintenance, getTenantPayments, getTenantRental } from "../services/service";

export const tenantKeys = { dashboard: ["tenant", "dashboard"] as const, rental: ["tenant", "rental"] as const, payments: ["tenant", "payments"] as const, maintenance: ["tenant", "maintenance"] as const };
export const useTenantDashboard = () => useQuery({ queryKey: tenantKeys.dashboard, queryFn: getTenantDashboard });
export const useTenantRental = () => useQuery({ queryKey: tenantKeys.rental, queryFn: getTenantRental });
export const useTenantPayments = () => useQuery({ queryKey: tenantKeys.payments, queryFn: getTenantPayments });
export const useTenantMaintenance = () => useQuery({ queryKey: tenantKeys.maintenance, queryFn: getTenantMaintenance });
export const useCreateMaintenance = () => { const client = useQueryClient(); return useMutation({ mutationFn: createMaintenance, onSuccess: () => { void client.invalidateQueries({ queryKey: tenantKeys.maintenance }); void client.invalidateQueries({ queryKey: tenantKeys.dashboard }); } }); };
