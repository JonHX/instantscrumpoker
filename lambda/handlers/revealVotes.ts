import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { docClient, calculateTTL } from "../lib/dynamodb";
import { UpdateCommand, GetCommand } from "@aws-sdk/lib-dynamodb";
import { broadcastToRoom } from "../lib/websocket";

const TABLE_NAME = process.env.ROOMS_TABLE || process.env.TABLE_NAME || "";
const WS_ENDPOINT = process.env.WS_ENDPOINT || "";

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  // Handle OPTIONS preflight request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
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
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({ error: "Room ID is required" }),
      };
    }

    const pk = `roomId#${roomId}`;

    // Get current estimate
    const estimateResult = await docClient.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: {
          PK: pk,
          SK: "estimate#CURRENT",
        },
      })
    );

    if (!estimateResult.Item) {
      return {
        statusCode: 404,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({ error: "No active estimate found" }),
      };
    }

    const ttl = calculateTTL(20);

    // Update estimate to revealed = true
    await docClient.send(
      new UpdateCommand({
        TableName: TABLE_NAME,
        Key: {
          PK: pk,
          SK: "estimate#CURRENT",
        },
        UpdateExpression: "SET revealed = :revealed, #ttl = :ttl",
        ExpressionAttributeNames: {
          "#ttl": "TTL",
        },
        ExpressionAttributeValues: {
          ":revealed": true,
          ":ttl": ttl,
        },
      })
    );

    // Broadcast reveal event to all participants
    if (WS_ENDPOINT) {
      await broadcastToRoom(WS_ENDPOINT, roomId, {
        type: "reveal",
        revealed: true,
      });
    }

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ success: true }),
    };
  } catch (error) {
    console.error("Error revealing votes:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        error: "Failed to reveal votes",
        message: errorMessage,
        stack: process.env.NODE_ENV === "development" ? errorStack : undefined,
      }),
    };
  }
};

