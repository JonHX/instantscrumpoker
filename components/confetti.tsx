"use client"

import { useEffect } from "react"

export function Confetti() {
  useEffect(() => {
    const colors = ["bg-accent", "bg-blue-400", "bg-green-400", "bg-yellow-400", "bg-pink-400", "bg-purple-400"]

    for (let i = 0; i < 50; i++) {
      const confettiPiece = document.createElement("div")
      confettiPiece.className = `confetti fixed w-2 h-2 rounded-full pointer-events-none ${colors[Math.floor(Math.random() * colors.length)]}`
      confettiPiece.style.left = Math.random() * window.innerWidth + "px"
      confettiPiece.style.top = "-10px"
      confettiPiece.style.opacity = "1"
      document.body.appendChild(confettiPiece)

      // Remove after animation completes
      setTimeout(() => confettiPiece.remove(), 3000)
    }
  }, [])

  return null
}
