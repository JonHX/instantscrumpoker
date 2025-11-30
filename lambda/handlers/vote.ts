import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { docClient, calculateTTL } from "../lib/dynamodb";
import { UpdateCommand, GetCommand } from "@aws-sdk/lib-dynamodb";
import { broadcastToRoom } from "../lib/websocket";

const TABLE_NAME = process.env.ROOMS_TABLE || process.env.TABLE_NAME || "";
const WS_ENDPOINT = process.env.WS_ENDPOINT || "";

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const roomId = event.pathParameters?.roomId;
    const body = JSON.parse(event.body || "{}");
    const { participantId, estimate } = body;

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

    if (!participantId || !estimate) {
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({ error: "participantId and estimate are required" }),
      };
    }

    const pk = `roomId#${roomId}`;

    // Get or create current estimate
    const estimateResult = await docClient.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: {
          PK: pk,
          SK: "estimate#CURRENT",
        },
      })
    );

    const currentEstimate = estimateResult.Item || {
      story_id: `story-${Date.now()}`,
      story_title: "Current Estimate",
      votes: {},
      revealed: false,
      created_at: new Date().toISOString(),
    };

    // Update votes
    const updatedVotes = {
      ...(currentEstimate.votes || {}),
      [participantId]: {
        estimate,
        votedAt: new Date().toISOString(),
      },
    };

    const ttl = calculateTTL(20);

    // Update or create estimate
    await docClient.send(
      new UpdateCommand({
        TableName: TABLE_NAME,
        Key: {
          PK: pk,
          SK: "estimate#CURRENT",
        },
        UpdateExpression:
          "SET story_id = :sid, story_title = :title, votes = :votes, revealed = :revealed, created_at = :created, TTL = :ttl",
        ExpressionAttributeValues: {
          ":sid": currentEstimate.story_id,
          ":title": currentEstimate.story_title,
          ":votes": updatedVotes,
          ":revealed": currentEstimate.revealed || false,
          ":created": currentEstimate.created_at || new Date().toISOString(),
          ":ttl": ttl,
        },
      })
    );

    // Broadcast vote event
    if (WS_ENDPOINT) {
      await broadcastToRoom(WS_ENDPOINT, roomId, {
        type: "vote",
        participantId,
        estimate,
        voted: true,
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
    console.error("Error submitting vote:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ 
        error: "Failed to submit vote",
        message: errorMessage,
        stack: process.env.NODE_ENV === "development" ? errorStack : undefined,
      }),
    };
  }
};

