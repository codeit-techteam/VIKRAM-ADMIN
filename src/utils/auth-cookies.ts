export const setAuthCookies = (
  accessToken: string,
  refreshToken: string,
  role?: string,
) => {
  if (typeof document === "undefined") return;
  const maxAge = 60 * 60 * 24 * 7;
  document.cookie = `bq_access_token=${accessToken}; path=/; max-age=${maxAge}; SameSite=Lax`;
  document.cookie = `bq_refresh_token=${refreshToken}; path=/; max-age=${maxAge * 4}; SameSite=Lax`;
  if (role) {
    document.cookie = `bq_user_role=${role}; path=/; max-age=${maxAge}; SameSite=Lax`;
  }
};

export const clearAuthCookies = () => {
  if (typeof document === "undefined") return;
  document.cookie = "bq_access_token=; path=/; max-age=0";
  document.cookie = "bq_refresh_token=; path=/; max-age=0";
  document.cookie = "bq_user_role=; path=/; max-age=0";
};

export const getRoleFromCookie = (): string | null => {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|;\s*)bq_user_role=([^;]*)/);
  return match?.[1] ? decodeURIComponent(match[1]) : null;
};
