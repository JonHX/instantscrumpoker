import { createClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  try {
    const { name } = await request.json()
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("rooms")
      .insert({
        name,
        created_by: "guest",
      })
      .select()
      .single()

    if (error) throw error

    return Response.json({ roomId: data.id }, { status: 201 })
  } catch (error) {
    console.error("Error creating room:", error)
    return Response.json({ error: "Failed to create room" }, { status: 500 })
  }
}
