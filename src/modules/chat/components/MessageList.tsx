"use client";

import { useEffect, useRef } from "react";
import type { ChatMessage } from "../types/chat";

export function MessageList({
    messages,
    currentUserId,
    loading,
}: {
    messages: ChatMessage[];
    currentUserId: string;
    loading: boolean;
}) {
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({
            behavior: "smooth",
        });
    }, [messages]);

    if (loading) {
        return (
            <div className="grid flex-1 place-items-center text-sm text-[#75777e]">
                Loading messages…
            </div>
        );
    }

    if (messages.length === 0) {
        return (
            <div className="grid flex-1 place-items-center px-6 text-center text-sm text-[#75777e]">
                Send a message to start the conversation.
            </div>
        );
    }

    return (
        <div className="flex-1 space-y-3 overflow-y-auto px-4 py-5 sm:px-6">
            {messages.map((message) => {
                const mine = message.senderId === currentUserId;

                return (
                    <div
                        key={message.id}
                        className={`flex ${mine ? "justify-end" : "justify-start"
                            }`}
                    >
                        <div
                            className={`max-w-[85%] rounded-2xl px-4 py-2.5 sm:max-w-[70%] ${mine
                                    ? "rounded-br-md bg-[#00696b] text-white"
                                    : "rounded-bl-md bg-[#f3f4f5] text-[#191c1d]"
                                }`}
                        >
                            <p className="whitespace-pre-wrap break-words text-sm leading-6">
                                {message.message}
                            </p>

                            <p
                                className={`mt-1 text-right text-[10px] ${mine
                                        ? "text-white/70"
                                        : "text-[#75777e]"
                                    }`}
                            >
                                {new Date(message.createdAt).toLocaleTimeString(
                                    [],
                                    {
                                        hour: "numeric",
                                        minute: "2-digit",
                                    }
                                )}
                            </p>
                        </div>
                    </div>
                );
            })}

            <div ref={bottomRef} />
        </div>
    );
}