import type {
  Property,
  PropertyAddress,
  PropertyListParams,
  PropertyListResponse,
  PropertyStatus,
  PropertyType,
} from "../types/property";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

/**
 * Normalizes raw backend property documents (including legacy DB records)
 * to strictly adhere to the frontend Property interface.
 */
export function normalizeProperty(raw: Record<string, unknown>): Property {
  if (!raw || typeof raw !== "object") {
    throw new Error("Invalid property data received from backend");
  }

  const rawAddress = raw.address as Record<string, unknown> | string | undefined;
  let address: PropertyAddress;
  if (rawAddress && typeof rawAddress === "object") {
    address = {
      street: String(rawAddress.street || ""),
      city: String(rawAddress.city || ""),
      state: String(rawAddress.state || ""),
      zipCode: String(rawAddress.zipCode || ""),
      country: String(rawAddress.country || "India"),
    };
  } else {
    const addrStr = String(rawAddress || "");
    address = {
      street: addrStr,
      city: addrStr,
      state: "",
      zipCode: "",
      country: "India",
    };
  }

  const rawPrice = typeof raw.price === "number"
    ? raw.price
    : (typeof raw.monthlyRent === "number"
      ? raw.monthlyRent
      : (typeof raw.rent === "number"
        ? raw.rent
        : (raw.price ? Number(raw.price) : 0)));

  const imagesArr = Array.isArray(raw.images)
    ? raw.images.map((img: unknown) => {
        if (typeof img === "string") {
          return { url: img, publicId: "" };
        }
        const imgObj = img as Record<string, unknown> | undefined;
        return {
          url: String(imgObj?.url || ""),
          publicId: String(imgObj?.publicId || ""),
        };
      })
    : [];

  const rawOwner = raw.owner as Record<string, unknown> | string | undefined;
  const ownerStr = typeof rawOwner === "string"
    ? rawOwner
    : (rawOwner && typeof rawOwner === "object" && rawOwner._id
      ? String(rawOwner._id)
      : String(raw.ownerId || ""));

  return {
    _id: String(raw._id || raw.id || ""),
    owner: ownerStr,
    title: String(raw.title || raw.name || "Untitled Property"),
    description: String(raw.description || ""),
    propertyType: (raw.propertyType || "apartment") as PropertyType,
    price: isNaN(rawPrice) ? 0 : rawPrice,
    bedrooms: typeof raw.bedrooms === "number" ? raw.bedrooms : 0,
    bathrooms: typeof raw.bathrooms === "number" ? raw.bathrooms : 0,
    areaSqFt: typeof raw.areaSqFt === "number" ? raw.areaSqFt : undefined,
    amenities: Array.isArray(raw.amenities) ? raw.amenities.map(String) : [],
    address,
    images: imagesArr,
    status: (raw.status || "active") as PropertyStatus,
    created_at: String(raw.created_at || raw.createdAt || new Date().toISOString()),
    updated_at: String(raw.updated_at || raw.updatedAt || new Date().toISOString()),
  };
}

const buildQueryString = (params?: PropertyListParams) => {
  if (!params) return "";

  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(key, String(value));
    }
  });

  const query = searchParams.toString();

  return query ? `?${query}` : "";
};

export async function getProperties(
  params?: PropertyListParams
): Promise<PropertyListResponse> {
  const query = buildQueryString(params);

  const response = await fetch(`${API_URL}/properties${query}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
    next: {
      revalidate: 60,
      tags: ["properties"],
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch properties");
  }

  const data = await response.json();
  const rawItems = Array.isArray(data.items)
    ? data.items
    : (Array.isArray(data.properties)
      ? data.properties
      : (Array.isArray(data) ? data : []));

  const items = rawItems.map(normalizeProperty);

  const pagination = data.pagination || {
    page: params?.page || 1,
    limit: params?.limit || 10,
    total: items.length,
    pages: Math.ceil(items.length / (params?.limit || 10)) || 1,
  };

  return { items, pagination };
}

export async function getProperty(
  id: string
): Promise<Property> {
  const response = await fetch(`${API_URL}/properties/${id}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
    next: {
      revalidate: 60,
      tags: [`property-${id}`],
    },
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("Property not found");
    }

    throw new Error("Failed to fetch property");
  }

  const data = await response.json();
  const rawProperty = data.property || data.data || data;

  return normalizeProperty(rawProperty);
}