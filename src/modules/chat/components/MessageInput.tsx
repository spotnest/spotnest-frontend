"use client";

import { useState, type FormEvent } from "react";

export function MessageInput({
    onSend,
    disabled,
}: {
    onSend: (message: string) => void;
    disabled?: boolean;
}) {
    const [message, setMessage] = useState("");

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const value = message.trim();

        if (!value || disabled) return;

        onSend(value);
        setMessage("");
    };

    return (
        <form
            onSubmit={submit}
            className="flex items-end gap-2 border-t border-[#e7e8e9] bg-white p-3 sm:p-4"
        >
            <label
                className="sr-only"
                htmlFor="chat-message"
            >
                Type a message
            </label>

            <textarea
                id="chat-message"
                rows={1}
                maxLength={2000}
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                        event.preventDefault();
                        event.currentTarget.form?.requestSubmit();
                    }
                }}
                placeholder="Type a message…"
                className="max-h-32 min-h-11 flex-1 resize-y rounded-xl border border-[#c5c6cd] px-3 py-2.5 text-sm text-[#191c1d] outline-none placeholder:text-[#75777e] focus:border-[#00696b] focus:ring-2 focus:ring-[#00696b]/15"
            />

            <button
                type="submit"
                disabled={disabled || !message.trim()}
                className="h-11 rounded-xl bg-[#00696b] px-5 text-sm font-semibold text-white transition hover:bg-[#004f51] disabled:cursor-not-allowed disabled:opacity-50"
            >
                {disabled ? "Sending…" : "Send"}
            </button>
        </form>
    );
}