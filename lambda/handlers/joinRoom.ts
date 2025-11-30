import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { docClient, calculateTTL } from "../lib/dynamodb";
import { UpdateCommand, GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import { broadcastToRoom } from "../lib/websocket";

const TABLE_NAME = process.env.ROOMS_TABLE || process.env.TABLE_NAME || "";
const WS_ENDPOINT = process.env.WS_ENDPOINT || "";

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const roomId = event.pathParameters?.roomId;
    const body = JSON.parse(event.body || "{}");
    const { name } = body;

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

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({ error: "Name is required" }),
      };
    }

    const pk = `roomId#${roomId}`;

    // Check if room exists
    const roomCheck = await docClient.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: {
          PK: pk,
          SK: "METADATA",
        },
      })
    );

    if (!roomCheck.Item) {
      return {
        statusCode: 404,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({ error: "Room not found" }),
      };
    }

    // Generate participantId
    const participantId = `participant-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    const ttl = calculateTTL(20);

    // Add participant to room metadata
    await docClient.send(
      new UpdateCommand({
        TableName: TABLE_NAME,
        Key: {
          PK: pk,
          SK: "METADATA",
        },
        UpdateExpression:
          "SET participants = list_append(if_not_exists(participants, :empty), :newParticipant)",
        ExpressionAttributeValues: {
          ":empty": [],
          ":newParticipant": [
            {
              id: participantId,
              name: name.trim(),
              joinedAt: new Date().toISOString(),
            },
          ],
        },
      })
    );

    // Create participant record
    await docClient.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: {
          PK: pk,
          SK: `participant#${participantId}`,
          participantId,
          name: name.trim(),
          joinedAt: new Date().toISOString(),
          TTL: ttl,
        },
      })
    );

    // Broadcast join event
    if (WS_ENDPOINT) {
      await broadcastToRoom(WS_ENDPOINT, roomId, {
        type: "join",
        participantId,
        name: name.trim(),
      });
    }

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ participantId }),
    };
  } catch (error) {
    console.error("Error joining room:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ 
        error: "Failed to join room",
        message: errorMessage,
        stack: process.env.NODE_ENV === "development" ? errorStack : undefined,
      }),
    };
  }
};

