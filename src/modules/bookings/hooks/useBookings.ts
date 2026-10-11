import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAppSelector } from "@/src/store/hook";
import { createBooking, getMyBookings, getOwnerBookingRequests, reviewBooking } from "../services/bookingService";

export const bookingKeys = {
    all: ["bookings"] as const,
    mine: ["bookings", "mine"] as const,
    ownerRequests: ["bookings", "owner", "requests"] as const,
};

export const useCreateBooking = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createBooking,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: bookingKeys.mine });
        },
    });
};

export const useMyBookings = () => {
    const role = useAppSelector((state) => state.auth.user?.role);
    return useQuery({
        queryKey: bookingKeys.mine,
        queryFn: getMyBookings,
        enabled: role === "user" || role === "tenant",
    });
};

export const useOwnerBookingRequests = () => {
    const role = useAppSelector((state) => state.auth.user?.role);
    return useQuery({
        queryKey: bookingKeys.ownerRequests,
        queryFn: getOwnerBookingRequests,
        enabled: role === "owner",
    });
};

export const useReviewBooking = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: reviewBooking,
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: bookingKeys.ownerRequests });
            void queryClient.invalidateQueries({ queryKey: bookingKeys.mine });
        },
    });
};
