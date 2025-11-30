import { RoomPageClient } from "./room-page-client"

// Required for static export with dynamic routes
export async function generateStaticParams() {
  // Return empty array - rooms are created dynamically at runtime
  // This allows the route to be generated but handled client-side
  return []
}

export default function RoomPage({ params }: { params: { roomId: string } }) {
  return <RoomPageClient roomId={params.roomId} />
}

