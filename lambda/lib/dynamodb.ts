import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  QueryCommand,
  PutCommand,
  UpdateCommand,
  DeleteCommand,
  GetCommand,
} from "@aws-sdk/lib-dynamodb";

const dynamoClient = new DynamoDBClient({});
export const docClient = DynamoDBDocumentClient.from(dynamoClient);

export interface RoomData {
  name: string;
  participants: Array<{
    id: string;
    name: string;
    joinedAt: string;
  }>;
  currentEstimate?: {
    story_id: string;
    story_title: string;
    votes: Record<string, { estimate: string; votedAt: string }>;
    revealed: boolean;
  };
}

export async function getRoomData(
  tableName: string,
  roomId: string
): Promise<RoomData | null> {
  const pk = `roomId#${roomId}`;

  // Get room metadata
  const metadataResult = await docClient.send(
    new GetCommand({
      TableName: tableName,
      Key: {
        PK: pk,
        SK: "METADATA",
      },
    })
  );

  if (!metadataResult.Item) {
    return null;
  }

  // Get participants
  const participantsResult = await docClient.send(
    new QueryCommand({
      TableName: tableName,
      KeyConditionExpression: "PK = :pk AND begins_with(SK, :sk)",
      ExpressionAttributeValues: {
        ":pk": pk,
        ":sk": "participant#",
      },
    })
  );

  // Get current estimate
  const estimateResult = await docClient.send(
    new GetCommand({
      TableName: tableName,
      Key: {
        PK: pk,
        SK: "estimate#CURRENT",
      },
    })
  );

  const participants =
    participantsResult.Items?.map((item: any) => ({
      id: item.participantId,
      name: item.name,
      joinedAt: item.joinedAt,
    })) || [];

  const currentEstimate = estimateResult.Item
    ? {
        story_id: estimateResult.Item.story_id,
        story_title: estimateResult.Item.story_title,
        votes: estimateResult.Item.votes || {},
        revealed: estimateResult.Item.revealed || false,
      }
    : undefined;

  return {
    name: metadataResult.Item.name,
    participants,
    currentEstimate,
  };
}

export function calculateTTL(days: number = 20): number {
  return Math.floor(Date.now() / 1000) + days * 24 * 60 * 60;
}

