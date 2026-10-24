"use client";

import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { useAppDispatch, useAppStore } from "@/src/store/hook";
import {
    broadenStepApplied,
    errorCleared,
    errorOccurred,
    fallbackStepsGenerated,
    lastUserMessageStored,
    lastUserTurnDropped,
    matchesResolved,
    messageAppended,
    searchRequirementsApplied,
    searchStarted,
    searchStopped,
    thinkingStarted,
    thinkingStopped,
    turnEnded,
    turnStarted,
} from "@/src/store/slices/aiAssistantSlice";

import { extractCriteria, generateAiReply, searchProperties } from "../services/aiService";
import {
    describeCriteria,
    generateFallbackSteps,
    getNearbyCities,
    hasAnyCriteria,
    mergeCriteria,
} from "../utils/criteria";
import { rankProperties, summariseMatchesForPrompt } from "../utils/matching";
import { buildPrompt } from "../constants/assistant";
import type { ChatMessage, MatchedProperty, PropertySearchCriteria } from "../types/ai";
import { aiSearchQueryKey } from "./useAiAssistant";

/**
 * The AI assistant's async orchestration: requirement collection, AI
 * processing, property matching and progressive broadening.
 *
 * All shared state lives in the `aiAssistant` Redux slice; this hook only
 * dispatches into it and reads the latest state through the store, so every
 * component that calls it drives the same single source of truth.
 */
