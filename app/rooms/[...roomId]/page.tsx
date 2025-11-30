import { RoomPageClient } from "./room-page-client"

// Next.js 16: For catch-all routes with static export
// generateStaticParams must return params where roomId is an array
export async function generateStaticParams() {
  // Return one placeholder to satisfy static export
  // All other room IDs will work via client-side routing
  return [{ roomId: ['_'] }]
}

export default function RoomPage({ params }: { params: { roomId: string[] } }) {
  // Join catch-all segments into a single roomId string
  const roomId = Array.isArray(params.roomId) 
    ? params.roomId.join('/') 
    : params.roomId || ''
  
  // Don't render placeholder
  if (roomId === '_') {
    return null
  }
  
  return <RoomPageClient roomId={roomId} />
}

