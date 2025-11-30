import { getApiUrl } from "./api-config"

export interface CreateRoomRequest {
  name: string
}

export interface CreateRoomResponse {
  roomId: string
}

export interface RoomData {
  name: string
  participants: Array<{
    id: string
    name: string
    joinedAt: string
    vote?: string
    voted?: boolean
  }>
  currentEstimate?: {
    story_id: string
    story_title: string
    votes: Record<string, { estimate: string; votedAt: string }>
    revealed: boolean
  }
}

export interface JoinRoomRequest {
  name: string
}

export interface JoinRoomResponse {
  participantId: string
}

export interface VoteRequest {
  participantId: string
  estimate: string
}

export interface VoteResponse {
  success: boolean
}

export interface RevealVotesResponse {
  success: boolean
}

export interface NextEstimateRequest {
  outcome?: string
}

export interface NextEstimateResponse {
  success: boolean
}

/**
 * Create a new room
 */
export async function createRoom(data: CreateRoomRequest): Promise<CreateRoomResponse> {
  const response = await fetch(`${getApiUrl()}/rooms`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Failed to create room" }))
    throw new Error(error.error || "Failed to create room")
  }

  return response.json()
}

/**
 * Get room data by room ID
 */
export async function getRoom(roomId: string): Promise<RoomData> {
  const response = await fetch(`${getApiUrl()}/rooms/${roomId}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  })

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("Room not found")
    }
    const error = await response.json().catch(() => ({ error: "Failed to fetch room" }))
    throw new Error(error.error || "Failed to fetch room")
  }

  return response.json()
}

/**
 * Join a room
 */
export async function joinRoom(roomId: string, data: JoinRoomRequest): Promise<JoinRoomResponse> {
  const response = await fetch(`${getApiUrl()}/rooms/${roomId}/join`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Failed to join room" }))
    throw new Error(error.error || "Failed to join room")
  }

  return response.json()
}

/**
 * Submit a vote
 */
export async function submitVote(roomId: string, data: VoteRequest): Promise<VoteResponse> {
  const response = await fetch(`${getApiUrl()}/rooms/${roomId}/vote`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Failed to submit vote" }))
    throw new Error(error.error || "Failed to submit vote")
  }

  return response.json()
}

/**
 * Reveal votes to all participants
 */
export async function revealVotes(roomId: string): Promise<RevealVotesResponse> {
  const response = await fetch(`${getApiUrl()}/rooms/${roomId}/reveal`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Failed to reveal votes" }))
    throw new Error(error.error || "Failed to reveal votes")
  }

  return response.json()
}

/**
 * Move to next estimate round
 */
export async function nextEstimate(roomId: string, data?: NextEstimateRequest): Promise<NextEstimateResponse> {
  const response = await fetch(`${getApiUrl()}/rooms/${roomId}/next`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data || {}),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Failed to move to next estimate" }))
    throw new Error(error.error || "Failed to move to next estimate")
  }

  return response.json()
}
