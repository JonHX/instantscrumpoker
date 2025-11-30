"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Zap, Moon, Sun, LogIn } from "lucide-react"
import { createRoom, getRoom } from "@/lib/api"

interface LandingPageProps {
  onCreateRoom?: (roomId: string) => void
  onJoinRoom?: (roomId: string) => void
}

export function LandingPage({ onCreateRoom, onJoinRoom }: LandingPageProps) {
  const router = useRouter()
  const [roomName, setRoomName] = useState("")
  const [joinCode, setJoinCode] = useState("")
  const [isDark, setIsDark] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showJoinModal, setShowJoinModal] = useState(false)
  const [joinError, setJoinError] = useState("")

  const handleCreateRoom = async () => {
    if (roomName.trim()) {
      setIsLoading(true)
      try {
        const { roomId } = await createRoom({ name: roomName })
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

  const toggleTheme = () => {
    const newIsDark = !isDark
    setIsDark(newIsDark)
    if (newIsDark) {
      document.documentElement.classList.add("dark")
      localStorage.setItem("theme", "dark")
    } else {
      document.documentElement.classList.remove("dark")
      localStorage.setItem("theme", "light")
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Navigation Bar */}
      <nav className="w-full border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer">
            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-accent-foreground" />
            </div>
            <span className="text-lg font-bold text-foreground">InstantScrumPoker</span>
          </Link>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg border border-border hover:bg-secondary transition-colors"
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="w-5 h-5 text-foreground" /> : <Moon className="w-5 h-5 text-foreground" />}
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-2xl space-y-8 text-center">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground text-balance">
              Estimate Together, Instantly
            </h1>
            <p className="text-lg text-muted-foreground text-balance">
              Real-time scrum poker planning for distributed teams. Create a room, invite your team, and start estimating.
            </p>
          </div>

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
              <label className="block text-sm font-medium text-foreground text-left">Room Name</label>
              <Input
                placeholder="e.g., Sprint 25 Estimation"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleCreateRoom()}
                className="bg-secondary border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>

            <Button
              onClick={handleCreateRoom}
              disabled={!roomName.trim() || isLoading}
              className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold py-6 text-base rounded-lg transition-all"
            >
              {isLoading ? "Creating..." : "Create Estimation Room"}
            </Button>

            <p className="text-xs text-muted-foreground">Share the room code with your team. No sign-up required.</p>
          </Card>

          {/* Join Room Button */}
          <Button
            onClick={() => setShowJoinModal(true)}
            variant="outline"
            className="w-full border-border text-foreground hover:bg-secondary bg-transparent py-6 flex items-center justify-center gap-2"
          >
            <LogIn className="w-4 h-4" />
            Join Room with Code
          </Button>

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

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-4 pt-8 pb-12">
            <div className="p-6 rounded-lg bg-card border border-border space-y-2">
              <div className="text-2xl">⚡</div>
              <h3 className="font-semibold text-foreground text-sm">Instant Setup</h3>
              <p className="text-xs text-muted-foreground">No configuration needed</p>
            </div>
            <div className="p-6 rounded-lg bg-card border border-border space-y-2">
              <div className="text-2xl">👥</div>
              <h3 className="font-semibold text-foreground text-sm">Real-time Sync</h3>
              <p className="text-xs text-muted-foreground">See votes instantly</p>
            </div>
            <div className="p-6 rounded-lg bg-card border border-border space-y-2">
              <div className="text-2xl">🎯</div>
              <h3 className="font-semibold text-foreground text-sm">Built for Teams</h3>
              <p className="text-xs text-muted-foreground">Unlimited participants</p>
            </div>
          </div>
        </div>
      </div>

      {showJoinModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="bg-card border-border p-8 space-y-6 w-full max-w-md">
            <h2 className="text-2xl font-bold text-foreground">Join Estimation Room</h2>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">Room Code or Room ID</label>
              <Input
                placeholder="e.g., a1b2 or sprint-25-a1b2"
                value={joinCode}
                onChange={(e) => {
                  setJoinCode(e.target.value.toLowerCase().trim())
                  setJoinError("")
                }}
                onKeyPress={(e) => e.key === "Enter" && handleJoinRoom()}
                className="bg-secondary border-border text-foreground placeholder:text-muted-foreground font-mono text-lg text-center"
                autoFocus
              />
              <p className="text-xs text-muted-foreground">Enter the 4-character code or full room ID</p>
            </div>

            {joinError && <p className="text-sm text-destructive">{joinError}</p>}

            <div className="flex gap-3">
              <Button
                onClick={() => {
                  setShowJoinModal(false)
                  setJoinError("")
                  setJoinCode("")
                }}
                variant="outline"
                className="flex-1 border-border text-foreground hover:bg-secondary bg-transparent"
              >
                Cancel
              </Button>
              <Button
                onClick={handleJoinRoom}
                disabled={!joinCode.trim() || isLoading}
                className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground font-semibold"
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
