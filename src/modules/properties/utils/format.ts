import type { PropertyType } from "../types";

export const propertyTypeLabels: Record<PropertyType, string> = {
    apartment: "Apartment",
    house: "House",
    villa: "Villa",
    studio: "Studio",   
    room: "Room",
};

export const formatPrice = (price: number | null | undefined) => {
    if (typeof price !== "number" || !Number.isFinite(price)) {
        return "Price unavailable";
    }

    return `₹${price.toLocaleString("en-IN")}/month`;
};