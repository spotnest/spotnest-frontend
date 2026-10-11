import type { ChatConversation } from "../types/chat";

export function ConversationItem({ conversation, selected, onSelect }: { conversation: ChatConversation; selected: boolean; onSelect: () => void }) {
    return (
        <button type="button" onClick={onSelect} className={`flex w-full items-center gap-3 border-b border-[#e7e8e9] px-4 py-3 text-left transition hover:bg-[#f3f4f5] ${selected ? "bg-[#d9f4f3]/70" : "bg-white"}`}>
            {conversation.property.image ? <img src={conversation.property.image} alt="" className="h-12 w-12 shrink-0 rounded-xl object-cover" /> : <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[#d9f4f3] text-sm font-bold text-[#00696b]">{conversation.property.title.slice(0, 1).toUpperCase()}</span>}
            <span className="min-w-0 flex-1">
                <span className="flex items-center justify-between gap-2"><span className="truncate text-sm font-semibold text-[#191c1d]">{conversation.counterpart.name}</span><span className="shrink-0 text-[10px] text-[#75777e]">{conversation.lastMessageAt ? new Date(conversation.lastMessageAt).toLocaleDateString() : ""}</span></span>
                <span className="block truncate text-xs font-medium text-[#44474d]">{conversation.property.title}</span>
                <span className="mt-0.5 flex items-center justify-between gap-2"><span className="truncate text-xs text-[#75777e]">{conversation.lastMessage || "Start a conversation"}</span>{conversation.unreadCount > 0 && <span className="grid h-5 min-w-5 shrink-0 place-items-center rounded-full bg-[#00696b] px-1 text-[10px] font-bold text-white">{conversation.unreadCount}</span>}</span>
            </span>
        </button>
    );
}
