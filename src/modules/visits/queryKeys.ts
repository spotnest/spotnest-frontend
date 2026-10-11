import type { GetAdminVisitsParams } from "./services/visitService";

export const adminVisitsQueryKey = (
    params: GetAdminVisitsParams
) => ["visits", "admin", params] as const;