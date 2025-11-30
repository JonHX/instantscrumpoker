// API Configuration
// These will be set via environment variables in production
// API_BASE_URL should be the base URL without /api (the API client will add it)
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";

export const WS_ENDPOINT =
  process.env.NEXT_PUBLIC_WS_ENDPOINT || "ws://localhost:3001";

