"use client";

import { useState } from "react";

import { signup } from "../services/authServices";
import type { SignupPayload } from "../types/auth";

import {
  authRequestFailed,
  authRequestStarted,
} from "@/src/store/slices/authSlice";
import { useAppDispatch } from "@/src/store/hook";

export function useSignup() {
  const dispatch = useAppDispatch();

  const [isLoading, setIsLoading] = useState(false);

  const executeSignup = async (payload: SignupPayload) => {
    try {
      setIsLoading(true);
      dispatch(authRequestStarted());

      const result = await signup(payload);

      return {
        success: true,
        message: result.message,
        user: result.user,
      };
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Unable to create your account. Please try again.";

      dispatch(authRequestFailed(message));

      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    signup: executeSignup,
    isLoading,
  };
}
