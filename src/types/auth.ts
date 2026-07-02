import type { Role } from "@/constants/roles";

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: Role;
  permissions?: string[];
  phone?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

export interface AuthSession {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
