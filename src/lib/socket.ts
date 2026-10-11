import { io, type Socket } from "socket.io-client";
import { SOCKET_URL } from "./apiConfig";
import { SocketEvents } from "./socketEvents";

/**
 * One Socket.IO connection per browser tab, shared by notifications,
 * dashboards and chat. Components only attach/detach listeners; they never
 * create their own connection.
 */

export type SocketStatus = "idle" | "connecting" | "connected" | "reconnecting" | "offline";

let socket: Socket | null = null;
let status: SocketStatus = "idle";
let closedByClient = false;
let recoveryInFlight = false;
let recoveryAttempts = 0;
let recoveryTimer: ReturnType<typeof setTimeout> | null = null;
let sessionRecovery: (() => Promise<void>) | null = null;

const MAX_RECOVERY_ATTEMPTS = 5;
const statusListeners = new Set<() => void>();

const setStatus = (next: SocketStatus) => {
    if (status === next) return;
    status = next;
    statusListeners.forEach((listener) => listener());
};

export const getSocketStatus = (): SocketStatus => status;

export const subscribeSocketStatus = (listener: () => void): (() => void) => {
    statusListeners.add(listener);
    return () => {
        statusListeners.delete(listener);
    };
};

/**
 * Registers how to renew the HTTP-only access cookie (e.g. an authenticated
 * request through the axios client, whose interceptor refreshes the session).
 * Kept as a callback so this low-level module doesn't depend on feature
 * modules.
 */
export const configureSocketSessionRecovery = (recover: (() => Promise<void>) | null) => {
    sessionRecovery = recover;
};

const clearRecoveryTimer = () => {
    if (recoveryTimer) clearTimeout(recoveryTimer);
    recoveryTimer = null;
};

/**
 * The server rejected the handshake (expired/invalid cookie) or closed the
 * socket because the access token expired. Socket.IO does not auto-reconnect
 * in either case, so renew the session and connect again, with backoff.
 */
const recoverSession = () => {
    if (!socket || closedByClient || recoveryInFlight || recoveryTimer) return;

    if (recoveryAttempts >= MAX_RECOVERY_ATTEMPTS) {
        setStatus("offline");
        return;
    }

    setStatus("reconnecting");
    const delay = recoveryAttempts === 0 ? 0 : Math.min(1_000 * 2 ** (recoveryAttempts - 1), 15_000);
    recoveryAttempts += 1;

    recoveryTimer = setTimeout(async () => {
        recoveryTimer = null;
        recoveryInFlight = true;
        let failed = false;
        try {
            await sessionRecovery?.();
        } catch {
            // A rejected refresh signs the user out through the axios
            // interceptor, which disconnects this socket. Anything else
            // (network) is retried with backoff below.
            failed = true;
        } finally {
            recoveryInFlight = false;
        }
        if (!socket || closedByClient) return;
        if (failed) recoverSession();
        else if (!socket.connected) socket.connect();
    }, delay);
};

const attachLifecycleHandlers = (instance: Socket) => {
    instance.on("connect", () => {
        recoveryAttempts = 0;
        clearRecoveryTimer();
        setStatus("connected");
    });

    instance.on("disconnect", (reason) => {
        if (closedByClient) return;
        if (reason === "io client disconnect") {
            setStatus("idle");
            return;
        }
        if (reason === "io server disconnect") {
            recoverSession();
            return;
        }
        // Transport problems: Socket.IO retries automatically.
        setStatus("reconnecting");
    });

    instance.on("connect_error", () => {
        if (closedByClient) return;
        // `active` is false when the server middleware rejected the
        // handshake; otherwise the built-in reconnection keeps trying.
        if (!instance.active) recoverSession();
        else setStatus("reconnecting");
    });

    instance.on(SocketEvents.SESSION_EXPIRED, () => {
        // The server disconnects right after this; recovery runs from the
        // "io server disconnect" handler.
        setStatus("reconnecting");
    });
};

export function getSocket(): Socket {
    if (!socket) {
        socket = io(SOCKET_URL, {
            withCredentials: true,
            autoConnect: false,
            transports: ["websocket", "polling"],
        });
        attachLifecycleHandlers(socket);
    }
    return socket;
}

export function connectSocket(): Socket {
    const instance = getSocket();
    closedByClient = false;
    if (!instance.connected && !instance.active) {
        setStatus("connecting");
        instance.connect();
    }
    return instance;
}

export function disconnectSocket() {
    closedByClient = true;
    clearRecoveryTimer();
    recoveryAttempts = 0;
    socket?.removeAllListeners();
    socket?.disconnect();
    socket = null;
    setStatus("idle");
}

/** Lets the user retry after recovery gave up (e.g. they were offline). */
export function retrySocketConnection() {
    if (!socket || closedByClient) return;
    recoveryAttempts = 0;
    clearRecoveryTimer();
    if (socket.active) return;
    recoverSession();
}
