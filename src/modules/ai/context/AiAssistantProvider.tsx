"use client";

import {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useRef,
    useState,
    type ReactNode,
} from "react";
import { useQueryClient } from "@tanstack/react-query";

import { extractCriteria, generateAiReply, searchProperties } from "../services/aiService";
import {
    describeCriteria,
    generateFallbackSteps,
    getNearbyCities,
    hasAnyCriteria,
    mergeCriteria,
} from "../utils/criteria";
import { rankProperties, summariseMatchesForPrompt } from "../utils/matching";
import { ASSISTANT_NAME, buildPrompt } from "../constants/assistant";
import type {
    ChatMessage,
    FallbackStep,
    MatchedProperty,
    PropertySearchCriteria,
} from "../types/ai";

let messageSeq = 0;
const nextId = (role: string) => `${role}-${(messageSeq += 1)}`;

interface AiAssistantValue {
    isOpen: boolean;
    open: () => void;
    close: () => void;

    messages: ChatMessage[];
    /** The active criteria applied to the currently displayed results (original or relaxed fallback). */
    criteria: PropertySearchCriteria;
    /** The user's original requirements preserved across broadening passes. */
    originalCriteria: PropertySearchCriteria;
    criteriaSummary: string;

    matches: MatchedProperty[];
    /** True once a search has run, so the results area knows to render. */
    hasSearched: boolean;
    /** True when current results are from a broadened/relaxed fallback search. */
    isBroadened: boolean;
    /** True if there are more fallback steps available to broaden. */
    canBroaden: boolean;
    attemptedSteps: string[];

    isThinking: boolean;
    isSearching: boolean;
    error: string | null;
    dismissError: () => void;

    sendMessage: (text: string) => Promise<void>;
    retryLastMessage: () => Promise<void>;
    broadenSearch: () => Promise<void>;
    clearResults: () => void;
}

const AiAssistantContext = createContext<AiAssistantValue | null>(null);

export const useAiAssistantContext = (): AiAssistantValue => {
    const ctx = useContext(AiAssistantContext);
    if (!ctx) {
        throw new Error("useAiAssistantContext must be used inside <AiAssistantProvider>");
    }
    return ctx;
};

/** Query key for the AI-driven search, kept alongside the property keys. */
export const aiSearchQueryKey = (criteria: PropertySearchCriteria) =>
    ["properties", "ai-search", criteria] as const;

