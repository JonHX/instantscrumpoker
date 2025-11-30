import { useRouter } from "next/router"
import { PokerRoom } from "@/components/poker-room"

export default function RoomPage() {
  const router = useRouter()
  const { roomId } = router.query

  // Wait for router to be ready and roomId to be available
  if (!router.isReady || !roomId || typeof roomId !== "string") {
    return null
  }

  return <PokerRoom roomId={roomId} onExit={() => router.push("/")} />
}

