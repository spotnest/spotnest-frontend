import type { NearbyPropertyParams } from "./types";

// Nearby cache entries vary with the user's saved location so location changes
// trigger a fresh fetch.
export const nearbyPropertiesQueryKey = (
    params: NearbyPropertyParams,
    locationName: string | null
) => ["properties", "nearby", params, locationName] as const;