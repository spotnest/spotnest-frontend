import { io, type Socket } from "socket.io-client";
import { SOCKET_URL } from "./apiConfig";

let socket: Socket | null = null;

export function getSocket(): Socket {
    if (!socket) {
        socket = io(SOCKET_URL, {
            withCredentials: true,
            autoConnect: false,
            transports: ["websocket", "polling"],
        });
    }
    return socket;
}

export function disconnectSocket() {
    socket?.disconnect();
    socket = null;
}