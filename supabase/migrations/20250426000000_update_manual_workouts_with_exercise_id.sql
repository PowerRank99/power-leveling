
-- Add exercise_id column to manual_workouts table
ALTER TABLE public.manual_workouts ADD COLUMN exercise_id UUID;

-- Update the create_manual_workout function
CREATE OR REPLACE FUNCTION public.create_manual_workout(
  p_user_id UUID,
  p_description TEXT,
  p_activity_type TEXT,
  p_exercise_id UUID,
  p_photo_url TEXT,
  p_xp_awarded INTEGER,
  p_workout_date TIMESTAMP WITH TIME ZONE,
  p_is_power_day BOOLEAN
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.manual_workouts (
    user_id,
    description,
    activity_type,
    exercise_id,
    photo_url,
    xp_awarded,
    workout_date,
    is_power_day
  ) VALUES (
    p_user_id,
    p_description,
    p_activity_type,
    p_exercise_id,
    p_photo_url,
    p_xp_awarded,
    p_workout_date,
    p_is_power_day
  );
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Error creating manual workout: %', SQLERRM;
    RETURN FALSE;
END;
$$;

-- Update the get_user_manual_workouts function
CREATE OR REPLACE FUNCTION public.get_user_manual_workouts(p_user_id UUID)
RETURNS TABLE(
  id UUID,
  description TEXT,
  activity_type TEXT,
  exercise_id UUID,
  photo_url TEXT,
  xp_awarded INTEGER,
  created_at TIMESTAMP WITH TIME ZONE,
  workout_date TIMESTAMP WITH TIME ZONE,
  is_power_day BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    manual_workouts.id,
    manual_workouts.description,
    manual_workouts.activity_type,
    manual_workouts.exercise_id,
    manual_workouts.photo_url,
    manual_workouts.xp_awarded,
    manual_workouts.created_at,
    manual_workouts.workout_date,
    manual_workouts.is_power_day
  FROM public.manual_workouts
  WHERE user_id = p_user_id
  ORDER BY created_at DESC;
END;
$$;
