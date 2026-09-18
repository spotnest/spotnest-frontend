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
 * Resolve or reject requests that were waiting while the
 * authentication session was being refreshed.
 */
const processQueue = (error: unknown) => {
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
 * Therefore we intentionally DO NOT read accessToken,
 * refreshToken, or any authentication token from localStorage.
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
 * If an authenticated request receives 401:
 *
 * 1. Try to refresh the session using the HTTP-only refresh cookie.
 * 2. Retry the original request.
 * 3. Queue other failed requests while refresh is in progress.
 *
 * The refresh endpoint itself is never retried through this logic.
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

    /**
     * Never try to refresh the refresh endpoint itself.
     */
    if (originalRequest.url?.includes("/auth/refresh")) {
      return Promise.reject(error);
    }

    /**
     * Prevent an infinite retry loop.
     */
    if (originalRequest._retry) {
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

      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;
