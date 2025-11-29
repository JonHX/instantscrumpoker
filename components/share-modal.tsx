"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Copy, X } from "lucide-react"

interface ShareModalProps {
  roomId: string
  roomName: string
  onClose: () => void
}

export function ShareModal({ roomId, roomName, onClose }: ShareModalProps) {
  const [copied, setCopied] = useState(false)
  const [qrCode, setQrCode] = useState<string>("")

  useEffect(() => {
    // Generate QR code using QR Server API with full URL
    const shareUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/rooms/${roomId}`
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(shareUrl)}`
    setQrCode(qrUrl)
  }, [roomId])

  const shareUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/rooms/${roomId}`

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="bg-card border-border p-8 space-y-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">Share Room</h2>
          <button onClick={onClose} className="p-1 hover:bg-secondary rounded-lg transition-colors">
            <X className="w-5 h-5 text-foreground" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Room Name */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">ROOM NAME</p>
            <p className="text-lg font-semibold text-foreground">{roomName}</p>
          </div>

          {/* Room ID */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">ROOM CODE</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-secondary border border-border rounded-lg p-3 text-accent font-mono font-bold text-center text-lg">
                {roomId.split("-").pop()?.toUpperCase() || roomId.slice(-4).toUpperCase()}
              </code>
              <Button
                onClick={() => handleCopy(roomId.split("-").pop()?.toUpperCase() || roomId.slice(-4).toUpperCase())}
                size="sm"
                variant="outline"
                className="border-border bg-transparent hover:bg-secondary"
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* QR Code */}
          <div className="text-center">
            <p className="text-xs font-medium text-muted-foreground mb-2">SCAN TO JOIN</p>
            <div className="bg-white p-3 rounded-lg flex justify-center">
              <img src={qrCode || "/placeholder.svg"} alt="QR Code" className="w-40 h-40" />
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
                className="flex-1 bg-secondary border border-border rounded-lg p-3 text-foreground text-sm truncate"
              />
              <Button
                onClick={() => handleCopy(shareUrl)}
                size="sm"
                variant="outline"
                className="border-border bg-transparent hover:bg-secondary"
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Copy Feedback */}
          {copied && <p className="text-sm text-accent text-center font-medium">Copied to clipboard!</p>}
        </div>

        <Button onClick={onClose} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold">
          Done
        </Button>
      </Card>
    </div>
  )
}
