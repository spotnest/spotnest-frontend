"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { AlertTriangle, Loader2, RotateCcw, Send, Sparkles, X } from "lucide-react";

import { useAppDispatch, useAppSelector } from "@/src/store/hook";
import {
    assistantClosed,
    assistantOpened,
    errorCleared,
    selectAiCriteriaSummary,
} from "@/src/store/slices/aiAssistantSlice";
import { useAiAssistantActions } from "../hooks/useAiAssistantActions";
import { ASSISTANT_NAME, SUGGESTED_PROMPTS, WELCOME_MESSAGE } from "../constants/assistant";
import type { ChatMessage } from "../types/ai";

function AssistantAvatar({ className = "" }: { className?: string }) {
    return (
        <span
            aria-hidden="true"
            className={`grid shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#00696b] to-[#0b9a93] text-white shadow-sm ${className}`}
        >
            <Sparkles className="h-4 w-4" />
        </span>
    );
}

function MessageBubble({ message }: { message: ChatMessage }) {
    const isUser = message.role === "user";

    return (
        <li className={`flex gap-2.5 ${isUser ? "justify-end" : "justify-start"}`}>
            {!isUser && <AssistantAvatar className="mt-0.5 h-7 w-7" />}

            <div
                className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-6 whitespace-pre-wrap break-words ${isUser
                        ? "bg-[#00696b] text-white rounded-br-md"
                        : "border border-[#e1e3e4] bg-white text-[#191c1d] rounded-bl-md"
                    }`}
            >
                {message.content}
            </div>
        </li>
    );
}

/**
 * Floating "Ask Nest AI" launcher plus the chat panel, rendered on the public
 * property listing page. It is a self-contained client island: the listing page
 * itself stays a server component, so adding this costs the page no data
 * fetching and changes none of its existing markup.
 */
export default function AIPropertyAssistant() {
    const dispatch = useAppDispatch();

    const isOpen = useAppSelector((state) => state.aiAssistant.isOpen);
    const messages = useAppSelector((state) => state.aiAssistant.messages);
    const matches = useAppSelector((state) => state.aiAssistant.matches);
    const criteriaSummary = useAppSelector(selectAiCriteriaSummary);
    const isThinking = useAppSelector((state) => state.aiAssistant.isThinking);
    const isSearching = useAppSelector((state) => state.aiAssistant.isSearching);
    const error = useAppSelector((state) => state.aiAssistant.error);

    const { sendMessage, retryLastMessage } = useAiAssistantActions();

    const open = () => dispatch(assistantOpened());
    const dismissError = () => dispatch(errorCleared());
    const close = useCallback(() => {
        dispatch(assistantClosed());
    }, [dispatch]);

    const [input, setInput] = useState("");

    const panelId = useId();
    const scrollRef = useRef<HTMLDivElement | null>(null);
    const inputRef = useRef<HTMLTextAreaElement | null>(null);

    const isBusy = isThinking || isSearching;

    // Keep the newest turn in view as the transcript grows.
    useEffect(() => {
        if (!isOpen) return;
        const node = scrollRef.current;
        if (node) node.scrollTop = node.scrollHeight;
    }, [isOpen, messages, isBusy]);

    useEffect(() => {
        if (isOpen) inputRef.current?.focus();
    }, [isOpen]);

    // Escape closes the panel, matching a dialog's expected behaviour.
    useEffect(() => {
        if (!isOpen) return;
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") close();
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [isOpen, close]);

    const send = async (raw: string) => {
        const text = raw.trim();
        if (!text || isBusy) return;
        setInput("");
        await sendMessage(text);
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
        // Enter sends; Shift+Enter inserts a newline.
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            void send(input);
        }
    };

    const canSend = input.trim().length > 0 && !isBusy;
    const showSuggestions = messages.length === 0;

    return (
        <>
            {/* Launcher */}
            {!isOpen && (
                <button
                    type="button"
                    onClick={open}
                    aria-expanded={false}
                    aria-controls={panelId}
                    className="group fixed bottom-5 right-5 z-40 inline-flex items-center gap-2.5 rounded-full bg-gradient-to-br from-[#00696b] to-[#0b9a93] px-5 py-3.5 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(0,105,107,0.35)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_36px_rgba(0,105,107,0.45)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#56f5f8] focus-visible:ring-offset-2 sm:bottom-8 sm:right-8"
                >
                    <Sparkles className="h-4.5 w-4.5 transition duration-300 group-hover:rotate-12" />
                    Ask {ASSISTANT_NAME}
                </button>
            )}

            {/* Backdrop — mobile/tablet only, so the desktop panel never blocks the list */}
            {isOpen && (
                <div
                    aria-hidden="true"
                    onClick={close}
                    className="fixed inset-0 z-40 bg-[#191c1d]/40 backdrop-blur-sm transition-opacity sm:hidden"
                />
            )}

            {/* Panel */}
            {isOpen && (
                <section
                    id={panelId}
                    role="dialog"
                    aria-modal="false"
                    aria-label={`${ASSISTANT_NAME} property assistant`}
                    className="fixed inset-x-0 bottom-0 z-50 flex h-[88dvh] flex-col overflow-hidden rounded-t-3xl border border-[#e1e3e4] bg-[#f8f9fa] shadow-[0_-10px_40px_rgba(25,28,29,0.18)] transition sm:inset-x-auto sm:bottom-8 sm:right-8 sm:h-[min(620px,calc(100dvh-6rem))] sm:w-[400px] sm:rounded-3xl sm:shadow-[0_18px_50px_rgba(25,28,29,0.22)]"
                >
                    {/* Header */}
                    <header className="flex items-center gap-3 bg-gradient-to-br from-[#00696b] to-[#0b9a93] px-4 py-3.5 text-white">
                        <AssistantAvatar className="h-9 w-9 bg-white/15 shadow-none ring-1 ring-inset ring-white/25" />
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-bold tracking-tight">{ASSISTANT_NAME}</p>
                            <p className="truncate text-[11px] text-white/80">
                                {isSearching ? "Searching listings…" : isThinking ? "Thinking…" : "Rental assistant"}
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={close}
                            aria-label="Close assistant"
                            className="rounded-full p-1.5 text-white/85 transition hover:bg-white/15 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                        >
                            <X className="h-4.5 w-4.5" />
                        </button>
                    </header>

                    {matches.length > 0 && (
                        <a
                            href="#ai-results"
                            onClick={close}
                            className="flex items-center justify-between gap-2 border-b border-[#e1e3e4] bg-[#eef6f5] px-4 py-2.5 text-xs font-semibold text-[#00696b] transition hover:bg-[#e3f1f0]"
                        >
                            <span className="min-w-0 truncate">
                                {matches.length} {matches.length === 1 ? "match" : "matches"}
                                {criteriaSummary ? ` · ${criteriaSummary}` : ""}
                            </span>
                            <span aria-hidden="true" className="shrink-0">
                                View on page →
                            </span>
                        </a>
                    )}

                    {/* Transcript */}
                    <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4">
                        <div className="flex gap-2.5">
                            <AssistantAvatar className="mt-0.5 h-7 w-7" />
                            <p className="max-w-[85%] rounded-2xl rounded-bl-md border border-[#e1e3e4] bg-white px-3.5 py-2.5 text-sm leading-6 text-[#191c1d]">
                                {WELCOME_MESSAGE}
                            </p>
                        </div>

                        {messages.length > 0 && (
                            <ul className="mt-3 space-y-3">
                                {messages.map((message) => (
                                    <MessageBubble key={message.id} message={message} />
                                ))}
                            </ul>
                        )}

                        {isBusy && (
                            <div className="mt-3 flex gap-2.5" aria-live="polite">
                                <AssistantAvatar className="mt-0.5 h-7 w-7" />
                                <span className="inline-flex items-center gap-2 rounded-2xl rounded-bl-md border border-[#e1e3e4] bg-white px-3.5 py-2.5 text-sm text-[#75777e]">
                                    <Loader2 className="h-3.5 w-3.5 animate-spin text-[#00696b]" />
                                    {isSearching ? "Searching real listings…" : "Thinking…"}
                                </span>
                            </div>
                        )}

                        {error && (
                            <div
                                role="alert"
                                className="mt-3 flex items-start gap-2 rounded-2xl border border-[#ffdad6] bg-[#fff5f4] px-3.5 py-2.5 text-xs leading-5 text-[#ba1a1a]"
                            >
                                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                                <span className="min-w-0 flex-1">{error}</span>
                                <span className="flex shrink-0 items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => void retryLastMessage()}
                                        disabled={isBusy}
                                        className="inline-flex items-center gap-1 font-bold underline-offset-2 hover:underline disabled:opacity-50"
                                    >
                                        <RotateCcw className="h-3 w-3" />
                                        Retry
                                    </button>
                                    <button
                                        type="button"
                                        onClick={dismissError}
                                        className="font-bold underline-offset-2 hover:underline"
                                    >
                                        Dismiss
                                    </button>
                                </span>
                            </div>
                        )}

                        {showSuggestions && !isBusy && (
                            <div className="mt-4">
                                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#75777e]">
                                    Try asking
                                </p>
                                <div className="mt-2 flex flex-col gap-2">
                                    {SUGGESTED_PROMPTS.map((prompt) => (
                                        <button
                                            key={prompt}
                                            type="button"
                                            onClick={() => void send(prompt)}
                                            className="rounded-xl border border-[#c5c6cd] bg-white px-3.5 py-2.5 text-left text-xs font-medium text-[#44474d] transition hover:border-[#00696b] hover:text-[#00696b] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#56f5f8]"
                                        >
                                            {prompt}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Composer */}
                    <form
                        onSubmit={(event) => {
                            event.preventDefault();
                            void send(input);
                        }}
                        className="border-t border-[#e1e3e4] bg-white px-3 py-3"
                    >
                        <div className="flex items-end gap-2 rounded-2xl border border-[#c5c6cd] bg-white px-3 py-2 transition focus-within:border-[#00696b] focus-within:ring-2 focus-within:ring-[#56f5f8]/45">
                            <label htmlFor={`${panelId}-input`} className="sr-only">
                                Message {ASSISTANT_NAME}
                            </label>
                            <textarea
                                id={`${panelId}-input`}
                                ref={inputRef}
                                rows={1}
                                value={input}
                                onChange={(event) => setInput(event.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Ask about rentals, areas or budget…"
                                maxLength={2000}
                                className="max-h-28 min-h-6 flex-1 resize-none bg-transparent text-sm leading-6 text-[#191c1d] outline-none placeholder:text-[#9a9ca1]"
                            />
                            <button
                                type="submit"
                                disabled={!canSend}
                                aria-label="Send message"
                                className="mb-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#00696b] text-white transition hover:bg-[#004f51] disabled:cursor-not-allowed disabled:bg-[#c5c6cd]"
                            >
                                {isBusy ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Send className="h-3.5 w-3.5" />
                                )}
                            </button>
                        </div>
                        <p className="mt-1.5 px-1 text-[10px] text-[#9a9ca1]">
                            Enter to send · Shift+Enter for a new line
                        </p>
                    </form>
                </section>
            )}
        </>
    );
}
