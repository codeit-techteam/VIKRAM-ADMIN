import { DEV_AUTH } from "@/constants/dev-auth.constants";
import { getDevUserForCredentials } from "@/constants/dev-auth.constants";
import type { LoginCredentials } from "@/types/auth";

export function validateDevCredentials(credentials: LoginCredentials): boolean {
  return (
    getDevUserForCredentials(credentials.email, credentials.password) !== null
  );
}

export function getDevAuthResponse(credentials: LoginCredentials) {
  const user = getDevUserForCredentials(
    credentials.email,
    credentials.password,
  );
  if (!user) {
    throw new Error("Invalid dev credentials");
  }

  return {
    user,
    tokens: {
      accessToken: DEV_AUTH.accessToken,
      refreshToken: DEV_AUTH.refreshToken,
    },
  };
}
