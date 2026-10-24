"use client";

import { Loader2, Sparkles, X } from "lucide-react";

import PropertyCard from "@/src/modules/properties/components/PropertyCard";
import type { PropertySummary } from "@/src/modules/properties/types";
import { useAppDispatch, useAppSelector } from "@/src/store/hook";
import {
    assistantOpened,
    resultsCleared,
    selectAiCanBroaden,
    selectAiCriteriaSummary,
    selectAiIsBroadened,
} from "@/src/store/slices/aiAssistantSlice";
import { useAiAssistantActions } from "../hooks/useAiAssistantActions";
import { ASSISTANT_NAME } from "../constants/assistant";
import { useEffect, useRef } from "react";

/**
 * AI-matched results, rendered in the listing area above the normal grid.
 *
 * Every card is a real record from GET /properties/:id and is rendered with the
 * existing PropertyCard, so images, price formatting and the /properties/[id]
 * link all behave exactly as they do elsewhere. The match explanation is added
 * around the card rather than inside it, leaving PropertyCard untouched.
 */
export default function AiResultsSection() {
    const dispatch = useAppDispatch();

    const hasSearched = useAppSelector((state) => state.aiAssistant.hasSearched);
    const matches = useAppSelector((state) => state.aiAssistant.matches);
    const isSearching = useAppSelector((state) => state.aiAssistant.isSearching);
    const criteriaSummary = useAppSelector(selectAiCriteriaSummary);
    const isBroadened = useAppSelector(selectAiIsBroadened);
    const canBroaden = useAppSelector(selectAiCanBroaden);

    const { broadenSearch } = useAiAssistantActions();

    const clearResults = () => dispatch(resultsCleared());
    const open = () => dispatch(assistantOpened());

    const sectionRef = useRef<HTMLElement | null>(null);
    const searchStartedRef = useRef(false);

    useEffect(() => {
        // Track when a new property search starts.
        if (isSearching) {
            searchStartedRef.current = true;
            return;
        }

        // Do not scroll for ordinary chat or comparison messages.
        if (!searchStartedRef.current) return;

        searchStartedRef.current = false;

        // Scroll only when real matching properties are available.
        if (matches.length === 0) return;

        const frameId = window.requestAnimationFrame(() => {
            sectionRef.current?.scrollIntoView({
                behavior: "smooth",
                block: "start",
            });
        });

        return () => window.cancelAnimationFrame(frameId);
    }, [isSearching, matches.length]);

    if (!hasSearched && !isSearching) return null;

    return (
        <section
            ref={sectionRef}
            id="ai-results"
            aria-labelledby="ai-results-heading"
            className="mb-10 scroll-mt-24 rounded-3xl border border-[#00696b]/25 bg-gradient-to-b from-[#f2fbfa] to-white p-5 shadow-[0_10px_28px_rgba(0,105,107,0.08)] sm:p-6"
        >
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.14em] text-[#00696b]">
                        <Sparkles className="h-3.5 w-3.5" />
                        {ASSISTANT_NAME} {isBroadened ? "broadened matches" : "matches"}
                    </p>
                    <h2
                        id="ai-results-heading"
                        className="mt-2 text-xl font-bold tracking-tight text-[#191c1d] sm:text-2xl"
                    >
                        {isSearching
                            ? "Searching properties…"
                            : matches.length > 0
                                ? `${matches.length} matching ${matches.length === 1 ? "property" : "properties"}`
                                : "No matching properties found"}
                    </h2>
                    {criteriaSummary && (
                        <p className="mt-1 text-sm text-[#44474d]">{criteriaSummary}</p>
                    )}
                </div>

                <button
                    type="button"
                    onClick={clearResults}
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-[#c5c6cd] bg-white px-3 py-2 text-xs font-semibold text-[#44474d] transition hover:bg-[#f3f4f5]"
                >
                    <X className="h-3.5 w-3.5" />
                    Clear
                </button>
            </div>

            {isSearching ? (
                <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3 lg:gap-7">
                    {Array.from({ length: 3 }).map((_, index) => (
                        <div
                            key={index}
                            className="animate-pulse overflow-hidden rounded-2xl border border-[#e1e3e4] bg-white"
                        >
                            <div className="aspect-[1.55/1] bg-[#e7e8e9]" />
                            <div className="space-y-3 p-5">
                                <div className="h-6 w-28 rounded bg-[#e7e8e9]" />
                                <div className="h-5 w-3/4 rounded bg-[#e7e8e9]" />
                                <div className="h-4 w-1/2 rounded bg-[#e7e8e9]" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : matches.length === 0 ? (
                <div className="mt-5 rounded-2xl border border-dashed border-[#c5c6cd] bg-white p-8 text-center">
                    <p className="text-sm font-semibold text-[#191c1d]">
                        {isBroadened
                            ? "Still no matching properties found after broadening."
                            : "Nothing on SpotNest matches those requirements right now."}
                    </p>
                    <p className="mx-auto mt-1.5 max-w-md text-sm text-[#75777e]">
                        {canBroaden
                            ? "I can widen the search further, or you can tell me what to change."
                            : "All progressive broadening options have been exhausted. Try editing your criteria in chat or starting a new search."}
                    </p>
                    <div className="mt-5 flex flex-wrap justify-center gap-2">
                        {canBroaden ? (
                            <button
                                type="button"
                                onClick={() => void broadenSearch()}
                                className="rounded-xl bg-[#00696b] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#004f51]"
                            >
                                Broaden the search
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={clearResults}
                                className="rounded-xl bg-[#00696b] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#004f51]"
                            >
                                Start a new search
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={open}
                            className="rounded-xl border border-[#c5c6cd] bg-white px-4 py-2.5 text-sm font-semibold text-[#44474d] transition hover:bg-[#f3f4f5]"
                        >
                            Refine in chat
                        </button>
                    </div>
                </div>
            ) : (
                <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3 lg:gap-7">
                    {matches.map((match, index) => (
                        <div key={match.property._id} className="flex flex-col">
                            <PropertyCard
                                property={match.property as PropertySummary}
                                imagePriority={index < 3}
                            />

                            {match.reasons.length > 0 && (
                                <div className="mt-2 rounded-xl border border-[#00696b]/20 bg-white px-3.5 py-2.5">
                                    <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#00696b]">
                                        Why it matches
                                    </p>
                                    <ul className="mt-1.5 space-y-1">
                                        {match.reasons.map((reason) => (
                                            <li
                                                key={reason}
                                                className="flex gap-1.5 text-xs leading-5 text-[#44474d]"
                                            >
                                                <span aria-hidden="true" className="text-[#00696b]">
                                                    •
                                                </span>
                                                <span className="min-w-0 flex-1">{reason}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    {(match.property.amenities?.length ?? 0) > 0 && (
                                        <div className="mt-2.5 flex flex-wrap gap-1.5">
                                            {match.property.amenities.slice(0, 5).map((amenity) => (
                                                <span
                                                    key={amenity}
                                                    className="rounded-full bg-[#eef6f5] px-2 py-0.5 text-[10px] font-semibold text-[#00696b]"
                                                >
                                                    {amenity}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {isSearching && (
                <p className="mt-4 inline-flex items-center gap-2 text-xs text-[#75777e]">
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-[#00696b]" />
                    Matching against live listings…
                </p>
            )}
        </section>
    );
}
