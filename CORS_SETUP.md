# CORS Setup Documentation

This document explains the complete CORS (Cross-Origin Resource Sharing) configuration for InstantScrumPoker, including Lambda handlers, API Gateway, and Cloudflare proxy setup.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Lambda Handler CORS Implementation](#lambda-handler-cors-implementation)
3. [API Gateway CORS Configuration](#api-gateway-cors-configuration)
4. [Cloudflare Proxy Setup](#cloudflare-proxy-setup)
5. [Testing CORS](#testing-cors)
6. [Troubleshooting](#troubleshooting)

---

## Architecture Overview

```
Browser (https://instantscrumpoker.com)
  ↓
Cloudflare Proxy (api.instantscrumpoker.com)
  ↓
AWS API Gateway HTTP API (v4efb7cuy3.execute-api.eu-west-1.amazonaws.com)
  ↓
Lambda Functions (with explicit CORS handling)
```

**Key Points:**
- Frontend is served from `https://instantscrumpoker.com`
- API is accessed via `https://api.instantscrumpoker.com` (Cloudflare CNAME)
- Cloudflare proxies requests to AWS API Gateway
- Lambda handlers explicitly handle CORS for all responses

---

## Lambda Handler CORS Implementation

### Shared CORS Utility

**File:** `lambda/lib/cors.ts`

```typescript
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
```

**Features:**
- Whitelist of allowed origins (production + localhost for dev)
- Dynamic origin matching from request headers
- Returns specific origin (not wildcard `*`) for security
- Includes `Access-Control-Allow-Credentials: true` for cookie/auth support

### Lambda Handler Example

**File:** `lambda/handlers/createRoom.ts`

```typescript
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { docClient, calculateTTL } from "../lib/dynamodb";
import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { generateRoomId } from "../lib/roomIdGenerator";
import { getCorsHeaders, getOrigin } from "../lib/cors";

const TABLE_NAME = process.env.ROOMS_TABLE || process.env.TABLE_NAME || "";

export const handler = async (
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> => {
  const origin = getOrigin(event);
  
  // Handle OPTIONS preflight request
  if (event.requestContext.http.method === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        ...getCorsHeaders(origin),
        'Access-Control-Max-Age': '86400',
      },
      body: '',
    };
  }

  try {
    const body = event.body ? JSON.parse(event.body) : {};
    const { name } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json",
          ...getCorsHeaders(origin),
        },
        body: JSON.stringify({ error: "Room name is required" }),
      };
    }

    // ... business logic ...

    return {
      statusCode: 201,
      headers: {
        "Content-Type": "application/json",
        ...getCorsHeaders(origin),
      },
      body: JSON.stringify({ roomId }),
    };
  } catch (error) {
    console.error("Error creating room:", error);
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        ...getCorsHeaders(origin),
      },
      body: JSON.stringify({ 
        error: "Failed to create room",
        message: error instanceof Error ? error.message : String(error),
      }),
    };
  }
};
```

**Key Implementation Details:**

1. **OPTIONS Preflight Handling:**
   - Detects OPTIONS requests via `event.requestContext.http.method === 'OPTIONS'`
   - Returns 200 with CORS headers and empty body
   - Includes `Access-Control-Max-Age: 86400` (24 hours) for preflight caching

2. **All Responses Include CORS:**
   - Success responses (200, 201)
   - Error responses (400, 404, 500)
   - Uses spread operator `...getCorsHeaders(origin)` to include all CORS headers

3. **Origin Detection:**
   - Extracts origin from `event.headers.origin` or `event.headers.Origin`
   - Validates against whitelist
   - Falls back to production origin if not in whitelist

**All Handlers Updated:**
- `createRoom.ts`
- `joinRoom.ts`
- `vote.ts`
- `getRoom.ts`
- `revealVotes.ts`

---

## API Gateway CORS Configuration

**File:** `lambda/template.yaml`

```yaml
HttpApi:
  Type: AWS::Serverless::HttpApi
  Properties:
    Name: !Sub scrumpoker-api-${Environment}
    CorsConfiguration:
      AllowOrigins:
        - 'https://instantscrumpoker.com'
        - 'https://www.instantscrumpoker.com'
        - 'http://localhost:3000'
        - 'http://localhost:3001'
      AllowMethods:
        - GET
        - POST
        - PUT
        - DELETE
        - OPTIONS
      AllowHeaders:
        - Content-Type
        - Authorization
        - X-Requested-With
      AllowCredentials: true
      ExposeHeaders:
        - Content-Length
        - Content-Type
      MaxAge: 3600
```

**Configuration Details:**
- **AllowOrigins:** Explicit list of allowed origins (no wildcards - AWS doesn't support them)
- **AllowMethods:** All HTTP methods including OPTIONS for preflight
- **AllowHeaders:** Headers the frontend can send
- **AllowCredentials:** `true` to support cookies/authentication
- **ExposeHeaders:** Headers the frontend can read from response
- **MaxAge:** 3600 seconds (1 hour) for preflight cache

**Note:** API Gateway CORS config is a backup. Lambda handlers explicitly return CORS headers, which takes precedence and works even if API Gateway CORS is misconfigured.

---

## Cloudflare Proxy Setup

### DNS Configuration

**Cloudflare DNS Records:**

```
Type: CNAME
Name: api
Target: v4efb7cuy3.execute-api.eu-west-1.amazonaws.com
Proxy: ☁️ Proxied (Orange Cloud)
```

**Important Settings:**

1. **SSL/TLS Mode:** `Full` or `Full (Strict)`
   - **Full:** Cloudflare encrypts to origin, accepts self-signed certs
   - **Full (Strict):** Cloudflare encrypts to origin, requires valid certs (recommended)

2. **Proxy Status:** **Proxied** (Orange Cloud ☁️)
   - Enables Cloudflare's DDoS protection, WAF, and caching
   - Required for Cloudflare to add/modify headers

3. **Browser Cache TTL:** `Respect Existing Headers`
   - Allows API Gateway/Lambda to control caching

### Cloudflare and CORS

**How Cloudflare Affects CORS:**

1. **Request Flow:**
   ```
   Browser → Cloudflare (adds CF headers) → API Gateway → Lambda
   ```

2. **Response Flow:**
   ```
   Lambda (CORS headers) → API Gateway → Cloudflare (passes through) → Browser
   ```

3. **Cloudflare Behavior:**
   - **Does NOT strip CORS headers** - passes them through
   - **Does NOT add CORS headers** - relies on backend
   - May cache OPTIONS responses if caching rules allow (we set `MaxAge` to prevent this)

4. **Potential Issues:**
   - If Cloudflare is blocking OPTIONS requests, check Firewall Rules
   - Ensure no Page Rules are blocking `/api/*` paths
   - Verify SSL/TLS mode is not `Flexible` (breaks HTTPS)

### Recommended Cloudflare Settings

**Firewall Rules:**
- Allow OPTIONS requests to `/api/*`
- Allow GET/POST requests to `/api/*`
- Block if needed: Rate limiting, DDoS protection (but not CORS)

**Page Rules:**
- None needed for CORS
- If caching API responses, ensure OPTIONS are not cached

**SSL/TLS:**
- Mode: `Full (Strict)`
- Minimum TLS Version: `1.2`
- Always Use HTTPS: `On`

---

## Testing CORS

### Browser Console Test

```javascript
// Test OPTIONS preflight
fetch('https://api.instantscrumpoker.com/api/rooms', {
  method: 'OPTIONS',
  headers: {
    'Origin': 'https://instantscrumpoker.com',
    'Access-Control-Request-Method': 'POST',
    'Access-Control-Request-Headers': 'Content-Type'
  }
})
.then(response => {
  console.log('Status:', response.status);
  console.log('CORS Headers:');
  for (let [key, value] of response.headers.entries()) {
    if (key.includes('access-control')) {
      console.log(`  ${key}: ${value}`);
    }
  }
});

// Test actual POST request
fetch('https://api.instantscrumpoker.com/api/rooms', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Origin': 'https://instantscrumpoker.com'
  },
  body: JSON.stringify({ name: 'Test Room' })
})
.then(response => {
  console.log('Status:', response.status);
  return response.json();
})
.then(data => console.log('Response:', data))
.catch(err => console.error('Error:', err));
```

### cURL Test (Linux/Mac)

```bash
# Test OPTIONS preflight
curl -I -X OPTIONS https://api.instantscrumpoker.com/api/rooms \
  -H "Origin: https://instantscrumpoker.com" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type"

# Expected response headers:
# HTTP/2 200
# access-control-allow-origin: https://instantscrumpoker.com
# access-control-allow-methods: OPTIONS, GET, POST, PUT, DELETE
# access-control-allow-headers: Content-Type, Authorization, X-Requested-With
# access-control-allow-credentials: true
# access-control-max-age: 86400
```

### PowerShell Test (Windows)

```powershell
# Test OPTIONS preflight
$response = Invoke-WebRequest -Uri 'https://api.instantscrumpoker.com/api/rooms' `
  -Method OPTIONS `
  -Headers @{
    'Origin' = 'https://instantscrumpoker.com'
    'Access-Control-Request-Method' = 'POST'
    'Access-Control-Request-Headers' = 'Content-Type'
  }

Write-Host "Status: $($response.StatusCode)"
Write-Host "CORS Headers:"
$response.Headers.GetEnumerator() | Where-Object { $_.Key -like "*access-control*" } | ForEach-Object {
    Write-Host "  $($_.Key): $($_.Value)"
}
```

### Expected CORS Headers

**Preflight (OPTIONS) Response:**
```
HTTP/2 200
access-control-allow-origin: https://instantscrumpoker.com
access-control-allow-methods: OPTIONS, GET, POST, PUT, DELETE
access-control-allow-headers: Content-Type, Authorization, X-Requested-With
access-control-allow-credentials: true
access-control-max-age: 86400
```

**Actual Request Response:**
```
HTTP/2 201
content-type: application/json
access-control-allow-origin: https://instantscrumpoker.com
access-control-allow-methods: OPTIONS, GET, POST, PUT, DELETE
access-control-allow-headers: Content-Type, Authorization, X-Requested-With
access-control-allow-credentials: true
```

---

## Troubleshooting

### Issue: "No 'Access-Control-Allow-Origin' header is present"

**Possible Causes:**
1. Lambda handler not returning CORS headers
2. Cloudflare blocking OPTIONS requests
3. API Gateway CORS config misconfigured

**Solutions:**
1. Check Lambda CloudWatch logs for errors
2. Verify `getCorsHeaders()` is called in all response paths
3. Test direct API Gateway URL (bypass Cloudflare): `https://v4efb7cuy3.execute-api.eu-west-1.amazonaws.com/api/rooms`
4. Check Cloudflare Firewall Rules for blocked OPTIONS

### Issue: "Response to preflight request doesn't pass access control check"

**Possible Causes:**
1. Origin not in allowed list
2. Missing `Access-Control-Allow-Credentials: true` when using credentials
3. Method or header not allowed

**Solutions:**
1. Verify origin is in `ALLOWED_ORIGINS` array
2. Check `Access-Control-Allow-Methods` includes the method you're using
3. Check `Access-Control-Allow-Headers` includes all headers you're sending

### Issue: CORS works direct to API Gateway but not through Cloudflare

**Possible Causes:**
1. Cloudflare SSL/TLS mode set to `Flexible` (downgrades to HTTP)
2. Cloudflare Firewall blocking requests
3. Cloudflare caching OPTIONS responses incorrectly

**Solutions:**
1. Set SSL/TLS mode to `Full` or `Full (Strict)`
2. Check Cloudflare Firewall Rules
3. Add Page Rule to bypass cache for `/api/*` if needed

### Issue: CORS headers present but browser still blocks

**Possible Causes:**
1. Using wildcard `*` with `Access-Control-Allow-Credentials: true` (not allowed)
2. Origin mismatch (case-sensitive)
3. Credentials sent but `Access-Control-Allow-Credentials` missing

**Solutions:**
1. Use specific origin, not `*`
2. Ensure origin matches exactly (including protocol and port)
3. Always include `Access-Control-Allow-Credentials: true` if sending credentials

---

## Summary

**CORS Implementation Strategy:**

1. **Primary:** Lambda handlers explicitly return CORS headers for all responses
2. **Backup:** API Gateway CORS configuration (handles edge cases)
3. **Infrastructure:** Cloudflare proxies requests but doesn't modify CORS headers

**Key Principles:**

- ✅ Use specific origins (not wildcards) for security
- ✅ Handle OPTIONS preflight explicitly in Lambda
- ✅ Include CORS headers in ALL responses (success and error)
- ✅ Support credentials with `Access-Control-Allow-Credentials: true`
- ✅ Validate origin against whitelist
- ✅ Test through Cloudflare proxy, not just direct API Gateway

**Files Modified:**
- `lambda/lib/cors.ts` - Shared CORS utility
- `lambda/handlers/*.ts` - All HTTP handlers updated
- `lambda/template.yaml` - API Gateway CORS config

This setup ensures CORS works reliably through Cloudflare proxy while maintaining security best practices.

