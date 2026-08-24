const trim = (value: string | undefined, fallback: string): string => {
  const next = value?.trim();
  return next ? next : fallback;
};

/**
 * NEXT_PUBLIC_* must be read as static property access so Next.js can inline
 * them into the client bundle. `process.env[key]` is always undefined in the
 * browser and previously forced a cross-origin DigitalOcean URL (CORS error).
 */
export const env = {
  appName: trim(process.env.NEXT_PUBLIC_APP_NAME, "Bajriwala Admin Panel"),
  appUrl: trim(process.env.NEXT_PUBLIC_APP_URL, "http://localhost:3001"),
  apiBaseUrl: trim(process.env.NEXT_PUBLIC_API_BASE_URL, "/backend-api/v1"),
  authTokenKey: trim(process.env.NEXT_PUBLIC_AUTH_TOKEN_KEY, "bw_access_token"),
  authRefreshTokenKey: trim(
    process.env.NEXT_PUBLIC_AUTH_REFRESH_TOKEN_KEY,
    "bw_refresh_token",
  ),
} as const;
