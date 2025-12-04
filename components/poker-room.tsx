"use client"

import React, { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { PokerCards } from "./poker-cards"
import { Timer } from "./timer"
import { ParticipantsList } from "./participants-list"
import { ConfettiCannon } from "./confetti-cannon"
import { ShareModal } from "./share-modal"
import { Zap, LogOut, MessageSquare, Share2 } from "lucide-react"
import { Nav } from "@/components/nav"
import { Footer } from "@/components/footer"
import { WS_ENDPOINT } from "@/lib/api-config"
import { getRoom, joinRoom, submitVote, revealVotes, nextEstimate } from "@/lib/api"

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
  
  // Check localStorage synchronously on mount - use lazy initialization
  const getSavedName = () => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(`scrumpoker-name-${roomId}`)
      return saved && saved.trim() ? saved.trim() : ""
    }
    return ""
  }
  const [userName, setUserName] = useState(() => getSavedName())
  const [hasJoined, setHasJoined] = useState(false)
  // Start in joining state if we have a saved name to prevent flash
  const [isJoining, setIsJoining] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(`scrumpoker-name-${roomId}`)
      return !!(saved && saved.trim())
    }
    return false
  })
  const [showConfetti, setShowConfetti] = useState(false)
  const [roomName, setRoomName] = useState("")
  const [participantId, setParticipantId] = useState<string>("")
  const [previousEstimates, setPreviousEstimates] = useState<Array<{
    story_id: string
    story_title: string
    votes: Record<string, { estimate: string; votedAt: string }>
    outcome?: string
    completedAt?: string
  }>>([])
  const [selectedOutcome, setSelectedOutcome] = useState<string>("")
  const audioRef = useRef<HTMLAudioElement>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const autoJoinAttemptedRef = useRef(false)

  const fetchRoomData = useCallback(async (showVotes = false) => {
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
          // Include vote value if explicitly showing votes or if voting is already closed
          vote: (showVotes || !isVotingOpen) ? p.vote : undefined,
        }))
        setParticipants(mappedParticipants)
      }

      // Load previous estimates if available
      if ((data as any).previousEstimates) {
        setPreviousEstimates((data as any).previousEstimates)
      }
    } catch (error) {
      console.error("Error fetching room data:", error)
    }
  }, [roomId, isVotingOpen])

  // Auto-join if name exists in localStorage for this room (only on mount)
  useEffect(() => {
    // Only attempt auto-join once on mount
    if (autoJoinAttemptedRef.current || hasJoined) return
    
    // Check localStorage for saved name for this specific room
    const savedName = localStorage.getItem(`scrumpoker-name-${roomId}`)
    if (savedName && savedName.trim()) {
      autoJoinAttemptedRef.current = true
      setIsJoining(true)
      
      // Auto-join with saved name - check if already a participant first
      const autoJoin = async () => {
        try {
          const trimmedName = savedName.trim()
          // Ensure name is saved to localStorage (in case it wasn't before)
          localStorage.setItem(`scrumpoker-name-${roomId}`, trimmedName)
          
          // First, fetch room data to check if user is already a participant
          const roomData = await getRoom(roomId)
          setRoomName(roomData.name)
          
          // Check if a participant with this name already exists
          const existingParticipant = roomData.participants?.find(
            (p: any) => p.name?.trim().toLowerCase() === trimmedName.toLowerCase()
          )
          
          if (existingParticipant) {
            // User already exists - restore their state
            setParticipantId(existingParticipant.id)
            setHasJoined(true)
            setUserName(trimmedName)
            
            // Map participants from room data
            if (roomData.participants) {
              const mappedParticipants = roomData.participants.map((p: any) => ({
                id: p.id,
                name: p.name,
                voted: !!p.vote,
                vote: p.vote,
              }))
              setParticipants(mappedParticipants)
            }
            
            // Load previous estimates if available
            if ((roomData as any).previousEstimates) {
              setPreviousEstimates((roomData as any).previousEstimates)
            }
          } else {
            // User doesn't exist - join as new participant
            const { participantId: newParticipantId } = await joinRoom(roomId, { name: trimmedName })
            setParticipantId(newParticipantId)

            const newParticipant: Participant = {
              id: newParticipantId,
              name: trimmedName,
              voted: false,
            }
            setParticipants([newParticipant])
            setHasJoined(true)
            setUserName(trimmedName)
            
            // Fetch room data after joining
            await fetchRoomData()
          }
        } catch (error) {
          console.error("Error auto-joining room:", error)
          // If auto-join fails, clear the saved name and show join screen
          localStorage.removeItem(`scrumpoker-name-${roomId}`)
          setUserName("")
          autoJoinAttemptedRef.current = false // Reset so user can try again
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
                // Only update voted status, NOT the actual vote (votes remain hidden)
                setParticipants((prev) =>
                  prev.map((p) =>
                    p.id === data.participantId
                      ? { ...p, voted: true }
                      : p
                  )
                )
              } else if (data.type === "join") {
                // Refresh room data when someone joins
                fetchRoomData()
              } else if (data.type === "reveal") {
                // Reveal votes for all participants - fetch room data and calculate stats
                try {
                  const roomData = await getRoom(roomId)
                  
                  if (roomData.participants) {
                    const mappedParticipants = roomData.participants.map((p: any) => ({
                      id: p.id,
                      name: p.name,
                      voted: !!p.vote,
                      vote: p.vote,
                    }))
                    
                    // Calculate stats from the fetched data (same logic as handleRevealVotes)
                    const votes = mappedParticipants.filter((p: any) => p.vote && p.vote !== "?").map((p: any) => p.vote!)
                    const voteCounts = votes.reduce(
                      (acc: Record<string, number>, vote: string) => {
                        acc[vote] = (acc[vote] || 0) + 1
                        return acc
                      },
                      {} as Record<string, number>,
                    )
                    const allVoted = mappedParticipants.filter((p: any) => p.voted).length === mappedParticipants.length
                    const onlyOneValue = Object.keys(voteCounts).length === 1
                    const isCleanSweep = allVoted && onlyOneValue && votes.length === mappedParticipants.length
                    
                    // Batch all state updates together
                    setParticipants(mappedParticipants)
                    setIsVotingOpen(false)
                    
                    if (isCleanSweep) {
                      setShowConfetti(true)
                      setDiscussionMode(false)
                    } else {
                      setDiscussionMode(true)
                      setTimerSeconds(180)
                      setIsTimerRunning(false)
                    }
                  }
                  
                  playSound()
                } catch (error) {
                  console.error("Error handling reveal event:", error)
                  // Fallback to simple fetch
                  setIsVotingOpen(false)
                  fetchRoomData(true)
                }
              } else if (data.type === "nextEstimate") {
                // Move to next estimate - reset voting state
                setCurrentVote(null)
                setIsVotingOpen(true)
                setParticipants(participants.map((p) => ({ ...p, vote: undefined, voted: false })))
                setTimerSeconds(300)
                setIsTimerRunning(false)
                setDiscussionMode(false)
                setShowConfetti(false)
                setSelectedOutcome("")
                // If outcome was provided, add to previous estimates
                if (data.outcome) {
                  fetchRoomData() // Refresh to get updated previous estimates
                }
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

    const sortedVotes = Object.entries(voteCounts).sort(([, a], [, b]) => b - a)
    const mostCommon = sortedVotes[0]
    const allVoted = participants.filter((p) => p.voted).length === participants.length
    const onlyOneValue = Object.keys(voteCounts).length === 1
    const isCleanSweep = allVoted && onlyOneValue && votes.length === participants.length
    
    // Check for draw: two or more values with the same highest count
    const isDraw = sortedVotes.length >= 2 && sortedVotes[0][1] === sortedVotes[1][1]
    const drawValues = isDraw ? sortedVotes.filter(([, count]) => count === sortedVotes[0][1]).map(([value]) => value) : []

    return { voteCounts, mostCommon, isCleanSweep, votes, isDraw, drawValues }
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
    // Allow unselecting by clicking the same card
    const newVote = currentVote === value ? null : value
    setCurrentVote(newVote)
    
    // Update local state for current user
    setParticipants(participants.map((p) => 
      p.id === participantId 
        ? { ...p, vote: newVote || undefined, voted: !!newVote } 
        : p
    ))

    try {
      if (newVote) {
        await submitVote(roomId, { participantId, estimate: newVote })
      }
      // Vote is submitted but not visible to others until revealed
    } catch (error) {
      console.error("Error submitting vote:", error)
    }

    playSound()
  }

  const handleNextEstimate = async () => {
    if (!selectedOutcome) {
      alert("Please select an outcome for the current estimate before proceeding")
      return
    }

    try {
      // Call API to broadcast next estimate to all participants
      await nextEstimate(roomId, { outcome: selectedOutcome })
      // Local state update will happen via WebSocket message
      playSound()
    } catch (error) {
      console.error("Error moving to next estimate:", error)
      alert(error instanceof Error ? error.message : "Failed to move to next estimate")
    }
  }

  const handleRevealVotes = async () => {
    try {
      // Call API to broadcast reveal to all participants
      await revealVotes(roomId)
      
      // Fetch room data first to get all revealed votes
      const data = await getRoom(roomId)
      
      // Now update all states in a single batch to prevent flickering
      if (data.participants) {
        const mappedParticipants = data.participants.map((p: any) => ({
          id: p.id,
          name: p.name,
          voted: !!p.vote,
          vote: p.vote,
        }))
        
        // Calculate stats from the fetched data
        const votes = mappedParticipants.filter((p: any) => p.vote && p.vote !== "?").map((p: any) => p.vote!)
        const voteCounts = votes.reduce(
          (acc: Record<string, number>, vote: string) => {
            acc[vote] = (acc[vote] || 0) + 1
            return acc
          },
          {} as Record<string, number>,
        )
        const allVoted = mappedParticipants.filter((p: any) => p.voted).length === mappedParticipants.length
        const onlyOneValue = Object.keys(voteCounts).length === 1
        const isCleanSweep = allVoted && onlyOneValue && votes.length === mappedParticipants.length
        
        // Batch all state updates together
        setParticipants(mappedParticipants)
        setIsVotingOpen(false)
        
        if (isCleanSweep) {
          setShowConfetti(true)
          setDiscussionMode(false)
        } else {
          setDiscussionMode(true)
          setTimerSeconds(180)
          setIsTimerRunning(false)
        }
      }
      
      playSound()
    } catch (error) {
      console.error("Error revealing votes:", error)
    }
  }

  const handleStartTimer = () => {
    setIsTimerRunning(true)
    playSound()
  }

  const handleExtendTimer = () => {
    setTimerSeconds((prev) => prev + 60)
  }

  const handleSetTimer = (seconds: number) => {
    setTimerSeconds(seconds)
    setIsTimerRunning(false)
  }

  const playSound = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0
      audioRef.current.play().catch(() => {})
    }
  }

  if (!hasJoined) {
    // Show loading state during auto-join attempt
    if (isJoining) {
      return (
        <div className="min-h-screen bg-background flex flex-col">
          <Nav />
          <main className="flex-1 flex items-center justify-center px-4" role="main">
            <div className="text-center">
              <p className="text-muted-foreground">Joining room...</p>
            </div>
          </main>
        </div>
      )
    }

    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Nav />
        <main className="flex-1 flex items-center justify-center px-4" role="main">
          <Card className="w-full max-w-md bg-card border-border p-8 space-y-6">
            <div className="flex items-center gap-2">
              <Zap className="w-6 h-6 text-accent" aria-hidden="true" />
              <h1 className="text-2xl font-bold text-foreground">Join Room</h1>
            </div>

            <div className="space-y-2">
              <label htmlFor="join-name-input" className="block text-sm font-medium text-foreground">Your Name</label>
              <Input
                id="join-name-input"
                placeholder="Enter your name"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleJoin()}
                className="bg-secondary border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
                autoFocus
                aria-required="true"
                aria-describedby="join-name-description"
              />
              <p id="join-name-description" className="sr-only">Enter your name to join the estimation room</p>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Room ID</p>
              <p className="font-mono text-accent text-sm break-all font-bold text-lg" aria-label={`Room ID: ${roomId}`}>
                {roomId}
              </p>
            </div>

            <Button
              onClick={handleJoin}
              disabled={!userName.trim() || hasJoined || isJoining}
              className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold py-6 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label={isJoining ? "Joining room" : "Join estimation room"}
            >
              {isJoining ? "Joining..." : "Join Estimation"}
            </Button>
          </Card>
          <audio
            ref={audioRef}
            src="data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEAQB8AAAB9AAACABAAZGF0YQIAAAAAAA=="
            aria-hidden="true"
          />
        </main>
      </div>
    )
  }

  const { voteCounts, mostCommon, isCleanSweep, isDraw, drawValues } = getVoteStats()
  const outliers = getOutliers()
  const votedCount = participants.filter((p) => p.voted).length

  return (
    <>
      {showConfetti && <ConfettiCannon />}
      <audio
        ref={audioRef}
        src="data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEAQB8AAAB9AAACABAAZGF0YQIAAAAAAA=="
        aria-hidden="true"
      />

      {/* Skip to main content link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-accent focus:text-accent-foreground focus:rounded-lg focus:font-semibold"
      >
        Skip to main content
      </a>

      <Nav />

      <main id="main-content" className="min-h-screen bg-background px-4 md:px-8 py-8" role="main">
        <div className="grid lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-3">
          {/* Clean Sweep Message */}
          {isCleanSweep && !isVotingOpen && !isDraw && (
            <Card className="bg-gradient-to-r from-accent/20 to-accent/10 border-2 border-accent p-2 text-center">
              <p className="text-base font-bold text-accent">🎉 Clean Sweep! All Agreed 🎉</p>
              <p className="text-xs text-muted-foreground">Everyone selected {mostCommon?.[0]}</p>
            </Card>
          )}

          {/* Draw Message - Shows above timer */}
          {isDraw && !isVotingOpen && (
            <Card className="bg-gradient-to-r from-orange-500/20 to-yellow-500/20 border-2 border-orange-500 p-2 text-center">
              <p className="text-base font-bold text-orange-600 dark:text-orange-400">⚔️ DRAW! ⚔️</p>
              <div className="flex items-center justify-center gap-2">
                {drawValues.map((value, index) => (
                  <React.Fragment key={value}>
                    <span 
                      className="text-3xl font-extrabold text-foreground"
                      style={{ 
                        textShadow: '0 2px 8px rgba(0,0,0,0.15), 0 4px 16px rgba(249,115,22,0.2)',
                        filter: 'drop-shadow(0 0 2px rgba(249,115,22,0.3))'
                      }}
                    >
                      {value}
                    </span>
                    {index < drawValues.length - 1 && (
                      <span className="text-xs font-medium text-muted-foreground lowercase mx-1">vs</span>
                    )}
                  </React.Fragment>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">Teams are tied - time to discuss!</p>
            </Card>
          )}

          {/* Timer & Discussion */}
          {discussionMode && (
            <section aria-labelledby="discussion-heading">
              <Card className="bg-card border-border p-3">
                <div className="text-center space-y-2">
                  <h2 id="discussion-heading" className="text-sm font-semibold text-foreground">Discussion Round</h2>
                  <Timer
                    seconds={timerSeconds}
                    isRunning={isTimerRunning}
                    onEnd={playSound}
                    onExtend={handleExtendTimer}
                    onStart={handleStartTimer}
                    onSetTime={handleSetTimer}
                  />
                </div>
              </Card>
            </section>
          )}

          {/* Voting Phase */}
          <section aria-labelledby="voting-heading">
            <Card className="bg-card border-border p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 id="voting-heading" className="text-lg font-bold text-foreground">Estimate Points</h2>
                  <p className="text-xs text-muted-foreground mt-0.5" role="status" aria-live="polite">
                    {isVotingOpen ? (currentVote ? "Vote submitted - click again to change or unselect" : "Select your estimate") : "Votes revealed"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Votes In</p>
                  <p className="text-xl font-bold text-accent" aria-live="polite" aria-atomic="true">
                    {votedCount}/{participants.length}
                  </p>
                </div>
              </div>

              {isVotingOpen ? (
                <div role="group" aria-label="Select your estimate">
                  <PokerCards
                    cards={FIBONACCI}
                    selectedCard={currentVote}
                    onSelectCard={handleVote}
                    isDisabled={false}
                  />
                </div>
              ) : (
                <div className="space-y-3" role="list" aria-label="Vote results">
                  {(() => {
                    // Group participants by vote value
                    const votesByValue = participants.reduce((acc, p) => {
                      if (p.vote && p.vote !== "?") {
                        if (!acc[p.vote]) acc[p.vote] = []
                        acc[p.vote].push(p)
                      }
                      return acc
                    }, {} as Record<string, typeof participants>)
                    
                    // Sort by count (highest first)
                    const sortedVoteGroups = Object.entries(votesByValue)
                      .map(([value, groupParticipants]) => ({
                        value,
                        count: groupParticipants.length,
                        participants: groupParticipants,
                      }))
                      .sort((a, b) => b.count - a.count)
                    
                    // Determine if there's a tie for most votes
                    const maxCount = sortedVoteGroups[0]?.count || 0
                    const tiedGroups = sortedVoteGroups.filter(g => g.count === maxCount)
                    const hasTie = tiedGroups.length > 1
                    const isTopGroup = (count: number) => count === maxCount
                    
                    return sortedVoteGroups.map((group) => {
                      const percentage = (group.count / participants.length) * 100
                      const isTop = isTopGroup(group.count)
                      const shouldShowMostChosen = isTop && group.count > 1 && !hasTie
                      
                      // Check if any participant in this group is an outlier
                      const hasOutliers = group.participants.some(p => outliers.some(o => o.id === p.id))
                      
                      return (
                        <div
                          key={group.value}
                          role="listitem"
                          className={`rounded-lg border-2 overflow-hidden transition-all ${
                            hasOutliers
                              ? "border-destructive/50"
                              : isTop
                                ? "border-accent ring-2 ring-accent/30"
                                : "border-border"
                          }`}
                        >
                          {/* Bar visualization */}
                          <div className="relative">
                            <div
                              className={`h-2 transition-all ${
                                hasOutliers
                                  ? "bg-destructive/30"
                                  : isTop
                                    ? "bg-accent/40"
                                    : "bg-secondary"
                              }`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          
                          {/* Content */}
                          <div className={`p-3 ${
                            hasOutliers
                              ? "bg-destructive/10"
                              : isTop
                                ? "bg-accent/10"
                                : "bg-secondary"
                          }`}>
                            {/* Vote value and count */}
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-3">
                                <span className={`font-bold text-2xl ${hasOutliers ? "text-destructive" : "text-accent"}`}>
                                  {group.value}
                                </span>
                                <span className="text-sm text-muted-foreground">
                                  {group.count} {group.count === 1 ? "vote" : "votes"}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                {shouldShowMostChosen && (
                                  <span className="text-xs font-bold px-2 py-1 rounded-full bg-accent/20 text-accent" aria-label="Most chosen vote">
                                    Most chosen
                                  </span>
                                )}
                                {hasOutliers && (
                                  <span className="text-xs font-bold px-2 py-1 rounded-full bg-destructive/20 text-destructive" aria-label="Contains outlier votes">
                                    Outlier
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            {/* Participant names */}
                            <div className="flex flex-wrap gap-2">
                              {group.participants.map((p) => {
                                const isOutlier = outliers.some((o) => o.id === p.id)
                                return (
                                  <span
                                    key={p.id}
                                    className={`text-xs px-2 py-1 rounded ${
                                      isOutlier
                                        ? "bg-destructive/20 text-destructive font-semibold"
                                        : "bg-background/50 text-foreground"
                                    }`}
                                  >
                                    {p.name}
                                  </span>
                                )
                              })}
                            </div>
                          </div>
                        </div>
                      )
                    })
                  })()}
                </div>
              )}
            </Card>
          </section>

          {/* Action Buttons */}
          <section aria-label="Room actions">
            <div className="flex flex-wrap gap-2">
              {isVotingOpen && currentVote && (
                <Button
                  onClick={handleRevealVotes}
                  className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground font-semibold py-4 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
                  aria-label="Reveal all votes"
                >
                  Reveal Votes
                </Button>
              )}

              {!isVotingOpen && !isCleanSweep && (
                <>
                  {!discussionMode && (
                    <Button
                      onClick={() => setDiscussionMode(true)}
                      variant="outline"
                      className="flex-1 flex items-center justify-center gap-2 border-border text-foreground hover:bg-secondary bg-transparent focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
                      aria-label="Start discussion round"
                    >
                      <MessageSquare className="w-4 h-4" aria-hidden="true" />
                      Start Discussion
                    </Button>
                  )}
                </>
              )}
            </div>
          </section>

          {/* Select Final Outcome - Moved above Previous Estimates */}
          {!isVotingOpen && (
            <section aria-label="Select final outcome">
              <Card className="bg-card border-border p-3 space-y-2 w-full">
                <h3 className="text-sm font-bold text-foreground">Select Final Outcome</h3>
                <p className="text-xs text-muted-foreground">Choose the final estimate value before proceeding</p>
                <div className="flex flex-wrap justify-center gap-1.5" role="group" aria-label="Select final outcome">
                  {FIBONACCI.map((value) => (
                    <button
                      key={value}
                      onClick={() => setSelectedOutcome(value)}
                      className={`px-3 py-2 rounded-lg border-2 font-bold text-base transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 ${
                        selectedOutcome === value
                          ? "bg-accent border-accent text-accent-foreground ring-2 ring-accent/30 scale-110 animate-in zoom-in-95 duration-200"
                          : "bg-secondary border-border text-foreground hover:border-accent/50 hover:scale-105"
                      }`}
                      aria-pressed={selectedOutcome === value}
                      aria-label={`Select ${value} as final outcome`}
                      type="button"
                    >
                      {value}
                    </button>
                  ))}
                </div>
                <Button
                  onClick={handleNextEstimate}
                  disabled={!selectedOutcome}
                  className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold py-4 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
                  aria-label={selectedOutcome ? "Proceed to next estimate" : "Select an outcome first"}
                >
                  Next Estimate
                </Button>
              </Card>
            </section>
          )}

          {/* Previous Estimates */}
          {previousEstimates.length > 0 && (
            <section aria-labelledby="previous-estimates-heading">
              <Card className="bg-card border-border p-3 space-y-2">
                <h3 id="previous-estimates-heading" className="text-sm font-bold text-foreground">Previous Estimates</h3>
                <div className="space-y-1.5" role="list" aria-label="Previous estimates">
                  {previousEstimates.map((estimate, index) => (
                    <div
                      key={estimate.story_id}
                      role="listitem"
                      className="flex items-center justify-between p-2 rounded-lg bg-secondary border border-border"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-accent" aria-label={`Estimate number ${previousEstimates.length - index}`}>#{previousEstimates.length - index}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {Object.entries(estimate.votes || {}).map(([pid, vote]: [string, any]) => (
                          <span key={pid} className="text-xs font-medium text-muted-foreground" aria-label={`Vote: ${vote.estimate}`}>
                            {vote.estimate}
                          </span>
                        ))}
                        {estimate.outcome && (
                          <span className="text-sm font-bold text-accent ml-1" aria-label={`Final outcome: ${estimate.outcome}`}>→ {estimate.outcome}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </section>
          )}
        </div>

        {/* Sidebar - Participants */}
        <aside aria-label="Participants list">
          <ParticipantsList 
            participants={participants} 
            isVotingOpen={isVotingOpen}
            roomId={roomId}
            roomName={roomName}
            onExit={onExit}
          />
        </aside>
      </div>
      <Footer />
      </main>
    </>
  )
}
