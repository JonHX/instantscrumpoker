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
  onSetTime?: (seconds: number) => void
}

export function Timer({ seconds, isRunning, onEnd, onExtend, onStart, onSetTime }: TimerProps) {
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
    <div className="flex flex-col items-center justify-center gap-2">
      <div className="flex items-center justify-center gap-2">
        <Clock className="w-5 h-5 text-accent" />
        <div className="text-3xl font-bold text-accent font-mono">
          {String(minutes).padStart(2, "0")}:{String(secs).padStart(2, "0")}
        </div>
      </div>
      
      {/* Timer Presets - Only show when not running */}
      {!isRunning && onSetTime && (
        <div className="flex flex-wrap gap-2 justify-center">
          <Button
            onClick={() => onSetTime(60)}
            size="sm"
            variant="outline"
            className="border-border text-foreground hover:bg-secondary bg-transparent"
          >
            1m
          </Button>
          <Button
            onClick={() => onSetTime(120)}
            size="sm"
            variant="outline"
            className="border-border text-foreground hover:bg-secondary bg-transparent"
          >
            2m
          </Button>
          <Button
            onClick={() => onSetTime(300)}
            size="sm"
            variant="outline"
            className="border-border text-foreground hover:bg-secondary bg-transparent"
          >
            5m
          </Button>
          <Button
            onClick={() => onSetTime(600)}
            size="sm"
            variant="outline"
            className="border-border text-foreground hover:bg-secondary bg-transparent"
          >
            10m
          </Button>
        </div>
      )}
      
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
            +60s
          </Button>
        )}
      </div>
    </div>
  )
}
