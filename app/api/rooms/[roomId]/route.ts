import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request, { params }: { params: { roomId: string } }) {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase.from("rooms").select("*").eq("id", params.roomId).single()

    if (error) throw error

    return Response.json(data)
  } catch (error) {
    console.error("Error fetching room:", error)
    return Response.json({ error: "Failed to fetch room" }, { status: 500 })
  }
}

export async function POST(request: Request, { params }: { params: { roomId: string } }) {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase.from("rooms").select("*").eq("id", params.roomId).single()

    if (error) throw error

    return Response.json({ exists: true, room: data })
  } catch (error) {
    console.error("Error checking room:", error)
    return Response.json({ exists: false }, { status: 404 })
  }
}
