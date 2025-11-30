import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { docClient, calculateTTL } from "../lib/dynamodb";
import { UpdateCommand, GetCommand } from "@aws-sdk/lib-dynamodb";
import { broadcastToRoom } from "../lib/websocket";
import { getCorsHeaders, getOrigin } from "../lib/cors";

const TABLE_NAME = process.env.ROOMS_TABLE || process.env.TABLE_NAME || "";
const WS_ENDPOINT = process.env.WS_ENDPOINT || "";

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
    const body = event.body ? JSON.parse(event.body) : {};
    const { outcome } = body; // Optional: final outcome for the previous estimate

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
          ...getCorsHeaders(origin),
        },
        body: JSON.stringify({ error: "No active estimate found" }),
      };
    }

    const currentEstimate = estimateResult.Item;

    // If outcome provided, save it to previous estimates
    if (outcome) {
      // Get or create previous estimates list
      const metadataResult = await docClient.send(
        new GetCommand({
          TableName: TABLE_NAME,
          Key: {
            PK: pk,
            SK: "METADATA",
          },
        })
      );

      const previousEstimates = metadataResult.Item?.previousEstimates || [];
      
      // Add current estimate to previous estimates with outcome
      const estimateWithOutcome = {
        story_id: currentEstimate.story_id,
        story_title: currentEstimate.story_title || "Current Estimate",
        votes: currentEstimate.votes || {},
        revealed: currentEstimate.revealed || false,
        outcome: outcome,
        completedAt: new Date().toISOString(),
      };

      // Update metadata with new previous estimate
      await docClient.send(
        new UpdateCommand({
          TableName: TABLE_NAME,
          Key: {
            PK: pk,
            SK: "METADATA",
          },
          UpdateExpression: "SET previousEstimates = list_append(if_not_exists(previousEstimates, :empty), :newEstimate)",
          ExpressionAttributeValues: {
            ":empty": [],
            ":newEstimate": [estimateWithOutcome],
          },
        })
      );
    }

    // Create new empty estimate for next round
    const ttl = calculateTTL(20);
    const newStoryId = `story-${Date.now()}`;

    await docClient.send(
      new UpdateCommand({
        TableName: TABLE_NAME,
        Key: {
          PK: pk,
          SK: "estimate#CURRENT",
        },
        UpdateExpression: "SET story_id = :sid, story_title = :title, votes = :votes, revealed = :revealed, created_at = :created, #ttl = :ttl",
        ExpressionAttributeNames: {
          "#ttl": "TTL",
        },
        ExpressionAttributeValues: {
          ":sid": newStoryId,
          ":title": "Current Estimate",
          ":votes": {},
          ":revealed": false,
          ":created": new Date().toISOString(),
          ":ttl": ttl,
        },
      })
    );

    // Broadcast next estimate event to all participants
    if (WS_ENDPOINT) {
      await broadcastToRoom(WS_ENDPOINT, roomId, {
        type: "nextEstimate",
        outcome: outcome || null,
      });
    }

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        ...getCorsHeaders(origin),
      },
      body: JSON.stringify({ success: true }),
    };
  } catch (error) {
    console.error("Error moving to next estimate:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        ...getCorsHeaders(origin),
      },
      body: JSON.stringify({
        error: "Failed to move to next estimate",
        message: errorMessage,
        stack: process.env.NODE_ENV === "development" ? errorStack : undefined,
      }),
    };
  }
};

