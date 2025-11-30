import { APIGatewayProxyEvent } from "aws-lambda";
import { docClient } from "./dynamodb";
import { PutCommand, GetCommand } from "@aws-sdk/lib-dynamodb";

const RATE_LIMIT_TABLE = process.env.RATE_LIMIT_TABLE || "";
const MAX_REQUESTS = 100;
const WINDOW_MINUTES = 20;

interface RateLimitData {
  ipAddress: string
  requestCount: number
  windowStart: number
  expiresAt: number
}

/**
 * Check if request should be rate limited
 * Returns true if request should be allowed, false if rate limited
 */
export async function checkRateLimit(event: APIGatewayProxyEvent): Promise<boolean> {
  if (!RATE_LIMIT_TABLE) {
    console.warn("Rate limit table not configured, allowing request");
    return true;
  }

  // Get IP address from request
  const ipAddress = 
    event.requestContext?.http?.sourceIp || 
    event.requestContext?.identity?.sourceIp ||
    event.headers?.["x-forwarded-for"]?.split(",")[0] ||
    "unknown";

  if (ipAddress === "unknown") {
    console.warn("Could not determine IP address, allowing request");
    return true;
  }

  const now = Date.now();
  const windowStart = now - (WINDOW_MINUTES * 60 * 1000);

  try {
    // Get current rate limit data
    const result = await docClient.send(
      new GetCommand({
        TableName: RATE_LIMIT_TABLE,
        Key: {
          PK: `ip#${ipAddress}`,
          SK: "RATE_LIMIT",
        },
      })
    );

    const data = result.Item as RateLimitData | undefined;

    // If no data or window expired, create new window
    if (!data || data.windowStart < windowStart) {
      await docClient.send(
        new PutCommand({
          TableName: RATE_LIMIT_TABLE,
          Item: {
            PK: `ip#${ipAddress}`,
            SK: "RATE_LIMIT",
            ipAddress,
            requestCount: 1,
            windowStart: now,
            expiresAt: Math.floor(now / 1000) + (WINDOW_MINUTES * 60) + 300, // TTL: window + 5 min buffer
          },
        })
      );
      return true;
    }

    // Check if limit exceeded
    if (data.requestCount >= MAX_REQUESTS) {
      console.log(`Rate limit exceeded for IP ${ipAddress}: ${data.requestCount} requests`);
      return false;
    }

    // Increment counter
    await docClient.send(
      new PutCommand({
        TableName: RATE_LIMIT_TABLE,
        Item: {
          ...data,
          requestCount: data.requestCount + 1,
          expiresAt: Math.floor(now / 1000) + (WINDOW_MINUTES * 60) + 300,
        },
      })
    );

    return true;
  } catch (error) {
    console.error("Error checking rate limit:", error);
    // On error, allow request (fail open)
    return true;
  }
}

/**
 * Create rate limit error response
 */
export function createRateLimitResponse() {
  return {
    statusCode: 429,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Retry-After": String(WINDOW_MINUTES * 60),
    },
    body: JSON.stringify({
      error: "Rate limit exceeded",
      message: `Too many requests. Please try again in ${WINDOW_MINUTES} minutes.`,
      limit: MAX_REQUESTS,
      window: `${WINDOW_MINUTES} minutes`,
    }),
  };
}

