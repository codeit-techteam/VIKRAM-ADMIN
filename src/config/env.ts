const getEnv = (key: string, fallback = ""): string => {
  const value = process.env[key];
  return value ?? fallback;
};

export const env = {
  appName: getEnv("NEXT_PUBLIC_APP_NAME", "Bajriwala Admin Panel"),
  appUrl: getEnv("NEXT_PUBLIC_APP_URL", "http://localhost:3000"),
  apiBaseUrl: getEnv(
    "NEXT_PUBLIC_API_BASE_URL",
    "http://localhost:8000/api/v1",
  ),
  authTokenKey: getEnv("NEXT_PUBLIC_AUTH_TOKEN_KEY", "bq_access_token"),
  authRefreshTokenKey: getEnv(
    "NEXT_PUBLIC_AUTH_REFRESH_TOKEN_KEY",
    "bq_refresh_token",
  ),
} as const;
