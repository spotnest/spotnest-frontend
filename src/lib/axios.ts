import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

const api = axios.create({
    baseURL:
        process.env.NEXT_PUBLIC_API_URL ||
        "http://localhost:5000/api/v1",

    /**
     * Required for HttpOnly authentication cookies.
     * The browser automatically sends accessToken and refreshToken cookies.
     */
    withCredentials: true,

    headers: {
        "Content-Type": "application/json",
    },
});

let isRefreshing = false;
let failedQueue: Array<{
    resolve: (value?: unknown) => void;
    reject: (reason?: unknown) => void;
}> = [];

let onUnauthorizedCallback: (() => void) | null = null;

/**
 * Register a callback to clear Redux auth state when refresh fails or session is invalid.
 */
export const setOnUnauthorizedCallback = (callback: () => void) => {
    onUnauthorizedCallback = callback;
};

const processQueue = (error: unknown | null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve();
        }
    });
    failedQueue = [];
};

api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as
            | (InternalAxiosRequestConfig & { _retry?: boolean })
            | undefined;

        if (!error.response || error.response.status !== 401 || !originalRequest) {
            return Promise.reject(error);
        }

        const requestUrl = originalRequest.url || "";

        /**
         * Do not attempt token refresh for:
         * 1. The refresh endpoint itself (prevents infinite loop if refreshToken expired)
         * 2. Public auth endpoints (login, signup, password resets) where 401 means bad credentials
         */
        if (
            requestUrl.includes("/auth/refresh") ||
            requestUrl.includes("/auth/login") ||
            requestUrl.includes("/auth/signup") ||
            requestUrl.includes("/auth/logout") ||
            requestUrl.includes("/auth/forgot-password") ||
            requestUrl.includes("/auth/reset-password")
        ) {
            if (requestUrl.includes("/auth/refresh")) {
                onUnauthorizedCallback?.();
            }
            return Promise.reject(error);
        }

        // Prevent infinite retry loop on already retried requests
        if (originalRequest._retry) {
            onUnauthorizedCallback?.();
            return Promise.reject(error);
        }

        // If a refresh is already in progress, queue this request
        if (isRefreshing) {
            return new Promise((resolve, reject) => {
                failedQueue.push({ resolve, reject });
            })
                .then(() => api(originalRequest))
                .catch((err) => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
            /**
             * POST /auth/refresh
             * No request body — browser automatically sends the HttpOnly refreshToken cookie.
             */
            await api.post("/auth/refresh");

            processQueue(null);
            return api(originalRequest);
        } catch (refreshError) {
            processQueue(refreshError);
            onUnauthorizedCallback?.();
            return Promise.reject(refreshError);
        } finally {
            isRefreshing = false;
        }
    }
);

export default api;