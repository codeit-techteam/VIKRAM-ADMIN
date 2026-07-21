import { API_ENDPOINTS } from "@/constants/api-endpoints";
import api from "@/services/api";
import { setStoredTokens } from "@/store/auth-store";
import { setAuthCookies } from "@/utils/auth-cookies";
import type { ApiResponse } from "@/types/api";
import type { AuthResponse, LoginCredentials, User } from "@/types/auth";
import { mapAdminUser } from "@/types/auth";

interface AdminLoginData {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
  user?: {
    id: string;
    email: string;
    fullName: string;
    role: string;
    permissions?: string[];
    sidebar?: User["sidebar"];
    lastLoginAt?: string | null;
  };
  admin?: {
    id: string;
    email: string;
    fullName: string;
    role: string;
    permissions?: string[];
    sidebar?: User["sidebar"];
    lastLoginAt?: string | null;
  };
}

export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const { data } = await api.post<ApiResponse<AdminLoginData>>(
      API_ENDPOINTS.AUTH.LOGIN,
      credentials,
    );
    const payload = data.data;
    const adminProfile = payload.user ?? payload.admin;
    if (!adminProfile) {
      throw new Error("Invalid login response");
    }

    const user = mapAdminUser(adminProfile);
    const tokens = {
      accessToken: payload.accessToken,
      refreshToken: payload.refreshToken,
      expiresIn: payload.expiresIn,
    };

    setStoredTokens(tokens.accessToken, tokens.refreshToken);
    setAuthCookies(tokens.accessToken, tokens.refreshToken, user.role);

    return { user, tokens };
  },

  logout: async (): Promise<void> => {
    const refreshToken =
      typeof window !== "undefined"
        ? (localStorage.getItem("bq_refresh_token") ??
          localStorage.getItem("bw_refresh_token"))
        : null;
    if (refreshToken) {
      await api.post(API_ENDPOINTS.AUTH.LOGOUT, { refreshToken });
    }
  },

  getMe: async (): Promise<User> => {
    const { data } = await api.get<
      ApiResponse<{
        id: string;
        email: string;
        fullName: string;
        role: string;
        permissions?: string[];
        sidebar?: User["sidebar"];
        lastLoginAt?: string | null;
      }>
    >(API_ENDPOINTS.AUTH.ME);
    return mapAdminUser(data.data);
  },

  refreshToken: async (
    refreshToken: string,
  ): Promise<{ accessToken: string; refreshToken: string }> => {
    const { data } = await api.post<
      ApiResponse<{ accessToken: string; refreshToken: string }>
    >(API_ENDPOINTS.AUTH.REFRESH, { refreshToken });
    return data.data;
  },

  forgotPassword: async (email: string): Promise<void> => {
    await api.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, { email });
  },

  resetPassword: async (token: string, password: string): Promise<void> => {
    await api.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, { token, password });
  },
};
