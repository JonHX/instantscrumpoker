import { createClient } from "@/lib/supabase/server"

export async function POST(request: Request, { params }: { params: { roomId: string } }) {
  try {
    const { name } = await request.json()
    const participantId = `participant-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    const supabase = await createClient()

    // Get current room
    const { data: room, error: fetchError } = await supabase
      .from("rooms")
      .select("participants")
      .eq("id", params.roomId)
      .single()

    if (fetchError) throw fetchError

    // Add participant
    const updatedParticipants = [
      ...(room.participants || []),
      { id: participantId, name, joinedAt: new Date().toISOString() },
    ]

    const { error: updateError } = await supabase
      .from("rooms")
      .update({ participants: updatedParticipants })
      .eq("id", params.roomId)

    if (updateError) throw updateError

    return Response.json({ participantId }, { status: 200 })
  } catch (error) {
    console.error("Error joining room:", error)
    return Response.json({ error: "Failed to join room" }, { status: 500 })
  }
}
