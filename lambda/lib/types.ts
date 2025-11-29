export interface RoomMetadata {
  PK: string;
  SK: string;
  name: string;
  created_at: string;
  created_by: string;
  current_story_id?: string;
  current_story_title?: string;
  is_discussing: boolean;
  TTL: number;
}

export interface Participant {
  PK: string;
  SK: string;
  participantId: string;
  name: string;
  joinedAt: string;
  TTL: number;
}

export interface Estimate {
  PK: string;
  SK: string;
  story_id: string;
  story_title: string;
  votes: Record<string, { estimate: string; votedAt: string }>;
  revealed: boolean;
  created_at: string;
  final_estimate?: number;
  completed_at?: string;
  TTL: number;
}

export interface Connection {
  PK: string;
  SK: string;
  connectionId: string;
  roomId: string;
  connectedAt: string;
  TTL: number;
}

export interface CreateRoomRequest {
  name: string;
}

export interface JoinRoomRequest {
  name: string;
}

export interface VoteRequest {
  participantId: string;
  estimate: string;
}

export interface WebSocketMessage {
  action: string;
  roomId?: string;
  [key: string]: any;
}

