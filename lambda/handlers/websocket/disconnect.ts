import { APIGatewayProxyWebsocketEventV2 } from "aws-lambda";
import { docClient } from "../../lib/dynamodb";
import { DeleteCommand } from "@aws-sdk/lib-dynamodb";

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
    await docClient.send(
      new DeleteCommand({
        TableName: CONNECTIONS_TABLE,
        Key: {
          PK: `connectionId#${connectionId}`,
          SK: "METADATA",
        },
      })
    );

    return {
      statusCode: 200,
      body: "Disconnected",
    };
  } catch (error) {
    console.error("Error disconnecting:", error);
    return {
      statusCode: 500,
      body: "Disconnect failed",
    };
  }
};

