import { API_ENDPOINTS } from "@/constants/api-endpoints";
import api from "@/services/api";
import { setStoredTokens } from "@/store/auth-store";
import { setAuthCookies } from "@/utils/auth-cookies";
import type { ApiResponse } from "@/types/api";
import type { AuthResponse, LoginCredentials, User } from "@/types/auth";

export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const { data } = await api.post<ApiResponse<AuthResponse>>(
      API_ENDPOINTS.AUTH.LOGIN,
      credentials,
    );
    const { user, tokens } = data.data;
    setStoredTokens(tokens.accessToken, tokens.refreshToken);
    setAuthCookies(tokens.accessToken, tokens.refreshToken);
    return { user, tokens };
  },

  logout: async (): Promise<void> => {
    await api.post(API_ENDPOINTS.AUTH.LOGOUT);
  },

  getMe: async (): Promise<User> => {
    const { data } = await api.get<ApiResponse<User>>(API_ENDPOINTS.AUTH.ME);
    return data.data;
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
