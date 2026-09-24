import type { PropertyListParams, PropertyType } from "../types";

export const PROPERTY_TYPES: { value: PropertyType | ""; label: string }[] = [
  { value: "", label: "All types" },
  { value: "apartment", label: "Apartment" },
  { value: "house", label: "House" },
  { value: "villa", label: "Villa" },
  { value: "studio", label: "Studio" },
  { value: "room", label: "Room" },
];

export const PRICE_RANGES: { label: string; min?: number; max?: number }[] = [
  { label: "Any budget", min: undefined, max: undefined },
  { label: "Under ₹15,000", min: undefined, max: 15000 },
  { label: "₹15,000 – ₹30,000", min: 15000, max: 30000 },
  { label: "Over ₹30,000", min: 30000, max: undefined },
];

export const DEFAULT_LIMIT = 9;

export interface ParsedPropertyParams {
  page: number;
  budget?: number;
  city?: string;
  propertyType?: PropertyType;
}

const toSingle = (value: string | string[] | undefined): string | undefined =>
  typeof value === "string" ? value : undefined;

const toInt = (value: string | string[] | undefined): number | undefined => {
  const raw = toSingle(value);
  if (!raw) return undefined;
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const toValidBudget = (index: number | undefined): number | undefined => {
  if (index === undefined) return undefined;
  return index >= 0 && index < PRICE_RANGES.length ? index : undefined;
};

const toValidType = (value: string | undefined): PropertyType | undefined => {
  if (!value) return undefined;
  return PROPERTY_TYPES.some((type) => type.value === value)
    ? (value as PropertyType)
    : undefined;
};

// Maps validated URL searchParams to the API list params. Garbage/out-of-range
// values fall back to "no filter" instead of being passed downstream as NaN.
export function parsePropertySearchParams(
  searchParams: Record<string, string | string[] | undefined>
): ParsedPropertyParams {
  const page = toInt(searchParams.page);
  const budget = toValidBudget(toInt(searchParams.budget));
  const city = toSingle(searchParams.city)?.trim();
  const propertyType = toValidType(toSingle(searchParams.type));

  return {
    page: page !== undefined && page >= 1 ? Math.floor(page) : 1,
    ...(budget !== undefined ? { budget } : {}),
    ...(city ? { city } : {}),
    ...(propertyType ? { propertyType } : {}),
  };
}

export function budgetToPriceRange(budget?: number): { minPrice?: number; maxPrice?: number } | undefined {
  if (budget === undefined) return undefined;
  const range = PRICE_RANGES[budget];
  if (!range) return undefined;
  return {
    ...(range.min !== undefined ? { minPrice: range.min } : {}),
    ...(range.max !== undefined ? { maxPrice: range.max } : {}),
  };
}

export function toApiParams(params: ParsedPropertyParams): PropertyListParams {
  const price = budgetToPriceRange(params.budget);
  return {
    page: params.page,
    limit: DEFAULT_LIMIT,
    city: params.city,
    propertyType: params.propertyType,
    ...(price?.minPrice !== undefined ? { minPrice: price.minPrice } : {}),
    ...(price?.maxPrice !== undefined ? { maxPrice: price.maxPrice } : {}),
  };
}

// Rebuilds the URL query (only non-default values) so pagination links can
// navigate between pages while keeping every active filter.
export function buildPropertyQuery(
  params: ParsedPropertyParams,
  overrides: Partial<ParsedPropertyParams> = {}
): Record<string, string> {
  const merged = { ...params, ...overrides };
  const query: Record<string, string> = {};
  if (merged.page > 1) query.page = String(merged.page);
  if (merged.budget && merged.budget > 0) query.budget = String(merged.budget);
  if (merged.city) query.city = merged.city;
  if (merged.propertyType) query.type = merged.propertyType;
  return query;
}