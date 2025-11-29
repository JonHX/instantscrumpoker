import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";

const dynamoClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(dynamoClient);

export async function generateRoomId(
  roomName: string,
  tableName: string,
  maxAttempts: number = 5
): Promise<string> {
  // Convert room name to URL-safe slug
  let slug = roomName
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "") // Remove special chars
    .replace(/\s+/g, "-") // Spaces to hyphens
    .replace(/-+/g, "-") // Multiple hyphens to single
    .replace(/^-|-$/g, ""); // Remove leading/trailing hyphens

  // Fallback if slug is empty
  if (!slug || slug.length === 0) {
    slug = "room";
  }

  // Generate 4-character alphanumeric code
  const chars = "0123456789abcdefghijklmnopqrstuvwxyz";
  
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const code = Array.from({ length: 4 }, () =>
      chars[Math.floor(Math.random() * chars.length)]
    ).join("");

    const roomId = `${slug}-${code}`;
    const pk = `roomId#${roomId}`;

    // Check if roomId already exists
    try {
      const result = await docClient.send(
        new GetCommand({
          TableName: tableName,
          Key: {
            PK: pk,
            SK: "METADATA",
          },
        })
      );

      // If room doesn't exist, return this roomId
      if (!result.Item) {
        return roomId;
      }

      // Room exists, try again
      console.log(`RoomId ${roomId} already exists, retrying...`);
    } catch (error) {
      // If error is not "item not found", it's a real error
      if ((error as any).name !== "ResourceNotFoundException") {
        throw error;
      }
      // Item not found is good - roomId is available
      return roomId;
    }
  }

  // If all attempts failed, append timestamp to ensure uniqueness
  const timestamp = Date.now().toString(36).slice(-4);
  return `${slug}-${timestamp}`;
}

