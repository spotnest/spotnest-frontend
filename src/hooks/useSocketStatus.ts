"use client";

import { useSyncExternalStore } from "react";
import { getSocketStatus, subscribeSocketStatus, type SocketStatus } from "@/src/lib/socket";

/** Live connection state of the shared Socket.IO client. */
export function useSocketStatus(): SocketStatus {
    return useSyncExternalStore(subscribeSocketStatus, getSocketStatus, () => "idle" as const);
}
