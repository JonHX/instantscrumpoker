"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { PokerCards } from "./poker-cards"
import { Timer } from "./timer"
import { ParticipantsList } from "./participants-list"
import { ConfettiCannon } from "./confetti-cannon"
import { ShareModal } from "./share-modal"
import { Zap, LogOut, MessageSquare, Moon, Sun, Share2 } from "lucide-react"
import { WS_ENDPOINT } from "@/lib/api-config"
import { getRoom, joinRoom, submitVote, revealVotes } from "@/lib/api"

const FIBONACCI = ["1", "2", "3", "5", "8", "13", "21", "34", "?"]

interface Participant {
  id: string
  name: string
  vote?: string
  voted: boolean
}

interface PokerRoomProps {
  roomId: string
  onExit: () => void
}

export function PokerRoom({ roomId, onExit }: PokerRoomProps) {
  const [participants, setParticipants] = useState<Participant[]>([])
  const [currentVote, setCurrentVote] = useState<string | null>(null)
  const [isVotingOpen, setIsVotingOpen] = useState(true)
  const [timerSeconds, setTimerSeconds] = useState(300)
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [discussionMode, setDiscussionMode] = useState(false)
  // Check localStorage synchronously on mount
  const getSavedName = () => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(`scrumpoker-name-${roomId}`)
      return saved && saved.trim() ? saved.trim() : ""
    }
    return ""
  }
  const [userName, setUserName] = useState(getSavedName)
  const [hasJoined, setHasJoined] = useState(false)
  const [isJoining, setIsJoining] = useState(false)
  const [isDark, setIsDark] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [roomName, setRoomName] = useState("")
  const [participantId, setParticipantId] = useState<string>("")
  const audioRef = useRef<HTMLAudioElement>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const autoJoinAttemptedRef = useRef(false)

  const fetchRoomData = useCallback(async () => {
    try {
      // Load room data silently in background (non-blocking)
      const data = await getRoom(roomId)
      setRoomName(data.name)

      // Map participants from room data to include vote status
      if (data.participants) {
        const mappedParticipants = data.participants.map((p: any) => ({
          id: p.id,
          name: p.name,
          voted: !!p.vote,
          vote: p.vote,
        }))
        setParticipants(mappedParticipants)
      }
    } catch (error) {
      console.error("Error fetching room data:", error)
    }
  }, [roomId])

  // Auto-join if name exists in localStorage for this room (only on mount)
  useEffect(() => {
    // Only attempt auto-join once on mount
    if (autoJoinAttemptedRef.current || hasJoined || isJoining) return
    
    // Check localStorage for saved name (not the userName state which changes as user types)
    const savedName = localStorage.getItem(`scrumpoker-name-${roomId}`)
    if (savedName && savedName.trim()) {
      autoJoinAttemptedRef.current = true
      setIsJoining(true)
      
      // Auto-join with saved name
      const autoJoin = async () => {
        try {
          const { participantId: newParticipantId } = await joinRoom(roomId, { name: savedName.trim() })
          setParticipantId(newParticipantId)

          const newParticipant: Participant = {
            id: newParticipantId,
            name: savedName.trim(),
            voted: false,
          }
          setParticipants([newParticipant])
          setHasJoined(true)
          
          // Fetch room data
          await fetchRoomData()
        } catch (error) {
          console.error("Error auto-joining room:", error)
          // If auto-join fails, clear the saved name and show join screen
          localStorage.removeItem(`scrumpoker-name-${roomId}`)
          setUserName("")
        } finally {
          setIsJoining(false)
        }
      }
      autoJoin()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId]) // Only run on mount or when roomId changes

  useEffect(() => {
    // Set up WebSocket connection (only after joining)
    if (WS_ENDPOINT && roomId && hasJoined) {
      const connectWebSocket = () => {
        try {
          const ws = new WebSocket(WS_ENDPOINT)
          wsRef.current = ws

          ws.onopen = () => {
            // Subscribe to room
            ws.send(JSON.stringify({ action: "subscribe", roomId }))
          }

          ws.onmessage = (event) => {
            try {
              const data = JSON.parse(event.data)
              if (data.type === "vote") {
                setParticipants((prev) =>
                  prev.map((p) =>
                    p.id === data.participantId
                      ? { ...p, vote: data.estimate, voted: true }
                      : p
                  )
                )
              } else if (data.type === "join") {
                // Refresh room data when someone joins
                fetchRoomData()
              } else if (data.type === "reveal") {
                // Reveal votes for all participants
                setIsVotingOpen(false)
              }
            } catch (error) {
              console.error("Error parsing WebSocket message:", error)
            }
          }

          ws.onerror = (error) => {
            console.error("WebSocket error:", error)
          }

          ws.onclose = () => {
            console.log("WebSocket closed")
            // Attempt to reconnect after 3 seconds
            setTimeout(() => {
              if (wsRef.current === null) {
                connectWebSocket()
              }
            }, 3000)
          }
        } catch (error) {
          console.error("Failed to create WebSocket connection:", error)
        }
      }

      connectWebSocket()

      return () => {
        if (wsRef.current) {
          wsRef.current.close()
          wsRef.current = null
        }
      }
    }
  }, [roomId, hasJoined, fetchRoomData])

  const getVoteStats = () => {
    const votes = participants.filter((p) => p.vote && p.vote !== "?").map((p) => p.vote!)
    const voteCounts = votes.reduce(
      (acc, vote) => {
        acc[vote] = (acc[vote] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const mostCommon = Object.entries(voteCounts).sort(([, a], [, b]) => b - a)[0]
    const allVoted = participants.filter((p) => p.voted).length === participants.length
    const onlyOneValue = Object.keys(voteCounts).length === 1
    const isCleanSweep = allVoted && onlyOneValue && votes.length === participants.length

    return { voteCounts, mostCommon, isCleanSweep, votes }
  }

  const getOutliers = () => {
    const { voteCounts, mostCommon } = getVoteStats()
    if (!mostCommon || Object.keys(voteCounts).length <= 1) return []

    const fibonacci = FIBONACCI.map((f) => Number.parseInt(f) || Number.POSITIVE_INFINITY)
    const mostCommonValue = Number.parseInt(mostCommon[0]) || Number.POSITIVE_INFINITY

    return participants
      .filter((p) => p.vote && p.vote !== "?" && p.vote !== mostCommon[0])
      .filter((p) => {
        const pValue = Number.parseInt(p.vote!) || Number.POSITIVE_INFINITY
        return Math.abs(fibonacci.indexOf(pValue) - fibonacci.indexOf(mostCommonValue)) > 1
      })
  }

  const handleJoin = async () => {
    // Prevent multiple simultaneous join attempts
    if (!userName.trim() || hasJoined || isJoining) return
    
    setIsJoining(true)
    try {
      // Save name to localStorage for this room
      localStorage.setItem(`scrumpoker-name-${roomId}`, userName.trim())
      
      const { participantId: newParticipantId } = await joinRoom(roomId, { name: userName.trim() })
      setParticipantId(newParticipantId)

      const newParticipant: Participant = {
        id: newParticipantId,
        name: userName.trim(),
        voted: false,
      }
      setParticipants([...participants, newParticipant])
      setHasJoined(true)

      // Fetch room data after joining
      await fetchRoomData()
    } catch (error) {
      console.error("Error joining room:", error)
      alert(error instanceof Error ? error.message : "Failed to join room")
    } finally {
      setIsJoining(false)
    }
  }

  const handleVote = async (value: string) => {
    setCurrentVote(value)
    setParticipants(participants.map((p) => (p.id === participantId ? { ...p, vote: value, voted: true } : p)))

    try {
      await submitVote(roomId, { participantId, estimate: value })
    } catch (error) {
      console.error("Error submitting vote:", error)
    }

    playSound()
  }

  const handleNextEstimate = () => {
    setCurrentVote(null)
    setIsVotingOpen(true)
    setParticipants(participants.map((p) => ({ ...p, vote: undefined, voted: false })))
    setTimerSeconds(300)
    setIsTimerRunning(false)
    setDiscussionMode(false)
    setShowConfetti(false)
    playSound()
  }

  const handleRevealVotes = async () => {
    try {
      // Call API to broadcast reveal to all participants
      await revealVotes(roomId)
      // Local state update will happen via WebSocket message
      setIsVotingOpen(false)
      const { isCleanSweep } = getVoteStats()
      if (isCleanSweep) {
        setShowConfetti(true)
      } else {
        setDiscussionMode(true)
        setIsTimerRunning(true)
        setTimerSeconds(180)
      }
      playSound()
    } catch (error) {
      console.error("Error revealing votes:", error)
    }
  }

  const handleStartDiscussion = () => {
    setDiscussionMode(true)
    setIsTimerRunning(true)
    setTimerSeconds(180)
    playSound()
  }

  const handleExtendTimer = () => {
    setTimerSeconds((prev) => prev + 60)
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

  const playSound = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0
      audioRef.current.play().catch(() => {})
    }
  }

  if (!hasJoined) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <Card className="w-full max-w-md bg-card border-border p-8 space-y-6">
          <div className="flex items-center gap-2">
            <Zap className="w-6 h-6 text-accent" />
            <h1 className="text-2xl font-bold text-foreground">Join Room</h1>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">Your Name</label>
            <Input
              placeholder="Enter your name"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleJoin()}
              className="bg-secondary border-border text-foreground placeholder:text-muted-foreground"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Room ID</p>
            <p className="font-mono text-accent text-sm break-all font-bold text-lg">
              {roomId}
            </p>
          </div>

          <Button
            onClick={handleJoin}
            disabled={!userName.trim() || hasJoined || isJoining}
            className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold py-6"
          >
            {isJoining ? "Joining..." : "Join Estimation"}
          </Button>
        </Card>
        <audio
          ref={audioRef}
          src="data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEAQB8AAAB9AAACABAAZGF0YQIAAAAAAA=="
        />
      </div>
    )
  }

  const { voteCounts, mostCommon, isCleanSweep } = getVoteStats()
  const outliers = getOutliers()
  const votedCount = participants.filter((p) => p.voted).length

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      {showConfetti && <ConfettiCannon />}
      {showShareModal && <ShareModal roomId={roomId} roomName={roomName} onClose={() => setShowShareModal(false)} />}
      <audio
        ref={audioRef}
        src="data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEAQB8AAAB9AAACABAAZGF0YQIAAAAAAA=="
      />

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5 text-accent-foreground" />
          </div>
          <h1 className="text-lg font-bold text-foreground">InstantScrumPoker</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowShareModal(true)}
            className="p-2 rounded-lg border border-border hover:bg-secondary transition-colors"
            aria-label="Share room"
          >
            <Share2 className="w-4 h-4 text-foreground" />
          </button>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg border border-border hover:bg-secondary transition-colors"
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="w-4 h-4 text-foreground" /> : <Moon className="w-4 h-4 text-foreground" />}
          </button>
          <Button
            onClick={onExit}
            variant="outline"
            className="flex items-center gap-2 border-border text-muted-foreground hover:text-foreground bg-transparent"
          >
            <LogOut className="w-4 h-4" />
            Exit
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Timer & Discussion */}
          {discussionMode && (
            <Card className="bg-card border-border p-6">
              <div className="text-center space-y-4">
                <h2 className="text-lg font-semibold text-foreground">Discussion Round</h2>
                <Timer
                  seconds={timerSeconds}
                  isRunning={isTimerRunning}
                  onEnd={playSound}
                  onExtend={handleExtendTimer}
                />
              </div>
            </Card>
          )}

          {/* Clean Sweep Message */}
          {isCleanSweep && !isVotingOpen && (
            <Card className="bg-gradient-to-r from-accent/20 to-accent/10 border-2 border-accent p-6 text-center">
              <p className="text-2xl font-bold text-accent">🎉 Clean Sweep! All Agreed 🎉</p>
              <p className="text-sm text-muted-foreground mt-2">Everyone selected {mostCommon?.[0]}</p>
            </Card>
          )}

          {/* Voting Phase */}
          <Card className="bg-card border-border p-8 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-foreground">Estimate Points</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {isVotingOpen ? (currentVote ? "Vote submitted" : "Select your estimate") : "Votes revealed"}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Votes In</p>
                <p className="text-2xl font-bold text-accent">
                  {votedCount}/{participants.length}
                </p>
              </div>
            </div>

            {isVotingOpen ? (
              <PokerCards
                cards={FIBONACCI}
                selectedCard={currentVote}
                onSelectCard={handleVote}
                isDisabled={!!currentVote}
              />
            ) : (
              <div className="space-y-3">
                {participants.map((p) => {
                  const isOutlier = outliers.some((o) => o.id === p.id)
                  const isTopVote = p.vote === mostCommon?.[0]

                  return (
                    <div
                      key={p.id}
                      className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
                        isOutlier
                          ? "bg-destructive/10 border-destructive/50"
                          : isTopVote
                            ? "bg-accent/10 border-accent ring-2 ring-accent/30"
                            : "bg-secondary border-border"
                      }`}
                    >
                      <span className="font-medium text-foreground">{p.name}</span>
                      <div className="flex items-center gap-2">
                        <span className={`font-bold text-lg ${isOutlier ? "text-destructive" : "text-accent"}`}>
                          {p.vote || "—"}
                        </span>
                        {isTopVote && mostCommon?.[1]! > 1 && (
                          <span className="text-xs font-bold px-2 py-1 rounded-full bg-accent/20 text-accent">
                            Most chosen
                          </span>
                        )}
                        {isOutlier && <span className="text-xs font-bold text-destructive">Outlier</span>}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            {isVotingOpen && currentVote && (
              <Button
                onClick={handleRevealVotes}
                className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground font-semibold py-6"
              >
                Reveal Votes
              </Button>
            )}

            {!isVotingOpen && !isCleanSweep && (
              <>
                <Button
                  onClick={handleStartDiscussion}
                  disabled={discussionMode}
                  variant="outline"
                  className="flex-1 flex items-center justify-center gap-2 border-border text-foreground hover:bg-secondary bg-transparent"
                >
                  <MessageSquare className="w-4 h-4" />
                  Discuss
                </Button>
                <Button
                  onClick={handleNextEstimate}
                  className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground font-semibold py-6"
                >
                  Next Estimate
                </Button>
              </>
            )}

            {isCleanSweep && (
              <Button
                onClick={handleNextEstimate}
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold py-6"
              >
                Next Estimate
              </Button>
            )}
          </div>
        </div>

        {/* Sidebar - Participants */}
        <div>
          <ParticipantsList participants={participants} />
        </div>
      </div>
    </div>
  )
}
