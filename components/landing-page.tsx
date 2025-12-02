"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { LogIn } from "lucide-react"
import { Nav } from "@/components/nav"
import { Footer } from "@/components/footer"
import { createRoom, getRoom } from "@/lib/api"

interface LandingPageProps {
  onCreateRoom?: (roomId: string) => void
  onJoinRoom?: (roomId: string) => void
}

export function LandingPage({ onCreateRoom, onJoinRoom }: LandingPageProps) {
  const router = useRouter()
  const [roomName, setRoomName] = useState("")
  const [joinCode, setJoinCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showJoinModal, setShowJoinModal] = useState(false)
  const [joinError, setJoinError] = useState("")
  const [hasInvalidChars, setHasInvalidChars] = useState(false)

  const handleRoomNameChange = (value: string) => {
    // Check if input contains invalid characters (symbols)
    const hasSymbols = /[^a-zA-Z0-9\s]/.test(value)
    setHasInvalidChars(hasSymbols)
    
    // Only allow letters, numbers, and spaces
    const filtered = value.replace(/[^a-zA-Z0-9\s]/g, '')
    // Replace spaces with hyphens in real-time
    const formatted = filtered.replace(/\s/g, '-')
    setRoomName(formatted)
  }

  const handleCreateRoom = async () => {
    const formattedName = roomName.trim()
    if (formattedName) {
      setIsLoading(true)
      try {
        const { roomId } = await createRoom({ name: formattedName })
        // Use window.location for full page navigation (works with static export)
        // This ensures S3 serves index.html and Next.js client router handles it
        window.location.href = `/rooms/${roomId}/`
        onCreateRoom?.(roomId)
      } catch (error) {
        console.error("Error creating room:", error)
        alert(error instanceof Error ? error.message : "Failed to create room. Please try again.")
        setIsLoading(false)
      }
    }
  }

  const handleJoinRoom = async () => {
    if (joinCode.trim().length === 0) {
      setJoinError("Please enter a room code")
      return
    }

    setIsLoading(true)
    setJoinError("")
    try {
      await getRoom(joinCode)
      // Use window.location for full page navigation (works with static export)
      // This ensures S3 serves index.html and Next.js client router handles it
      window.location.href = `/rooms/${joinCode}/`
      onJoinRoom?.(joinCode)
    } catch (error) {
      console.error("Error joining room:", error)
      if (error instanceof Error && error.message === "Room not found") {
        setJoinError("Room not found. Check your code and try again.")
      } else {
        setJoinError("Failed to join room. Please try again.")
      }
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Skip to main content link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-accent focus:text-accent-foreground focus:rounded-lg focus:font-semibold"
      >
        Skip to main content
      </a>

      <Nav />

      {/* Main Content */}
      <main id="main-content" className="flex-1 flex items-center justify-center px-4 py-12" role="main">
        <div className="w-full max-w-2xl space-y-8 text-center">
          <header className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground text-balance">
              Estimate Together, Instantly
            </h1>
            <p className="text-lg text-muted-foreground text-balance">
              Real-time scrum poker planning for distributed teams. Create a room, invite your team, and start estimating.
            </p>
          </header>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-card border border-border space-y-1">
              <div className="text-xl">⚡</div>
              <h3 className="font-semibold text-foreground text-sm">Instant Setup</h3>
              <p className="text-xs text-muted-foreground">No configuration needed</p>
            </div>
            <div className="p-4 rounded-lg bg-card border border-border space-y-1">
              <div className="text-xl">👥</div>
              <h3 className="font-semibold text-foreground text-sm">Real-time Sync</h3>
              <p className="text-xs text-muted-foreground">See votes instantly</p>
            </div>
            <div className="p-4 rounded-lg bg-card border border-border space-y-1">
              <div className="text-xl">🎯</div>
              <h3 className="font-semibold text-foreground text-sm">Built for Teams</h3>
              <p className="text-xs text-muted-foreground">Unlimited participants</p>
            </div>
          </div>

          {/* Create Room Card */}
          <Card className="bg-card border-border p-8 space-y-6">
            <div className="space-y-3">
              <label htmlFor="room-name-input" className="block text-sm font-medium text-foreground text-left">Room Name</label>
              <Input
                id="room-name-input"
                placeholder="e.g., Sprint 25 Estimation"
                value={roomName}
                onChange={(e) => handleRoomNameChange(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleCreateRoom()}
                className={`bg-secondary border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  hasInvalidChars 
                    ? "border-destructive focus:ring-destructive" 
                    : "focus:ring-accent"
                }`}
                aria-required="true"
                aria-describedby="room-name-description"
                aria-invalid={hasInvalidChars}
              />
              {hasInvalidChars && (
                <p className="text-sm text-destructive" role="alert">
                  Symbols are not allowed. Only letters, numbers, and spaces are permitted.
                </p>
              )}
              <p id="room-name-description" className="sr-only">Enter a name for your estimation room</p>
            </div>

            <Button
              onClick={handleCreateRoom}
              disabled={!roomName.trim() || isLoading}
              className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold py-6 text-base rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label={isLoading ? "Creating room" : "Create estimation room"}
            >
              {isLoading ? "Creating..." : "Create Estimation Room"}
            </Button>

            {/* Join Room Button */}
            <Button
              onClick={() => setShowJoinModal(true)}
              variant="outline"
              className="w-full border-border text-foreground hover:bg-secondary bg-transparent py-6 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
              aria-label="Join room with code"
            >
              <LogIn className="w-4 h-4" aria-hidden="true" />
              Join Room with Code
            </Button>

            <p className="text-xs text-muted-foreground">Share the room code with your team. No sign-up required.</p>
          </Card>

          <Card className="bg-card border-border p-6 space-y-4 text-left">
            <h2 className="text-base font-bold text-foreground">How to Play Scrum Poker</h2>
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex gap-3">
                <span className="font-bold text-accent flex-shrink-0">1.</span>
                <p>
                  <strong className="text-foreground">Create a Room:</strong> Enter a name for your estimation session and
                  share the room code with your team.
                </p>
              </div>
              <div className="flex gap-3">
                <span className="font-bold text-accent flex-shrink-0">2.</span>
                <p>
                  <strong className="text-foreground">Select Estimates:</strong> Each team member privately selects a
                  Fibonacci number card (1, 2, 3, 5, 8, 13, 21, 34) representing their complexity estimate.
                </p>
              </div>
              <div className="flex gap-3">
                <span className="font-bold text-accent flex-shrink-0">3.</span>
                <p>
                  <strong className="text-foreground">Reveal Votes:</strong> Click "Reveal Votes" to show all estimates at
                  once. Watch for outliers and consensus.
                </p>
              </div>
              <div className="flex gap-3">
                <span className="font-bold text-accent flex-shrink-0">4.</span>
                <p>
                  <strong className="text-foreground">Discuss:</strong> If there's disagreement, team members discuss why
                  they chose different values. Use the discussion timer to keep focused.
                </p>
              </div>
              <div className="flex gap-3">
                <span className="font-bold text-accent flex-shrink-0">5.</span>
                <p>
                  <strong className="text-foreground">Re-estimate:</strong> After discussion, proceed to the next estimate
                  round. Repeat until consensus is reached.
                </p>
              </div>
            </div>
          </Card>

          <Footer />
        </div>
      </main>

      {showJoinModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="bg-card border-border p-8 space-y-6 w-full max-w-md">
            <h2 className="text-2xl font-bold text-foreground">Join Estimation Room</h2>

            <div className="space-y-2">
              <label htmlFor="join-code-input" className="block text-sm font-medium text-foreground">Room Code or Room ID</label>
              <Input
                id="join-code-input"
                placeholder="e.g., a1b2 or sprint-25-a1b2"
                value={joinCode}
                onChange={(e) => {
                  setJoinCode(e.target.value.toLowerCase().trim())
                  setJoinError("")
                }}
                onKeyPress={(e) => e.key === "Enter" && handleJoinRoom()}
                className="bg-secondary border-border text-foreground placeholder:text-muted-foreground font-mono text-lg text-center focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
                autoFocus
                aria-required="true"
                aria-invalid={!!joinError}
                aria-describedby={joinError ? "join-error" : "join-code-description"}
              />
              <p id="join-code-description" className="text-xs text-muted-foreground">Enter the 4-character code or full room ID</p>
            </div>

            {joinError && (
              <p id="join-error" className="text-sm text-destructive" role="alert" aria-live="polite">
                {joinError}
              </p>
            )}

            <div className="flex gap-3">
              <Button
                onClick={() => {
                  setShowJoinModal(false)
                  setJoinError("")
                  setJoinCode("")
                }}
                variant="outline"
                className="flex-1 border-border text-foreground hover:bg-secondary bg-transparent focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
                aria-label="Cancel joining room"
              >
                Cancel
              </Button>
              <Button
                onClick={handleJoinRoom}
                disabled={!joinCode.trim() || isLoading}
                className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground font-semibold focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label={isLoading ? "Joining room" : "Join room"}
              >
                {isLoading ? "Joining..." : "Join"}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
