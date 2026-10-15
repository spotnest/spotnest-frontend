"use client";

import { useMutation } from "@tanstack/react-query";
import { generateAiReply } from "../services/aiService";
import type { PropertySearchCriteria } from "../types/ai";

export const aiKeys = {
    all: ["ai"] as const,
    generate: () => ["ai", "generate"] as const,
};

/** Query key for the AI-driven search, kept alongside the property keys. */
export const aiSearchQueryKey = (criteria: PropertySearchCriteria) =>
    ["properties", "ai-search", criteria] as const;

/**
 * One request per user turn. A mutation (not a query) because each send is a
 * user-triggered action whose result is appended to local chat state rather
 * than cached — the backend keeps no conversation to re-read.
 */
export const useAiAssistant = () =>
    useMutation({
        mutationKey: aiKeys.generate(),
        mutationFn: (prompt: string) => generateAiReply(prompt),
    });