export const useAiAssistantActions = () => {
    const queryClient = useQueryClient();
    const dispatch = useAppDispatch();
    const store = useAppStore();

    const appendMessage = useCallback(
        (role: ChatMessage["role"], content: string) => {
            dispatch(messageAppended({ role, content }));
        },
        [dispatch]
    );

    /**
     * Runs the real search for a set of criteria and publishes the ranked
     * matches. Results are cached under a property-scoped query key so repeat
     * criteria don't re-hit the API.
     */
    const runSearch = useCallback(
        async (next: PropertySearchCriteria): Promise<MatchedProperty[]> => {
            dispatch(searchStarted());
            try {
                const records = await queryClient.fetchQuery({
                    queryKey: aiSearchQueryKey(next),
                    queryFn: () => searchProperties(next),
                    staleTime: 60_000,
                });

                const ranked = rankProperties(records, next);
                dispatch(matchesResolved(ranked));
                return ranked;
            } finally {
                dispatch(searchStopped());
            }
        },
        [dispatch, queryClient]
    );

    /**
     * Executes the next progressive broadening step.
     *
     * Follows a predictable, finite fallback sequence:
     * 1. Relax amenities
     * 2. Relax budget slightly (bounded, at most once)
     * 3. Relax property type
     * 4. Relax bedrooms
     * 5. Expand location to valid nearby cities
     *
     * Stops once all steps are exhausted. Never increases the budget indefinitely.
     */
    const broadenSearch = useCallback(async () => {
        const state = store.getState().aiAssistant;
        if (state.isTurnInFlight) return;

        const { originalCriteria } = state;

        // Ensure fallback steps exist based on the user's original criteria
        let steps = state.fallbackSteps;
        if (steps.length === 0 && hasAnyCriteria(originalCriteria)) {
            steps = generateFallbackSteps(originalCriteria);
            dispatch(fallbackStepsGenerated(steps));
        }

        const nextStepIndex = state.currentStepIndex + 1;

        if (steps.length === 0 || nextStepIndex >= steps.length) {
            appendMessage(
                "assistant",
                "All progressive broadening options have been exhausted. No matching properties are available on SpotNest for these criteria. You can edit your requirements in chat or clear the search to start over."
            );
            return;
        }

        const step = steps[nextStepIndex];
        dispatch(turnStarted());
        dispatch(errorCleared());
        dispatch(searchStarted());

        try {
            dispatch(
                broadenStepApplied({
                    stepIndex: nextStepIndex,
                    stepId: step.id,
                    criteria: step.criteria,
                })
            );

            const ranked = await runSearch(step.criteria);
            const remainingSteps = steps.length - 1 - nextStepIndex;

            if (ranked.length > 0) {
                appendMessage(
                    "assistant",
                    `Broadened the search: ${step.description}. Found ${ranked.length} ${
                        ranked.length === 1 ? "property" : "properties"
                    } matching ${describeCriteria(step.criteria) || "listings"}.`
                );
            } else if (remainingSteps > 0) {
                appendMessage(
                    "assistant",
                    `${step.description}. Still no matching properties found. You can broaden the search further or adjust your criteria in chat.`
                );
            } else {
                appendMessage(
                    "assistant",
                    `${step.description}. All progressive broadening steps have now been exhausted, and no matching properties were found. Try searching in another city or starting a new search.`
                );
            }
        } catch {
            dispatch(errorOccurred("Could not widen the search. Please try again."));
        } finally {
            dispatch(searchStopped());
            dispatch(turnEnded());
        }
    }, [appendMessage, dispatch, runSearch, store]);

    const handleTurn = useCallback(
        async (text: string) => {
            const trimmed = text.trim();
            if (!trimmed || store.getState().aiAssistant.isTurnInFlight) return;

            // Snapshot of the transcript before this turn's bubbles are added:
            // buildPrompt takes the prior history plus the new message.
            const history = store.getState().aiAssistant.messages;
            const { originalCriteria, matches } = store.getState().aiAssistant;

            const lower = trimmed.toLowerCase();

            // 1. Broaden search intent from chat (e.g. "Broaden the search", "widen search")
            const isBroadenText =
                lower === "broaden search" ||
                lower === "broaden the search" ||
                lower === "widen search" ||
                lower === "widen the search" ||
                lower === "broaden" ||
                lower === "widen" ||
                lower === "relax filters" ||
                lower === "relax criteria" ||
                lower === "expand search" ||
                lower === "expand the search";

            if (isBroadenText) {
                appendMessage("user", trimmed);
                await broadenSearch();
                return;
            }

            // 2. Nearby location intent from chat (e.g. "Try a nearby location")
            const isNearbyText =
                lower === "try a nearby location" ||
                lower === "try nearby location" ||
                lower === "try nearby" ||
                lower === "search nearby location" ||
                lower === "search nearby" ||
                lower === "nearby location";

            if (isNearbyText && originalCriteria.city) {
                appendMessage("user", trimmed);
                const nearby = getNearbyCities(originalCriteria.city);
                if (nearby.length > 0) {
                    const targetCity = nearby[0];
                    const nextCriteria: PropertySearchCriteria = {
                        ...originalCriteria,
                        city: targetCity,
                    };

                    dispatch(
                        searchRequirementsApplied({
                            criteria: nextCriteria,
                            fallbackSteps: generateFallbackSteps(nextCriteria),
                        })
                    );

                    dispatch(turnStarted());
                    dispatch(searchStarted());
                    try {
                        const ranked = await runSearch(nextCriteria);
                        const desc = describeCriteria(nextCriteria);
                        if (ranked.length === 0) {
                            appendMessage(
                                "assistant",
                                `No matching properties found in nearby ${targetCity} for ${desc}. You can broaden the search or try another city.`
                            );
                        } else {
                            appendMessage(
                                "assistant",
                                `Found ${ranked.length} ${
                                    ranked.length === 1 ? "property" : "properties"
                                } in nearby ${targetCity} matching ${desc}.`
                            );
                        }
                    } catch {
                        dispatch(
                            errorOccurred("Could not search the nearby location. Please try again.")
                        );
                    } finally {
                        dispatch(searchStopped());
                        dispatch(turnEnded());
                    }
                    return;
                } else {
                    appendMessage(
                        "assistant",
                        `No specific nearby locations are configured for ${originalCriteria.city}. You can specify another city such as Thrissur, Kochi, Calicut, or Kannur.`
                    );
                    return;
                }
            }

            // 3. Comparison or general questions about current results: do NOT trigger a search pass
            const isComparison =
                matches.length > 0 &&
                (lower.includes("compare") ||
                    lower.includes("difference") ||
                    lower.includes("which is better") ||
                    lower.includes("which one is better") ||
                    lower.includes("which is best") ||
                    lower.includes("which one is best") ||
                    lower.includes("cheaper") ||
                    lower.includes("recommend"));

            if (isComparison) {
                dispatch(turnStarted());
                dispatch(lastUserMessageStored(trimmed));
                dispatch(errorCleared());
                appendMessage("user", trimmed);
                dispatch(thinkingStarted());
                try {
                    const context = `\nThe user is currently looking at these real SpotNest listings:\n${summariseMatchesForPrompt(
                        matches
                    )}\nAnswer using only these details. If something is not listed, say it is not specified.`;
                    const reply = await generateAiReply(
                        `${buildPrompt(history, trimmed)}${context}`
                    );
                    appendMessage("assistant", reply);
                } catch (err: unknown) {
                    const fromResponse = (err as { response?: { data?: { message?: string } } })
                        ?.response?.data?.message;
                    const fallback = err instanceof Error ? err.message : undefined;
                    dispatch(
                        errorOccurred(
                            fromResponse ||
                                fallback ||
                                "Could not reach the assistant. Check your connection and try again."
                        )
                    );
                } finally {
                    dispatch(thinkingStopped());
                    dispatch(turnEnded());
                }
                return;
            }

            // 4. Standard conversational turn: extract criteria against original requirements
            dispatch(turnStarted());
            dispatch(lastUserMessageStored(trimmed));
            dispatch(errorCleared());
            appendMessage("user", trimmed);
            dispatch(thinkingStarted());

            try {
                const extraction = await extractCriteria(trimmed, originalCriteria);

                if (extraction.isSearch) {
                    // If the user's message had search intent but yielded no new fields (e.g. vague broaden)
                    const extractedHasFields = hasAnyCriteria(extraction.criteria);
                    if (!extractedHasFields && !extraction.reset && hasAnyCriteria(originalCriteria)) {
                        dispatch(thinkingStopped());
                        dispatch(turnEnded());
                        await broadenSearch();
                        return;
                    }

                    const base = extraction.reset ? {} : originalCriteria;
                    const nextCriteria = mergeCriteria(base, extraction.criteria);

                    if (!hasAnyCriteria(nextCriteria)) {
                        appendMessage(
                            "assistant",
                            "Tell me a bit more — which city, how many bedrooms, and your monthly budget?"
                        );
                        return;
                    }

                    // Update original requirements and reset active fallback progression
                    dispatch(
                        searchRequirementsApplied({
                            criteria: nextCriteria,
                            fallbackSteps: generateFallbackSteps(nextCriteria),
                        })
                    );

                    const ranked = await runSearch(nextCriteria);
                    const description = describeCriteria(nextCriteria);

                    if (ranked.length === 0) {
                        appendMessage(
                            "assistant",
                            `No matching properties found for ${description}. I can widen the search — try raising the budget, dropping an amenity, or searching a nearby city.`
                        );
                        return;
                    }

                    appendMessage(
                        "assistant",
                        `I found ${ranked.length} ${
                            ranked.length === 1 ? "property" : "properties"
                        } matching ${description}. They're shown on the page behind this panel.`
                    );
                    return;
                }

                // Not a search: answer conversationally, grounded in real listings currently on screen
                const context = matches.length
                    ? `\nThe user is currently looking at these real SpotNest listings:\n${summariseMatchesForPrompt(
                          matches
                      )}\nAnswer using only these details. If something is not listed, say it is not specified.`
                    : "";

                const reply = await generateAiReply(
                    `${buildPrompt(history, trimmed)}${context}`
                );
                appendMessage("assistant", reply);
            } catch (err: unknown) {
                const fromResponse = (err as { response?: { data?: { message?: string } } })
                    ?.response?.data?.message;
                const fallback = err instanceof Error ? err.message : undefined;
                dispatch(
                    errorOccurred(
                        fromResponse ||
                            fallback ||
                            "Could not reach the assistant. Check your connection and try again."
                    )
                );
            } finally {
                dispatch(thinkingStopped());
                dispatch(turnEnded());
            }
        },
        [appendMessage, broadenSearch, dispatch, runSearch, store]
    );

    const retryLastMessage = useCallback(async () => {
        const last = store.getState().aiAssistant.lastUserMessage;
        if (!last) return;
        // Drop the failed turn's user bubble so the retry doesn't duplicate it.
        dispatch(lastUserTurnDropped());
        await handleTurn(last);
    }, [dispatch, handleTurn, store]);

    return {
        sendMessage: handleTurn,
        retryLastMessage,
        broadenSearch,
    };
};
