-- Create rooms table
CREATE TABLE IF NOT EXISTS public.rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by TEXT NOT NULL,
  current_story_id TEXT,
  current_story_title TEXT,
  is_discussing BOOLEAN DEFAULT false,
  participants JSONB DEFAULT '[]'::jsonb
);

-- Create estimates table for voting
CREATE TABLE IF NOT EXISTS public.estimates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  story_id TEXT NOT NULL,
  story_title TEXT NOT NULL,
  votes JSONB DEFAULT '[]'::jsonb,
  revealed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  final_estimate INT
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_estimates_room_id ON public.estimates(room_id);
CREATE INDEX IF NOT EXISTS idx_estimates_story_id ON public.estimates(story_id);
