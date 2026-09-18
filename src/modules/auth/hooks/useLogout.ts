"use client";

import { useState } from "react";

import { logout } from "../services/authServices";
import {
  authRequestStarted,
  signedOut,
  authRequestFailed,
} from "@/src/store/slices/authSlice";
import { useAppDispatch } from "@/src/store/hook";
import { queryClient } from "@/src/lib/queryClient";

export function useLogout() {
  const dispatch = useAppDispatch();

  const [isLoading, setIsLoading] = useState(false);

  const executeLogout = async () => {
    try {
      setIsLoading(true);
      dispatch(authRequestStarted());

      /*
       * The backend clears the HTTP-only authentication cookies.
       */
      await logout();
    } catch (error: any) {
      /*
       * Even if the backend request fails, clear the local
       * authentication state. The user should not remain
       * logged in in the UI after requesting logout.
       */
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Logout request failed.";

      dispatch(authRequestFailed(message));

      throw error;
    } finally {
      /*
       * Always clear Redux authentication state.
       */
      dispatch(signedOut());

      /*
       * Remove private server-state data from TanStack Query.
       *
       * This prevents data belonging to the previous user
       * from remaining in the client cache.
       */
      queryClient.clear();

      setIsLoading(false);
    }
  };

  return {
    logout: executeLogout,
    isLoading,
  };
}