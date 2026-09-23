import axios, {
    AxiosError,
    type AxiosInstance,
    type InternalAxiosRequestConfig,
} from "axios";

const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:5000/api/v1";

const api: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

/**
 * Prevent multiple refresh requests from running at the same time.
 */
let isRefreshing = false;

type FailedRequest = {
    resolve: (value?: unknown) => void;
    reject: (reason?: unknown) => void;
};

let failedQueue: FailedRequest[] = [];

/**
 * Callback used by Redux/auth state when the refresh session
 * is no longer valid.
 */
let onUnauthorizedCallback: (() => void) | null = null;

/**
 * Register a callback to clear Redux auth state when the
 * authentication session becomes invalid.
 */
export const setOnUnauthorizedCallback = (callback: () => void) => {
    onUnauthorizedCallback = callback;
};

/**
 * Resolve or reject requests that were waiting while the
 * authentication session was being refreshed.
 */
const processQueue = (error: unknown | null) => {
    failedQueue.forEach(({ resolve, reject }) => {
        if (error) {
            reject(error);
        } else {
            resolve();
        }
    });

    failedQueue = [];
};

/**
 * Request interceptor.
 *
 * Authentication is handled through HTTP-only cookies.
 * We intentionally do NOT read accessToken or refreshToken
 * from localStorage.
 */
api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        config.withCredentials = true;

        return config;
    },
    (error) => Promise.reject(error)
);

/**
 * Response interceptor.
 *
 * When an authenticated request receives 401:
 *
 * 1. Try to refresh the session using the HTTP-only refresh cookie.
 * 2. Retry the original request.
 * 3. Queue other failed requests while refresh is in progress.
 *
 * Public authentication endpoints are never refreshed because
 * their 401 responses normally represent authentication errors
 * rather than an expired authenticated session.
 */
api.interceptors.response.use(
    (response) => response,

    async (error: AxiosError) => {
        const originalRequest = error.config as
            | (InternalAxiosRequestConfig & {
                  _retry?: boolean;
              })
            | undefined;

        const status = error.response?.status;

        if (!originalRequest || status !== 401) {
            return Promise.reject(error);
        }

        const requestUrl = originalRequest.url || "";

        /**
         * Never attempt refresh for the refresh endpoint itself.
         *
         * If refresh fails, the current session is invalid.
         */
        if (requestUrl.includes("/auth/refresh")) {
            onUnauthorizedCallback?.();

            return Promise.reject(error);
        }

        /**
         * Public authentication endpoints.
         *
         * A 401 here means the request itself failed authentication
         * and should NOT trigger a refresh attempt.
         */
        const isPublicAuthEndpoint =
            requestUrl.includes("/auth/login") ||
            requestUrl.includes("/auth/signup") ||
            requestUrl.includes("/auth/logout") ||
            requestUrl.includes("/auth/forgot-password") ||
            requestUrl.includes("/auth/reset-password");

        if (isPublicAuthEndpoint) {
            return Promise.reject(error);
        }

        /**
         * Prevent an infinite retry loop.
         */
        if (originalRequest._retry) {
            onUnauthorizedCallback?.();

            return Promise.reject(error);
        }

        /**
         * If another request is already refreshing the session,
         * wait for that refresh to finish.
         */
if (isRefreshing) {
    return new Promise((resolve, reject) => {
        failedQueue.push({
            resolve,
            reject,
        });
    }).then(() => {
        return api(originalRequest);
    });
}
        originalRequest._retry = true;
        isRefreshing = true;

        try {
            /**
             * IMPORTANT:
             * No refresh token is manually read here.
             *
             * The browser automatically sends the HTTP-only
             * refresh cookie because withCredentials=true.
             */
            await api.post("/auth/refresh");

            processQueue(null);

            return api(originalRequest);
        } catch (refreshError) {
            processQueue(refreshError);

            /**
             * Tell Redux/auth state that the session is no longer valid.
             */
            onUnauthorizedCallback?.();

            return Promise.reject(refreshError);
        } finally {
            isRefreshing = false;
        }
    }
);

export default api;