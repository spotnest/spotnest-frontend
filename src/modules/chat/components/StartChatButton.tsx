// "use client";
// import { useRouter } from "next/navigation";
// import { useAppSelector } from "@/src/store/hook";
// import { dashboardChatPathForRole } from "@/src/constants/routes";
// import { useCreateConversation } from "../hooks/useChat";

// export function StartChatButton({ propertyId }: { propertyId: string }) {
//     const router = useRouter();
//     const user = useAppSelector((state) => state.auth.user);
//     const mutation = useCreateConversation();
//     if (user?.role !== "tenant") return null;
//     const start = () => mutation.mutate(propertyId, { onSuccess: (conversation) => router.push(`${dashboardChatPathForRole("tenant")}?conversationId=${conversation.id}`) });
//     return (
//         < div className="mt-3" >
//             <button type="button"
//                 onClick={start}
//                 disabled={mutation.isPending}
//                 className="w-full rounded-lg border border-[#00696b] px-4 py-3 text-sm font-semibold text-[#00696b] transition hover:bg-[#d9f4f3] disabled:opacity-60">
//                 {mutation.isPending ? "Opening chat…" : "Message owner"}
//             </button>
//             {
//                 mutation.isError &&
//                 <p role="alert" className="mt-2 text-sm text-[#ba1a1a]">
//                     Could not open chat. Please try again.
//                 </p>
//             }
//         </div >

//     )
// }
"use client";

import { usePathname, useRouter } from "next/navigation";
import { useAppSelector } from "@/src/store/hook";
import { dashboardChatPathForRole } from "@/src/constants/routes";
import { useCreateConversation } from "../hooks/useChat";

export function StartChatButton({ propertyId, ownerId }: { propertyId: string; ownerId: string }) {
    const router = useRouter();
    const pathname = usePathname();
    const { user, isInitialized } = useAppSelector((state) => state.auth);
    const mutation = useCreateConversation();

    // Auth still loading: keep the layout stable with a disabled placeholder
    if (!isInitialized) {
        return (
            <div className="mt-3">
                <button
                    type="button"
                    disabled
                    className="w-full rounded-lg border border-[#00696b] px-4 py-3 text-sm font-semibold text-[#00696b] opacity-60"
                >
                    Chat with owner
                </button>
            </div>
        );
    }

    // Owners and admins can't start a tenant chat
    const isOwnProperty = Boolean(user && user.id === ownerId);
    const canChat = !user || user.role === "tenant" || user.role === "user";
    if (!canChat && !isOwnProperty) return null;

    if (isOwnProperty) {
        return <p className="mt-3 text-center text-sm font-medium text-[#75777e]">This is your property</p>;
    }


    const start = () => {
        if (!user) {
            router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
            return;
        }

        mutation.mutate(propertyId, {
            onSuccess: (conversation) =>
                router.push(
                    `${user.role === "user" ? "/messages" : dashboardChatPathForRole("tenant")}?conversationId=${conversation.id}`
                ),
        });
    };

    return (
        <div className="mt-3">
            <button
                type="button"
                onClick={start}
                disabled={mutation.isPending}
                className="w-full rounded-lg border border-[#00696b] px-4 py-3 text-sm font-semibold text-[#00696b] transition hover:bg-[#d9f4f3] disabled:opacity-60"
            >
                {mutation.isPending ? "Opening chat…" : "Chat with owner"}
            </button>

            {mutation.isError && (
                <p role="alert" className="mt-2 text-sm text-[#ba1a1a]">
                    Could not open chat. Please try again.
                </p>
            )}
        </div>
    );
}