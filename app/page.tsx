"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { LandingPage } from "@/components/landing-page"

function HomeContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Handle direct room access from query param (backward compatibility)
    const joinRoomId = searchParams.get("join")
    if (joinRoomId) {
      router.push(`/rooms/${joinRoomId}`)
    }
  }, [searchParams, router])

  if (!mounted) {
    return null
  }

  return <LandingPage />
}

export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomeContent />
    </Suspense>
  )
}
