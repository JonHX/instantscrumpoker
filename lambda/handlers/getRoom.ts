import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { getRoomData } from "../lib/dynamodb";
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
    const roomId = event.pathParameters?.roomId;

    if (!roomId) {
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json",
          ...getCorsHeaders(origin),
        },
        body: JSON.stringify({ error: "Room ID is required" }),
      };
    }

    const roomData = await getRoomData(TABLE_NAME, roomId);

    if (!roomData) {
      return {
        statusCode: 404,
        headers: {
          "Content-Type": "application/json",
          ...getCorsHeaders(origin),
        },
        body: JSON.stringify({ error: "Room not found" }),
      };
    }

    // Transform to match current API format
    const response = {
      id: roomId,
      name: roomData.name,
      participants: roomData.participants.map((p) => ({
        id: p.id,
        name: p.name,
        joinedAt: p.joinedAt,
        vote: roomData.currentEstimate?.votes[p.id]?.estimate,
      })),
    };

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify(response),
    };
  } catch (error) {
    console.error("Error fetching room:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ 
        error: "Failed to fetch room",
        message: errorMessage,
        stack: process.env.NODE_ENV === "development" ? errorStack : undefined,
      }),
    };
  }
};

