export const setAuthCookies = (accessToken: string, refreshToken: string) => {
  if (typeof document === "undefined") return;
  const maxAge = 60 * 60 * 24 * 7;
  document.cookie = `bq_access_token=${accessToken}; path=/; max-age=${maxAge}; SameSite=Lax`;
  document.cookie = `bq_refresh_token=${refreshToken}; path=/; max-age=${maxAge * 4}; SameSite=Lax`;
};

export const clearAuthCookies = () => {
  if (typeof document === "undefined") return;
  document.cookie = "bq_access_token=; path=/; max-age=0";
  document.cookie = "bq_refresh_token=; path=/; max-age=0";
};
