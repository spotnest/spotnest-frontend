import { Suspense } from "react";
import Navbar from "@/src/components/layout/Navbar";
import { ChatPage } from "@/src/modules/chat";

export default function MessagesPage() {
    return (
        <>
            <Navbar />
            <Suspense fallback={<p className="p-6 text-sm text-[#75777e]">Loading chat...</p>}>
                <ChatPage role="user" />
            </Suspense>
        </>
    );
}