import { APIGatewayProxyWebsocketEventV2 } from "aws-lambda";
import { docClient, calculateTTL } from "../../lib/dynamodb";
import { UpdateCommand } from "@aws-sdk/lib-dynamodb";

const CONNECTIONS_TABLE = process.env.CONNECTIONS_TABLE || "";

export const handler = async (event: APIGatewayProxyWebsocketEventV2) => {
  const connectionId = event.requestContext.connectionId;

  if (!connectionId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing connectionId" }),
    };
  }

  try {
    const body = event.body ? JSON.parse(event.body) : {};
    const { action, roomId } = body;

    if (action === "subscribe" && roomId) {
      const ttl = calculateTTL(1);

      // Update connection with roomId
      await docClient.send(
        new UpdateCommand({
          TableName: CONNECTIONS_TABLE,
          Key: {
            PK: `connectionId#${connectionId}`,
            SK: "METADATA",
          },
          UpdateExpression: "SET roomId = :roomId, GSI1PK = :gsi1pk, TTL = :ttl",
          ExpressionAttributeValues: {
            ":roomId": roomId,
            ":gsi1pk": `roomId#${roomId}`,
            ":ttl": ttl,
          },
        })
      );

      return {
        statusCode: 200,
        body: JSON.stringify({ message: "Subscribed to room" }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Message received" }),
    };
  } catch (error) {
    console.error("Error handling message:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to process message" }),
    };
  }
};

