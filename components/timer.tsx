"use client"

import { useEffect, useState } from "react"
import { Clock, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

interface TimerProps {
  seconds: number
  isRunning: boolean
  onEnd: () => void
  onExtend?: () => void
  onStart?: () => void
}

export function Timer({ seconds, isRunning, onEnd, onExtend, onStart }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(seconds)

  useEffect(() => {
    setTimeLeft(seconds)
  }, [seconds])

  useEffect(() => {
    if (!isRunning) return

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          onEnd()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isRunning, onEnd])

  const minutes = Math.floor(timeLeft / 60)
  const secs = timeLeft % 60

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="flex items-center justify-center gap-3">
        <Clock className="w-6 h-6 text-accent" />
        <div className="text-5xl font-bold text-accent font-mono">
          {String(minutes).padStart(2, "0")}:{String(secs).padStart(2, "0")}
        </div>
      </div>
      <div className="flex gap-2">
        {!isRunning && onStart && (
          <Button
            onClick={onStart}
            size="sm"
            className="bg-accent hover:bg-accent/90 text-accent-foreground"
          >
            Start Timer
          </Button>
        )}
        {isRunning && onExtend && (
          <Button
            onClick={onExtend}
            size="sm"
            variant="outline"
            className="flex items-center gap-2 border-border text-muted-foreground hover:text-foreground bg-transparent"
          >
            <Plus className="w-4 h-4" />
            Extend +1m
          </Button>
        )}
      </div>
    </div>
  )
}
