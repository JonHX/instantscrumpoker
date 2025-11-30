import { RoomPageClient } from "./room-page-client"

// Server component that handles static generation
// Required for Next.js 16 with output: 'export'
export async function generateStaticParams() {
  // Return a placeholder route to satisfy static export build requirement
  // All other routes will be handled client-side via 404.html fallback
  return [{ roomId: "_placeholder" }]
}

// Pass roomId as a prop to the client component
// In static export, this will only be called for the placeholder route
// Other routes will hit 404.html and be handled client-side
export default async function RoomPage({
  params,
}: {
  params: Promise<{ roomId: string }>
}) {
  const { roomId } = await params
  
  // If this is the placeholder, don't render (will be handled by 404)
  if (roomId === "_placeholder") {
    return null
  }
  
  return <RoomPageClient roomId={roomId} />
}
