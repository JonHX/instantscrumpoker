import { APIGatewayProxyWebsocketEventV2 } from "aws-lambda";
import { docClient, calculateTTL } from "../../lib/dynamodb";
import { PutCommand } from "@aws-sdk/lib-dynamodb";

const CONNECTIONS_TABLE = process.env.CONNECTIONS_TABLE || "";

export const handler = async (event: APIGatewayProxyWebsocketEventV2) => {
  const connectionId = event.requestContext.connectionId;

  if (!connectionId) {
    return {
      statusCode: 400,
      body: "Missing connectionId",
    };
  }

  try {
    const ttl = calculateTTL(1); // Connections expire after 1 day

    await docClient.send(
      new PutCommand({
        TableName: CONNECTIONS_TABLE,
        Item: {
          PK: `connectionId#${connectionId}`,
          SK: "METADATA",
          connectionId,
          connectedAt: new Date().toISOString(),
          TTL: ttl,
        },
      })
    );

    return {
      statusCode: 200,
      body: "Connected",
    };
  } catch (error) {
    console.error("Error connecting:", error);
    return {
      statusCode: 500,
      body: "Connection failed",
    };
  }
};

