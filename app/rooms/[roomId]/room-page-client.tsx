"use client"

import { useRouter } from "next/navigation"
import { PokerRoom } from "@/components/poker-room"

export function RoomPageClient({ roomId }: { roomId: string }) {
  const router = useRouter()

  return <PokerRoom roomId={roomId} onExit={() => router.push("/")} />
}


