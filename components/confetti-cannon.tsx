"use client"

import { useEffect } from "react"

export function ConfettiCannon() {
  useEffect(() => {
    // Dynamic import to avoid SSR issues
    import("canvas-confetti").then((confetti) => {
      const defaults = {
        spread: 360,
        ticks: 50,
        gravity: 0,
        decay: 0.94,
        startVelocity: 45,
        colors: ["#00d9ff", "#0066ff", "#00ff88", "#ffaa00", "#ff0066", "#00ffff"],
      }

      confetti({
        ...defaults,
        particleCount: 60,
        origin: { y: 0.5 },
      })

      setTimeout(() => {
        confetti({
          ...defaults,
          particleCount: 40,
          origin: { y: 0.4 },
        })
      }, 250)
    })
  }, [])

  return null
}
