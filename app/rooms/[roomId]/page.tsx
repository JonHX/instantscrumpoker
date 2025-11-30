import { RoomPageClient } from "./room-page-client"

// Required for static export - return empty array for dynamic routes
// All room IDs will be handled client-side at runtime
export async function generateStaticParams() {
  return []
}

export default function RoomPage({ params }: { params: { roomId: string } }) {
  return <RoomPageClient roomId={params.roomId} />
}

