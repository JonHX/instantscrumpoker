"use client"

import { useRouter } from "next/navigation"
import { PokerRoom } from "@/components/poker-room"

export default function RoomPage({ params }: { params: { roomId: string } }) {
  const router = useRouter()
  const roomId = params.roomId

  return <PokerRoom roomId={roomId} onExit={() => router.push("/")} />
}

