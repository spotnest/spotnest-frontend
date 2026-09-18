import type {
  Property,
  PropertyListParams,
  PropertyListResponse,
} from "../types/property";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

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

  return response.json();
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

  return response.json();
}