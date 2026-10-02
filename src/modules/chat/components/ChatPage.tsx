"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { dashboardChatPathForRole, dashboardPathForRole } from "@/src/constants/routes";
import { useAppSelector } from "@/src/store/hook";
import { useChatSocket, useConversations, useMarkMessagesAsRead, useMessages } from "../hooks/useChat";
import type { ChatRole, ChatConversation } from "../types/chat";
import { ConversationItem } from "./ConversationItem";
import { MessageInput } from "./MessageInput";
import { MessageList } from "./MessageList";

export function ChatPage({ role }: { role: string }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const user = useAppSelector((state) => state.auth.user);
    const allowedRole = role === "tenant" || role === "owner";
    const authorized = allowedRole && user?.role === role;
    const conversationsQuery = useConversations(authorized);
    const requestedId = searchParams.get("conversationId");
    const conversations: ChatConversation[] = conversationsQuery.data ?? [];
    const selected = conversations.find((conversation) => conversation.id === requestedId) ?? null;
    const messagesQuery = useMessages(selected?.id);
    const markRead = useMarkMessagesAsRead(selected?.id ?? "");
    const send = useChatSocket(authorized, selected?.id);

    useEffect(() => {
        if (!allowedRole) router.replace(dashboardPathForRole(role));
    }, [allowedRole, role, router]);

    useEffect(() => {
        if (selected && selected.unreadCount > 0) markRead.mutate();
    }, [selected?.id, selected?.unreadCount, markRead.mutate]);

    const selectConversation = (conversationId: string) => {
        router.push(`${dashboardChatPathForRole(role as ChatRole)}?conversationId=${conversationId}`, { scroll: false });
    };

    if (!allowedRole || !authorized || !user) return null;

    const showConversationList = !requestedId;
    const counterpartRole = role === "tenant" ? "Property owner" : "Tenant";
    const chatPath = dashboardChatPathForRole(role as ChatRole);

    return (
        <main className="h-[calc(100dvh-5rem)] min-h-[32rem] p-4 sm:p-6 lg:p-8">
            <div className="mx-auto flex h-full max-w-7xl flex-col">
                <div className="mb-4"><p className="text-sm font-semibold text-[#00696b]">Messages</p><h1 className="mt-1 text-2xl font-bold tracking-[-0.03em] text-[#191c1d]">Chat</h1></div>
                <div className="grid min-h-0 flex-1 overflow-hidden rounded-2xl border border-[#e1e3e4] bg-white shadow-[0_4px_20px_rgba(0,0,0,0.04)] lg:grid-cols-[340px_minmax(0,1fr)]">
                    <aside className={`${showConversationList ? "flex" : "hidden"} min-h-0 flex-col border-r border-[#e7e8e9] lg:flex`}>
                        <div className="border-b border-[#e7e8e9] px-4 py-4"><h2 className="font-bold text-[#191c1d]">Conversations</h2><p className="mt-1 text-xs text-[#75777e]">Chat with tenants and property owners</p></div>
                        <div className="min-h-0 flex-1 overflow-y-auto">
                            {conversationsQuery.isLoading ? <p className="p-5 text-sm text-[#75777e]">Loading conversations…</p> : conversationsQuery.isError ? <p className="p-5 text-sm text-[#ba1a1a]">Unable to load conversations.</p> : conversations.length === 0 ? <div className="p-5 text-sm leading-6 text-[#75777e]">No conversations yet. Start by contacting an owner from a property page.</div> : conversations.map((conversation) => <ConversationItem key={conversation.id} conversation={conversation} selected={conversation.id === selected?.id} onSelect={() => selectConversation(conversation.id)} />)}
                        </div>
                    </aside>
                    <section className={`${showConversationList ? "hidden" : "flex"} min-h-0 flex-col lg:flex`} aria-label="Chat conversation">
                        {selected ? <>
                            <header className="flex items-center gap-3 border-b border-[#e7e8e9] px-4 py-3 sm:px-5"><button type="button" onClick={() => router.replace(chatPath, { scroll: false })} className="grid h-9 w-9 place-items-center rounded-full text-[#44474d] hover:bg-[#f3f4f5] lg:hidden" aria-label="Back to conversations"><ArrowLeft className="h-5 w-5" /></button>{selected.counterpart.image ? <img src={selected.counterpart.image} alt="" className="h-10 w-10 rounded-full object-cover" /> : <span className="grid h-10 w-10 place-items-center rounded-full bg-[#d9f4f3] text-sm font-bold text-[#00696b]">{selected.counterpart.name.slice(0, 1).toUpperCase()}</span>}<div className="min-w-0 flex-1"><h2 className="truncate text-sm font-bold text-[#191c1d]">{selected.counterpart.name}</h2><p className="truncate text-xs text-[#75777e]">{selected.property.title} · {counterpartRole}</p></div></header>
                            {messagesQuery.isError ? <div className="grid flex-1 place-items-center text-sm text-[#ba1a1a]">Unable to load messages.</div> : <MessageList messages={messagesQuery.data ?? []} currentUserId={user.id} loading={messagesQuery.isLoading} />}
                            {send.isError && <p role="alert" className="px-4 pb-2 text-sm text-[#ba1a1a]">Message could not be sent. Please try again.</p>}
                            <MessageInput disabled={send.isPending} onSend={(message) => send.sendMessage(message)} />
                        </> : requestedId ? <div className="flex flex-1 flex-col items-center justify-center px-8 text-center"><button type="button" onClick={() => router.replace(chatPath)} className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-[#00696b] lg:hidden"><ArrowLeft className="h-4 w-4" /> Conversations</button><p className="text-sm text-[#75777e]">Conversation not found or you do not have access.</p></div> : <div className="hidden flex-1 flex-col items-center justify-center px-8 text-center lg:flex"><span className="grid h-14 w-14 place-items-center rounded-2xl bg-[#d9f4f3] text-[#00696b]"><MessageCircle className="h-7 w-7" /></span><h2 className="mt-4 text-lg font-bold text-[#191c1d]">Your conversations</h2><p className="mt-1 max-w-sm text-sm leading-6 text-[#75777e]">Choose a conversation to see messages. You can contact an owner from any property detail page.</p></div>}
                    </section>
                </div>
            </div>
        </main>
    );
}