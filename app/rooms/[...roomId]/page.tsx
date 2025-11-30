import { RoomPageClient } from "./room-page-client"

// Required for static export with catch-all routes
// For catch-all routes [...roomId], roomId must be an array
export async function generateStaticParams() {
  // Return empty array - all routes will be handled client-side
  // This satisfies the requirement while allowing any roomId at runtime
  return []
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

