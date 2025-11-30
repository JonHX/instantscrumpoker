// API Configuration
// Production uses custom domain via Cloudflare
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.instantscrumpoker.com/api";

export const WS_ENDPOINT =
  process.env.NEXT_PUBLIC_WS_ENDPOINT || "wss://api.instantscrumpoker.com/dev";

export function getApiUrl(): string {
  return API_BASE_URL;
}

