import axios, {
  type AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from "axios";

import { env } from "@/config/env";
import { ROUTES } from "@/constants/routes";
import {
  clearStoredTokens,
  getStoredAccessToken,
  getStoredRefreshToken,
  setStoredTokens,
  useAuthStore,
} from "@/store/auth-store";
import type { ApiErrorResponse } from "@/types/api";

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else if (token) {
      promise.resolve(token);
    }
  });
  failedQueue = [];
};

const api: AxiosInstance = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getStoredAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorResponse>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = getStoredRefreshToken();

      if (!refreshToken) {
        useAuthStore.getState().logout();
        clearStoredTokens();
        if (typeof window !== "undefined") {
          window.location.href = ROUTES.LOGIN;
        }
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post<{
          data: { accessToken: string; refreshToken: string };
        }>(`${env.apiBaseUrl}/auth/refresh`, { refreshToken });

        const { accessToken, refreshToken: newRefreshToken } = data.data;
        setStoredTokens(accessToken, newRefreshToken);
        useAuthStore.getState().setTokens(accessToken, newRefreshToken);
        processQueue(null, accessToken);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }

        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        useAuthStore.getState().logout();
        clearStoredTokens();
        if (typeof window !== "undefined") {
          window.location.href = ROUTES.LOGIN;
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default api;

export const getApiErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    return (
      error.response?.data?.message ?? error.message ?? "An error occurred"
    );
  }
  if (error instanceof Error) return error.message;
  return "An unexpected error occurred";
};
