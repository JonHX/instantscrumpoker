import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { getRoomData } from "../lib/dynamodb";

const TABLE_NAME = process.env.TABLE_NAME || "";

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
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

    const roomData = await getRoomData(TABLE_NAME, roomId);

    if (!roomData) {
      return {
        statusCode: 404,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
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
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ error: "Failed to fetch room" }),
    };
  }
};

