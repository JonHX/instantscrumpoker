"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { RoomPageClient } from "@/app/rooms/[roomId]/room-page-client"

export default function NotFound() {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Extract roomId from pathname if it's a room route
    const roomMatch = pathname?.match(/^\/rooms\/([^\/]+)/)
    if (roomMatch) {
      // This is a room route that wasn't statically generated
      // The RoomPageClient will handle it client-side
      return
    }
    
    // For other 404s, redirect to home after a moment
    if (pathname && pathname !== '/404' && pathname !== '/_not-found') {
      const timer = setTimeout(() => {
        router.push('/')
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [pathname, router])

  // If this is a room route, render the room component client-side
  const roomMatch = pathname?.match(/^\/rooms\/([^\/]+)/)
  if (roomMatch) {
    const roomId = roomMatch[1]
    return <RoomPageClient roomId={roomId} />
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-gray-600 mb-4">This page could not be found.</p>
        <button
          onClick={() => router.push('/')}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Go Home
        </button>
      </div>
    </div>
  )
}

