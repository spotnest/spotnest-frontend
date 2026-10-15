import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import { describeCriteria } from "@/src/modules/ai/utils/criteria";
import type {
    ChatMessage,
    FallbackStep,
    MatchedProperty,
    PropertySearchCriteria,
} from "@/src/modules/ai/types/ai";
import type { RootState } from "../store";
import type { AiAssistantState } from "../type";

const initialState: AiAssistantState = {
    isOpen: false,
    messages: [],
    messageSeq: 0,

    originalCriteria: {},
    activeCriteria: {},

    fallbackSteps: [],
    currentStepIndex: -1,
    attemptedSteps: [],

    matches: [],
    hasSearched: false,

    isThinking: false,
    isSearching: false,
    error: null,

    isTurnInFlight: false,
    lastUserMessage: null,
};

const aiAssistantSlice = createSlice({
    name: "aiAssistant",
    initialState,

    reducers: {
        assistantOpened(state) {
            state.isOpen = true;
        },

        assistantClosed(state) {
            state.isOpen = false;
        },

        messageAppended(
            state,
            action: PayloadAction<{
                role: ChatMessage["role"];
                content: string;
            }>
        ) {
            state.messageSeq += 1;
            state.messages.push({
                id: `${action.payload.role}-${state.messageSeq}`,
                role: action.payload.role,
                content: action.payload.content,
            });
        },

        /** Drops the failed turn's user bubble so a retry doesn't duplicate it. */
        lastUserTurnDropped(state) {
            const index = [...state.messages]
                .reverse()
                .findIndex((message) => message.role === "user");

            if (index === -1) return;

            const absolute = state.messages.length - 1 - index;
            state.messages = state.messages.slice(0, absolute);
        },

        turnStarted(state) {
            state.isTurnInFlight = true;
        },

        turnEnded(state) {
            state.isTurnInFlight = false;
        },

        lastUserMessageStored(
            state,
            action: PayloadAction<string>
        ) {
            state.lastUserMessage = action.payload;
        },

        thinkingStarted(state) {
            state.isThinking = true;
        },

        thinkingStopped(state) {
            state.isThinking = false;
        },

        searchStarted(state) {
            state.isSearching = true;
        },

        searchStopped(state) {
            state.isSearching = false;
        },

        matchesResolved(
            state,
            action: PayloadAction<MatchedProperty[]>
        ) {
            state.matches = action.payload;
            state.hasSearched = true;
        },

        /**
         * Records a fresh set of user requirements and resets the fallback
         * progression, so broadening always restarts from the original criteria.
         */
        searchRequirementsApplied(
            state,
            action: PayloadAction<{
                criteria: PropertySearchCriteria;
                fallbackSteps: FallbackStep[];
            }>
        ) {
            state.originalCriteria = action.payload.criteria;
            state.activeCriteria = action.payload.criteria;
            state.fallbackSteps = action.payload.fallbackSteps;
            state.currentStepIndex = -1;
            state.attemptedSteps = [];
        },

        fallbackStepsGenerated(
            state,
            action: PayloadAction<FallbackStep[]>
        ) {
            state.fallbackSteps = action.payload;
        },

        broadenStepApplied(
            state,
            action: PayloadAction<{
                stepIndex: number;
                stepId: string;
                criteria: PropertySearchCriteria;
            }>
        ) {
            state.currentStepIndex = action.payload.stepIndex;
            state.attemptedSteps.push(action.payload.stepId);
            state.activeCriteria = action.payload.criteria;
        },

        errorOccurred(
            state,
            action: PayloadAction<string>
        ) {
            state.error = action.payload;
        },

        errorCleared(state) {
            state.error = null;
        },

        resultsCleared(state) {
            state.originalCriteria = {};
            state.activeCriteria = {};
            state.fallbackSteps = [];
            state.currentStepIndex = -1;
            state.attemptedSteps = [];
            state.matches = [];
            state.hasSearched = false;
        },
    },
});

export const {
    assistantOpened,
    assistantClosed,
    messageAppended,
    lastUserTurnDropped,
    turnStarted,
    turnEnded,
    lastUserMessageStored,
    thinkingStarted,
    thinkingStopped,
    searchStarted,
    searchStopped,
    matchesResolved,
    searchRequirementsApplied,
    fallbackStepsGenerated,
    broadenStepApplied,
    errorOccurred,
    errorCleared,
    resultsCleared,
} = aiAssistantSlice.actions;

/** Human-readable summary of the criteria behind the displayed results. */
export const selectAiCriteriaSummary = (state: RootState): string =>
    describeCriteria(state.aiAssistant.activeCriteria);

/** True when current results come from a broadened/relaxed fallback search. */
export const selectAiIsBroadened = (state: RootState): boolean =>
    state.aiAssistant.currentStepIndex >= 0;

/** True if there are more fallback steps available to broaden. */
export const selectAiCanBroaden = (state: RootState): boolean =>
    state.aiAssistant.hasSearched &&
    state.aiAssistant.currentStepIndex + 1 < state.aiAssistant.fallbackSteps.length;

export default aiAssistantSlice.reducer;
