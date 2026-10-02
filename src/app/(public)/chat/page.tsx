import { ChatPage } from "@/src/modules/chat";

export default async function DashboardChatPage({ params }: { params: Promise<{ role: string }> }) {
    const { role } = await params;
    return <ChatPage role={role} />;
}
