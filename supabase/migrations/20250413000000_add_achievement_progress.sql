
-- Add increment function needed by achievement and profile services
CREATE OR REPLACE FUNCTION public.increment_profile_counter(
  user_id_param UUID,
  counter_name TEXT,
  increment_amount INTEGER
)
RETURNS VOID AS $$
BEGIN
  EXECUTE format('
    UPDATE public.profiles 
    SET %I = COALESCE(%I, 0) + $1
    WHERE id = $2
  ', counter_name, counter_name)
  USING increment_amount, user_id_param;
END;
$$ LANGUAGE plpgsql;

-- Create table for tracking achievement progress
CREATE TABLE IF NOT EXISTS public.achievement_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  achievement_id TEXT REFERENCES public.achievements(id) ON DELETE CASCADE,
  current_value INTEGER DEFAULT 0,
  target_value INTEGER NOT NULL,
  is_complete BOOLEAN DEFAULT false,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

-- Enable RLS on achievement_progress
ALTER TABLE public.achievement_progress ENABLE ROW LEVEL SECURITY;

-- Users can view their own achievement progress
CREATE POLICY "Users can view their own achievement progress"
ON public.achievement_progress
FOR SELECT
USING (auth.uid() = user_id);

-- Users can update their own achievement progress
CREATE POLICY "Users can update their own achievement progress"
ON public.achievement_progress
FOR UPDATE
USING (auth.uid() = user_id);

-- Function to count distinct exercise types
CREATE OR REPLACE FUNCTION public.count_distinct_exercise_types(
  user_id UUID,
  days_back INTEGER DEFAULT 7
)
RETURNS TABLE(type_count BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT COUNT(DISTINCT exercise_id)::BIGINT
  FROM workout_sets ws
  JOIN workouts w ON ws.workout_id = w.id
  WHERE w.user_id = user_id
  AND w.completed_at > (CURRENT_TIMESTAMP - (days_back * INTERVAL '1 day'));
END;
$$ LANGUAGE plpgsql;

-- Function to get distinct activity types
CREATE OR REPLACE FUNCTION public.get_distinct_activity_types(
  user_id UUID
)
RETURNS TABLE(activity_type TEXT) AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT mw.activity_type
  FROM manual_workouts mw
  WHERE mw.user_id = user_id
  AND mw.activity_type IS NOT NULL;
END;
$$ LANGUAGE plpgsql;

-- Add achievement_points column to profiles if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'achievement_points'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN achievement_points INTEGER DEFAULT 0;
  END IF;
END $$;
