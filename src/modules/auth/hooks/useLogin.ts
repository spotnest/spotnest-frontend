"use client";

import { useState } from "react";

import { login } from "../services/authServices";
import type { LoginPayload, OtpRequiredResponse } from "../types/auth";
import {
  authRequestFailed,
  authRequestStarted,
  otpRequired,
  signInSucceeded,
} from "@/src/store/slices/authSlice";
import { useAppDispatch } from "@/src/store/hook";

function isOtpRequiredResponse(
  response: Awaited<ReturnType<typeof login>>
): response is OtpRequiredResponse {
  return "requiresOtp" in response && response.requiresOtp === true;
}

export function useLogin() {
  const dispatch = useAppDispatch();

  const [isLoading, setIsLoading] = useState(false);

  const executeLogin = async (payload: LoginPayload) => {
    try {
      setIsLoading(true);
      dispatch(authRequestStarted());

      const result = await login(payload);

      if (isOtpRequiredResponse(result)) {
        dispatch(
          otpRequired({
            email: result.email,
            purpose: result.purpose,
          })
        );

        return {
          success: true,
          requiresOtp: true,
          email: result.email,
          purpose: result.purpose,
        };
      }

      if (result.user) {
        dispatch(signInSucceeded(result.user));
      }

      return {
        success: true,
        requiresOtp: false,
        user: result.user,
      };
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Login failed. Please check your credentials and try again.";

      dispatch(authRequestFailed(message));

      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    login: executeLogin,
    isLoading,
  };
}