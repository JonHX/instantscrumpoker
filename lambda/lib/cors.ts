// CORS configuration and utilities

// Allowed origins for CORS
export const ALLOWED_ORIGINS = [
  'https://instantscrumpoker.com',
  'https://www.instantscrumpoker.com',
  'http://localhost:3000',
  'http://localhost:3001',
];

/**
 * Get CORS headers based on request origin
 * @param origin The origin from the request headers
 * @returns CORS headers object
 */
export function getCorsHeaders(origin?: string): Record<string, string> {
  const allowedOrigin = origin && ALLOWED_ORIGINS.includes(origin) 
    ? origin 
    : ALLOWED_ORIGINS[0]; // Default to production origin
  
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'OPTIONS, GET, POST, PUT, DELETE',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Allow-Credentials': 'true',
  };
}

/**
 * Get origin from HTTP API v2 event
 * @param event APIGatewayProxyEventV2
 * @returns Origin string or undefined
 */
export function getOrigin(event: { headers?: Record<string, string | undefined> }): string | undefined {
  return event.headers?.origin || event.headers?.Origin;
}

