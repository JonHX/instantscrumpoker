"use client"

import { useRouter, usePathname } from "next/navigation"
import { PokerRoom } from "@/components/poker-room"
import { useEffect, useState } from "react"

export function RoomPageClient({ roomId }: { roomId: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const [actualRoomId, setActualRoomId] = useState(roomId || "")

  // Extract roomId directly from URL pathname for client-side routing
  // This ensures it works when S3 serves index.html for any /rooms/[roomId] route
  useEffect(() => {
    if (pathname) {
      const roomMatch = pathname.match(/^\/rooms\/([^\/]+)/)
      if (roomMatch) {
        const urlRoomId = roomMatch[1]
        if (urlRoomId !== actualRoomId) {
          setActualRoomId(urlRoomId)
        }
      }
    } else if (typeof window !== "undefined") {
      // Fallback: read from window.location if pathname not available
      const match = window.location.pathname.match(/^\/rooms\/([^\/]+)/)
      if (match && match[1] !== actualRoomId) {
        setActualRoomId(match[1])
      }
    }
  }, [pathname, actualRoomId])

  if (!actualRoomId) {
    return null
  }

  return <PokerRoom roomId={actualRoomId} onExit={() => router.push("/")} />
}


