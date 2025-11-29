import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { docClient, calculateTTL } from "../lib/dynamodb";
import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { generateRoomId } from "../lib/roomIdGenerator";

const TABLE_NAME = process.env.TABLE_NAME || "";

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const body = JSON.parse(event.body || "{}");
    const { name } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({ error: "Room name is required" }),
      };
    }

    // Generate unique roomId
    const roomId = await generateRoomId(name.trim(), TABLE_NAME);
    const pk = `roomId#${roomId}`;
    const ttl = calculateTTL(20);

    // Create room metadata
    await docClient.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: {
          PK: pk,
          SK: "METADATA",
          name: name.trim(),
          created_at: new Date().toISOString(),
          created_by: "guest",
          is_discussing: false,
          TTL: ttl,
        },
      })
    );

    return {
      statusCode: 201,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ roomId }),
    };
  } catch (error) {
    console.error("Error creating room:", error);
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ error: "Failed to create room" }),
    };
  }
};

