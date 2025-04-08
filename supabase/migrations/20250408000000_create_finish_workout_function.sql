
-- Create a function to handle workout completion in a single transaction
CREATE OR REPLACE FUNCTION public.finish_workout(
  p_workout_id UUID,
  p_elapsed_time INTEGER,
  p_timer_minutes INTEGER,
  p_timer_seconds INTEGER
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update the workout with completion data and timer settings in a single transaction
  UPDATE public.workouts 
  SET 
    completed_at = NOW(),
    duration_seconds = p_elapsed_time,
    rest_timer_minutes = p_timer_minutes,
    rest_timer_seconds = p_timer_seconds
  WHERE id = p_workout_id;
END;
$$;
