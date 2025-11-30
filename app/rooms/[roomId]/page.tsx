"use client"

import { useRouter } from "next/navigation"
import { PokerRoom } from "@/components/poker-room"

// Required for static export with dynamic routes
export function generateStaticParams() {
  // Return empty array - rooms are created dynamically at runtime
  // This allows the route to be generated but handled client-side
  return []
}

export default function RoomPage({ params }: { params: { roomId: string } }) {
  const router = useRouter()
  const roomId = params.roomId

  return <PokerRoom roomId={roomId} onExit={() => router.push("/")} />
}

