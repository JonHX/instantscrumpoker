import {
  ApiGatewayManagementApiClient,
  PostToConnectionCommand,
} from "@aws-sdk/client-apigatewaymanagementapi";
import { docClient } from "./dynamodb";
import { QueryCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";

const CONNECTIONS_TABLE = process.env.CONNECTIONS_TABLE || "";

export function getApiGatewayClient(endpoint: string): ApiGatewayManagementApiClient {
  return new ApiGatewayManagementApiClient({
    endpoint: endpoint.replace("wss://", "https://").replace("ws://", "http://"),
  });
}

export async function getConnectionsByRoom(
  roomId: string
): Promise<Array<{ connectionId: string }>> {
  const result = await docClient.send(
    new QueryCommand({
      TableName: CONNECTIONS_TABLE,
      IndexName: "GSI1",
      KeyConditionExpression: "GSI1PK = :pk",
      ExpressionAttributeValues: {
        ":pk": `roomId#${roomId}`,
      },
    })
  );

  return (
    result.Items?.map((item: any) => ({
      connectionId: item.connectionId,
    })) || []
  );
}

export async function broadcastToRoom(
  endpoint: string,
  roomId: string,
  message: any
): Promise<void> {
  const connections = await getConnectionsByRoom(roomId);
  const apiGateway = getApiGatewayClient(endpoint);
  const messageData = JSON.stringify(message);

  await Promise.allSettled(
    connections.map(async (conn) => {
      try {
        await apiGateway.send(
          new PostToConnectionCommand({
            ConnectionId: conn.connectionId,
            Data: messageData,
          })
        );
      } catch (error: any) {
        // Handle stale connections (410 Gone)
        if (error.statusCode === 410) {
          // Delete stale connection
          await docClient.send(
            new DeleteCommand({
              TableName: CONNECTIONS_TABLE,
              Key: {
                PK: `connectionId#${conn.connectionId}`,
                SK: "METADATA",
              },
            })
          );
        }
      }
    })
  );
}

