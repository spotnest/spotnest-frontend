"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { nearbyPropertiesQueryKey } from "../queryKeys";
import { getNearbyProperties } from "../services/propertyService";
import type {
    NearbyPropertyParams,
    NearbyPropertyResponse,
} from "../types";

// Do not auto-retry client errors (4xx): a 400 "set your location first"
// response from /properties/nearby is handled as UI state, not a transient
// failure. Network/server errors still get React Query's default retries.
const retry = (failureCount: number, error: unknown) => {
    if (axios.isAxiosError(error) && error.response && error.response.status >= 400 && error.response.status < 500) {
        return false;
    }
    return failureCount < 3;
};

export const useNearbyProperties = (
    params: NearbyPropertyParams,
    options: { enabled: boolean; locationName: string | null | undefined }
) => {
    return useQuery<NearbyPropertyResponse, Error>({
        queryKey: nearbyPropertiesQueryKey(params, options.locationName ?? null),
        queryFn: () => getNearbyProperties(params),
        placeholderData: keepPreviousData,
        retry,
        enabled: options.enabled,
    });
};