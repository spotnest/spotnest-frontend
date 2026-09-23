"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);

  const executeLogout = async () => {
    try {
      setIsLoading(true);
      dispatch(authRequestStarted());

      /*
       * The backend clears the HTTP-only authentication cookies.
       */
      await logout();
    } catch (error: unknown) {
      /*
       * Even if the backend request fails, clear the local
       * authentication state. The user should not remain
       * logged in in the UI after requesting logout.
       */
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Logout request failed.";

      dispatch(authRequestFailed(message));
    } finally {
      /*
       * Always clear client storage items if any exist.
       */
      if (typeof window !== "undefined") {
        localStorage.removeItem("user");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        sessionStorage.clear();
      }

      /*
       * Always clear Redux authentication state.
       */
      dispatch(signedOut());

      /*
       * Remove private server-state data from TanStack Query.
       */
      queryClient.clear();

      setIsLoading(false);

      /*
       * Redirect to login page and replace navigation history.
       */
      router.replace("/login");
    }
  };

  return {
    logout: executeLogout,
    isLoading,
  };
}