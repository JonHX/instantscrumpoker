"use client"

import { useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { LandingPage } from "@/components/landing-page"

function HomeContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Handle direct room access from query param (backward compatibility)
    const joinRoomId = searchParams.get("join")
    if (joinRoomId) {
      router.push(`/rooms/${joinRoomId}`)
    }
  }, [searchParams, router])

  return <LandingPage />
}

export default function Home() {
  return (
    <Suspense fallback={null}>
      <HomeContent />
    </Suspense>
  )
}
