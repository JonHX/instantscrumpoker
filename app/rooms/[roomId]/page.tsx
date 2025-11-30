import { RoomPageClient } from "./room-page-client"

// Server component wrapper required for generateStaticParams
export async function generateStaticParams() {
  // Return a placeholder route to satisfy static export build requirement
  // All other routes will be handled client-side via index.html fallback
  return [{ roomId: "_placeholder" }]
}

// Server component that passes params to client component
// Next.js client-side router will route to this for any /rooms/[roomId] URL
export default async function RoomPage({
  params,
}: {
  params: Promise<{ roomId: string }>
}) {
  const { roomId } = await params
  
  // If this is the placeholder, render the client component anyway
  // It will handle the routing properly
  return <RoomPageClient roomId={roomId} />
}
