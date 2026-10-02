import { Suspense } from "react";
import { ChatPage } from "@/src/modules/chat";

export default async function DashboardChatPage({
    params,
}: {
    params: Promise<{ role: string }>;
}) {
    const { role } = await params;
    return (
        <Suspense fallback={<p className="p-6 text-sm text-[#75777e]">Loading chat...</p>}>
            <ChatPage role={role} />
        </Suspense>
    );
}