import type { ChatMessage } from "../types/ai";

export const ASSISTANT_NAME = "Nest AI";

export const WELCOME_MESSAGE =
    "Hi! I'm Nest AI, your SpotNest rental assistant. Tell me what you're looking for — area, budget, bedrooms, must-have amenities — and I'll help you narrow it down.";

/** Starter prompts shown while the conversation is empty. */
export const SUGGESTED_PROMPTS: readonly string[] = [
    "Find a 2 BHK in Thrissur under ₹12,000.",
    "I need a furnished home for my family.",
    "Find a rental home near hospitals.",
    "Help me compare rental properties.",
];

/**
 * The endpoint takes a single prompt and holds no session state, so each turn
 * ships a short preamble plus the recent transcript. Keeping only the last few
 * turns bounds the request size while follow-up questions still make sense.
 */
const HISTORY_TURNS = 6;

const PREAMBLE = [
    `You are ${ASSISTANT_NAME}, the assistant for SpotNest, a rental platform for homes in India (prices in INR per month).`,
    "Help the user describe what they want in a rental and give concise, practical guidance.",
    "Never invent specific listings, addresses, prices or links — SpotNest's own search shows real listings.",
    "Keep answers short and use plain sentences or simple dashed lists.",
].join(" ");

/** Builds the `prompt` string sent to the backend for one user turn. */
export const buildPrompt = (history: ChatMessage[], userMessage: string): string => {
    const transcript = history
        .slice(-HISTORY_TURNS)
        .map((message) => `${message.role === "user" ? "User" : ASSISTANT_NAME}: ${message.content}`)
        .join("\n");

    return [
        PREAMBLE,
        transcript ? `\nConversation so far:\n${transcript}` : "",
        `\nUser: ${userMessage}`,
        `${ASSISTANT_NAME}:`,
    ]
        .filter(Boolean)
        .join("\n");
};
