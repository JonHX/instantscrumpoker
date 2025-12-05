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
          <title>Room - Instant Scrum Poker | 100% Free</title>
          <meta name="description" content="Join a scrum poker room to estimate user stories with your team. 100% free, no sign-ups required." />
          <meta name="robots" content="noindex, nofollow" />
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
        <title>Room {roomId.toUpperCase()} - Instant Scrum Poker | 100% Free</title>
        <meta name="description" content="Join a scrum poker room to estimate user stories with your team. 100% free, no sign-ups required." />
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <PokerRoom roomId={roomId} onExit={() => router.push("/")} />
    </>
  )
}

