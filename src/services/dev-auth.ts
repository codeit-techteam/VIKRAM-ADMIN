import { DEV_AUTH, DEV_SUPER_ADMIN_USER } from "@/constants/dev-auth.constants";
import type { LoginCredentials } from "@/types/auth";

export function validateDevCredentials(credentials: LoginCredentials): boolean {
  return (
    credentials.email.toLowerCase() === DEV_AUTH.email &&
    credentials.password === DEV_AUTH.password
  );
}

export function getDevAuthResponse() {
  return {
    user: DEV_SUPER_ADMIN_USER,
    tokens: {
      accessToken: DEV_AUTH.accessToken,
      refreshToken: DEV_AUTH.refreshToken,
    },
  };
}
