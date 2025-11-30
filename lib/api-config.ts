// API Configuration
// These will be set via environment variables in production
// API_BASE_URL should be the base URL without /api (the API client will add it)
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://v4efb7cuy3.execute-api.eu-west-1.amazonaws.com";

export const WS_ENDPOINT =
  process.env.NEXT_PUBLIC_WS_ENDPOINT || "wss://me9ybopkak.execute-api.eu-west-1.amazonaws.com/dev";

export function getApiUrl(): string {
  return API_BASE_URL;
}

