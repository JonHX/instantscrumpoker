import { createClient } from "@/lib/supabase/server"

export async function POST(request: Request, { params }: { params: { roomId: string } }) {
  try {
    const { participantId, estimate } = await request.json()
    const supabase = await createClient()

    // Get or create current estimate document
    const { data: estimates, error: fetchError } = await supabase
      .from("estimates")
      .select("*")
      .eq("room_id", params.roomId)
      .eq("revealed", false)
      .single()

    if (fetchError && fetchError.code !== "PGRST116") throw fetchError

    const currentEstimate = estimates || {
      room_id: params.roomId,
      story_id: `story-${Date.now()}`,
      story_title: "Current Estimate",
      votes: [],
      revealed: false,
    }

    // Update votes
    const updatedVotes = currentEstimate.votes.filter(
      (v: { participantId: string }) => v.participantId !== participantId,
    )
    updatedVotes.push({ participantId, estimate, votedAt: new Date().toISOString() })

    if (currentEstimate.id) {
      // Update existing
      const { error: updateError } = await supabase
        .from("estimates")
        .update({ votes: updatedVotes })
        .eq("id", currentEstimate.id)

      if (updateError) throw updateError
    } else {
      // Create new
      const { error: insertError } = await supabase
        .from("estimates")
        .insert({ ...currentEstimate, votes: updatedVotes })

      if (insertError) throw insertError
    }

    return Response.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error("Error submitting vote:", error)
    return Response.json({ error: "Failed to submit vote" }, { status: 500 })
  }
}
