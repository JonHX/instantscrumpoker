"use client"

import { Card } from "@/components/ui/card"
import { Users, CheckCircle2, Clock } from "lucide-react"

interface Participant {
  id: string
  name: string
  vote?: string
  voted: boolean
}

interface ParticipantsListProps {
  participants: Participant[]
  isVotingOpen?: boolean
}

export function ParticipantsList({ participants, isVotingOpen = true }: ParticipantsListProps) {
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
    </Card>
  )
}