export function AiAssistantProvider({ children }: { children: ReactNode }) {
    const queryClient = useQueryClient();

    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);

    // Separate original requirements from active fallback criteria so broadening
    // never overwrites user preferences.
    const [originalCriteria, setOriginalCriteria] = useState<PropertySearchCriteria>({});
    const [activeCriteria, setActiveCriteria] = useState<PropertySearchCriteria>({});

    const [fallbackSteps, setFallbackSteps] = useState<FallbackStep[]>([]);
    const [currentStepIndex, setCurrentStepIndex] = useState<number>(-1);
    const [attemptedSteps, setAttemptedSteps] = useState<string[]>([]);

    const [matches, setMatches] = useState<MatchedProperty[]>([]);
    const [hasSearched, setHasSearched] = useState(false);
    const [isThinking, setIsThinking] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Guards against overlapping turns (double-click, Enter spam) so one user
    // message never fires two extraction + search passes.
    const inFlight = useRef(false);
    const lastUserMessage = useRef<string | null>(null);

    const appendMessage = useCallback((role: ChatMessage["role"], content: string) => {
        setMessages((current) => [...current, { id: nextId(role), role, content }]);
    }, []);

    /**
     * Runs the real search for a set of criteria and publishes the ranked
     * matches. Results are cached under a property-scoped query key so repeat
     * criteria don't re-hit the API.
     */
    const runSearch = useCallback(
        async (next: PropertySearchCriteria): Promise<MatchedProperty[]> => {
            setIsSearching(true);
            try {
                const records = await queryClient.fetchQuery({
                    queryKey: aiSearchQueryKey(next),
                    queryFn: () => searchProperties(next),
                    staleTime: 60_000,
                });

                const ranked = rankProperties(records, next);
                setMatches(ranked);
                setHasSearched(true);
                return ranked;
            } finally {
                setIsSearching(false);
            }
        },
        [queryClient]
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
        if (inFlight.current) return;

        // Ensure fallback steps exist based on the user's original criteria
        let steps = fallbackSteps;
        if (steps.length === 0 && hasAnyCriteria(originalCriteria)) {
            steps = generateFallbackSteps(originalCriteria);
            setFallbackSteps(steps);
        }

        const nextStepIndex = currentStepIndex + 1;

        if (steps.length === 0 || nextStepIndex >= steps.length) {
            appendMessage(
                "assistant",
                "All progressive broadening options have been exhausted. No matching properties are available on SpotNest for these criteria. You can edit your requirements in chat or clear the search to start over."
            );
            return;
        }

        const step = steps[nextStepIndex];
        inFlight.current = true;
        setError(null);
        setIsSearching(true);

        try {
            setCurrentStepIndex(nextStepIndex);
            setAttemptedSteps((prev) => [...prev, step.id]);
            setActiveCriteria(step.criteria);

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
            setError("Could not widen the search. Please try again.");
        } finally {
            setIsSearching(false);
            inFlight.current = false;
        }
    }, [appendMessage, currentStepIndex, fallbackSteps, originalCriteria, runSearch]);

    const handleTurn = useCallback(
        async (text: string) => {
            const trimmed = text.trim();
            if (!trimmed || inFlight.current) return;

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

                    setOriginalCriteria(nextCriteria);
                    setActiveCriteria(nextCriteria);
                    const steps = generateFallbackSteps(nextCriteria);
                    setFallbackSteps(steps);
                    setCurrentStepIndex(-1);
                    setAttemptedSteps([]);

                    inFlight.current = true;
                    setIsSearching(true);
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
                        setError("Could not search the nearby location. Please try again.");
                    } finally {
                        setIsSearching(false);
                        inFlight.current = false;
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
                inFlight.current = true;
                lastUserMessage.current = trimmed;
                setError(null);
                appendMessage("user", trimmed);
                setIsThinking(true);
                try {
                    const context = `\nThe user is currently looking at these real SpotNest listings:\n${summariseMatchesForPrompt(
                        matches
                    )}\nAnswer using only these details. If something is not listed, say it is not specified.`;
                    const reply = await generateAiReply(
                        `${buildPrompt(messages, trimmed)}${context}`
                    );
                    appendMessage("assistant", reply);
                } catch (err: unknown) {
                    const fromResponse = (err as { response?: { data?: { message?: string } } })
                        ?.response?.data?.message;
                    const fallback = err instanceof Error ? err.message : undefined;
                    setError(
                        fromResponse ||
                            fallback ||
                            "Could not reach the assistant. Check your connection and try again."
                    );
                } finally {
                    setIsThinking(false);
                    inFlight.current = false;
                }
                return;
            }

            // 4. Standard conversational turn: extract criteria against original requirements
            inFlight.current = true;
            lastUserMessage.current = trimmed;
            setError(null);
            appendMessage("user", trimmed);
            setIsThinking(true);

            try {
                const extraction = await extractCriteria(trimmed, originalCriteria);

                if (extraction.isSearch) {
                    // If the user's message had search intent but yielded no new fields (e.g. vague broaden)
                    const extractedHasFields = hasAnyCriteria(extraction.criteria);
                    if (!extractedHasFields && !extraction.reset && hasAnyCriteria(originalCriteria)) {
                        setIsThinking(false);
                        inFlight.current = false;
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
                    setOriginalCriteria(nextCriteria);
                    setActiveCriteria(nextCriteria);
                    const steps = generateFallbackSteps(nextCriteria);
                    setFallbackSteps(steps);
                    setCurrentStepIndex(-1);
                    setAttemptedSteps([]);

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
                    `${buildPrompt(messages, trimmed)}${context}`
                );
                appendMessage("assistant", reply);
            } catch (err: unknown) {
                const fromResponse = (err as { response?: { data?: { message?: string } } })
                    ?.response?.data?.message;
                const fallback = err instanceof Error ? err.message : undefined;
                setError(
                    fromResponse ||
                        fallback ||
                        "Could not reach the assistant. Check your connection and try again."
                );
            } finally {
                setIsThinking(false);
                inFlight.current = false;
            }
        },
        [appendMessage, broadenSearch, matches, messages, originalCriteria, runSearch]
    );

    const retryLastMessage = useCallback(async () => {
        const last = lastUserMessage.current;
        if (!last) return;
        // Drop the failed turn's user bubble so the retry doesn't duplicate it.
        setMessages((current) => {
            const index = [...current].reverse().findIndex((m) => m.role === "user");
            if (index === -1) return current;
            const absolute = current.length - 1 - index;
            return current.slice(0, absolute);
        });
        await handleTurn(last);
    }, [handleTurn]);

    const clearResults = useCallback(() => {
        setOriginalCriteria({});
        setActiveCriteria({});
        setFallbackSteps([]);
        setCurrentStepIndex(-1);
        setAttemptedSteps([]);
        setMatches([]);
        setHasSearched(false);
    }, []);

    const isBroadened = currentStepIndex >= 0;
    const canBroaden = hasSearched && currentStepIndex + 1 < fallbackSteps.length;

    const value = useMemo<AiAssistantValue>(
        () => ({
            isOpen,
            open: () => setIsOpen(true),
            close: () => setIsOpen(false),
            messages,
            criteria: activeCriteria,
            originalCriteria,
            criteriaSummary: describeCriteria(activeCriteria),
            matches,
            hasSearched,
            isBroadened,
            canBroaden,
            attemptedSteps,
            isThinking,
            isSearching,
            error,
            dismissError: () => setError(null),
            sendMessage: handleTurn,
            retryLastMessage,
            broadenSearch,
            clearResults,
        }),
        [
            activeCriteria,
            attemptedSteps,
            broadenSearch,
            canBroaden,
            clearResults,
            error,
            handleTurn,
            hasSearched,
            isBroadened,
            isOpen,
            isSearching,
            isThinking,
            matches,
            messages,
            originalCriteria,
            retryLastMessage,
        ]
    );

    return <AiAssistantContext.Provider value={value}>{children}</AiAssistantContext.Provider>;
}

export { ASSISTANT_NAME };
