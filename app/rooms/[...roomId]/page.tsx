import { RoomPageClient } from "./room-page-client"

// Required for static export
// Return at least one param to satisfy static export requirements
// The actual roomId will be handled client-side at runtime
export async function generateStaticParams() {
  return [
    { roomId: ['placeholder'] }
  ]
}

export default function RoomPage({ params }: { params: { roomId: string[] } }) {
  // Join the catch-all segments back into a single roomId
  // Handle both array and string cases
  let roomId: string
  if (Array.isArray(params.roomId)) {
    roomId = params.roomId.length > 0 ? params.roomId.join('/') : ''
  } else {
    roomId = params.roomId || ''
  }
  
  // Don't render if roomId is empty or placeholder (during build)
  if (!roomId || roomId === 'placeholder') {
    return null
  }
  
  return <RoomPageClient roomId={roomId} />
}

