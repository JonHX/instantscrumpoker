import { useRouter } from "next/router"
import Head from "next/head"
import { PokerRoom } from "@/components/poker-room"

export default function RoomPage() {
  const router = useRouter()
  const { roomId } = router.query

  // Wait for router to be ready and roomId to be available (Next.js 16 Pages Router pattern)
  if (!router.isReady || !roomId || typeof roomId !== "string") {
    return (
      <>
        <Head>
          <title>Room - Instant Scrum Poker</title>
        </Head>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-muted-foreground">Loading room...</p>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Head>
        <title>Room - Instant Scrum Poker</title>
      </Head>
      <PokerRoom roomId={roomId} onExit={() => router.push("/")} />
    </>
  )
}

