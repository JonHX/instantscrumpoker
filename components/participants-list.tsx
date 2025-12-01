"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, CheckCircle2, Clock, Copy, LogOut } from "lucide-react"

interface Participant {
  id: string
  name: string
  vote?: string
  voted: boolean
}

interface ParticipantsListProps {
  participants: Participant[]
  isVotingOpen?: boolean
  roomId: string
  roomName?: string
  onExit?: () => void
}

export function ParticipantsList({ participants, isVotingOpen = true, roomId, roomName, onExit }: ParticipantsListProps) {
  const [copied, setCopied] = useState(false)
  
  const shareUrl = typeof window !== "undefined" ? `${window.location.origin}/rooms/${roomId}` : ""
  // Use full roomId in uppercase
  const roomCode = roomId.toUpperCase()

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  const votedCount = participants.filter((p) => p.voted).length

  return (
    <Card className="bg-card border-border p-6 sticky top-6">
      <div className="flex items-center gap-2 mb-4">
        <Users className="w-5 h-5 text-accent" />
        <h3 className="font-bold text-foreground">Team</h3>
        <span className="ml-auto text-sm font-semibold text-accent">
          {votedCount}/{participants.length}
        </span>
      </div>

      <div className="space-y-2">
        {participants.map((participant) => (
          <div
            key={participant.id}
            className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
              participant.voted ? "bg-accent/10 border-accent/50" : "bg-secondary border-border hover:border-accent/50"
            }`}
          >
            <span className="text-sm font-medium text-foreground truncate">{participant.name}</span>
            <div className="flex items-center gap-2">
              {participant.voted ? (
                <>
                  {/* Only show vote value if voting is closed (votes revealed) */}
                  {!isVotingOpen && participant.vote && <span className="text-xs font-bold text-accent">{participant.vote}</span>}
                  <CheckCircle2 className="w-4 h-4 text-accent flex-shrink-0" />
                  <span className="text-xs font-semibold text-accent">Voted</span>
                </>
              ) : (
                <>
                  <Clock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-xs font-semibold text-muted-foreground">Waiting</span>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {participants.length === 0 && (
        <p className="text-xs text-muted-foreground text-center py-4">Waiting for team members...</p>
      )}

      {/* Share Room Section */}
      <div className="mt-6 pt-6 border-t border-border space-y-4">
        <h4 className="font-bold text-foreground text-sm">Share Room</h4>
        
        {/* Room Code */}
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2">ROOM CODE</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 bg-secondary border border-border rounded-lg p-3 text-accent font-mono font-bold text-center text-lg select-all">
              {roomCode}
            </code>
            <Button
              onClick={() => handleCopy(roomCode)}
              size="sm"
              variant="outline"
              className="border-border bg-transparent hover:bg-secondary flex-shrink-0"
              aria-label="Copy room code"
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Share Link */}
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2">SHARE LINK</p>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={shareUrl}
              readOnly
              className="flex-1 bg-secondary border border-border rounded-lg p-3 text-foreground text-sm truncate select-all cursor-pointer"
              onClick={(e) => e.currentTarget.select()}
            />
            <Button
              onClick={() => handleCopy(shareUrl)}
              size="sm"
              variant="outline"
              className="border-border bg-transparent hover:bg-secondary flex-shrink-0"
              aria-label="Copy share link"
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Copy Feedback */}
        {copied && (
          <p className="text-xs text-accent text-center font-medium animate-in fade-in">
            Copied to clipboard!
          </p>
        )}
      </div>

      {/* Exit Button */}
      {onExit && (
        <div className="mt-4">
          <Button
            onClick={onExit}
            variant="outline"
            className="w-full flex items-center justify-center gap-3 border-border text-muted-foreground hover:text-foreground hover:bg-secondary bg-transparent focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 py-6"
            aria-label="Exit room"
          >
            <LogOut className="w-5 h-5" aria-hidden="true" />
            <span className="font-semibold">Exit Room</span>
          </Button>
        </div>
      )}
    </Card>
  )
}
