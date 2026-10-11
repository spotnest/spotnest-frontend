"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { adminVisitsQueryKey } from "../queryKeys";
import {
    getAdminVisits,
    type AdminVisitsResponse,
    type GetAdminVisitsParams,
} from "../services/visitService";

export const useAdminVisits = (
    params: GetAdminVisitsParams = {},
    enabled = true
) => {
    return useQuery<AdminVisitsResponse, Error>({
        queryKey: adminVisitsQueryKey(params),
        queryFn: () => getAdminVisits(params),
        placeholderData: keepPreviousData,
        enabled,
    });
};