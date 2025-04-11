
-- Function to check for recent manual workouts
CREATE OR REPLACE FUNCTION public.check_recent_manual_workouts(p_user_id UUID, p_hours INTEGER)
RETURNS TABLE(count BIGINT)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT COUNT(*)::BIGINT
  FROM public.manual_workouts
  WHERE 
    user_id = p_user_id 
    AND created_at > (CURRENT_TIMESTAMP - (p_hours * INTERVAL '1 hour'));
END;
$$;

-- Function to create a manual workout
CREATE OR REPLACE FUNCTION public.create_manual_workout(
  p_user_id UUID,
  p_description TEXT,
  p_activity_type TEXT,
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
    photo_url,
    xp_awarded,
    workout_date,
    is_power_day
  ) VALUES (
    p_user_id,
    p_description,
    p_activity_type,
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

-- Function to get user's manual workouts
CREATE OR REPLACE FUNCTION public.get_user_manual_workouts(p_user_id UUID)
RETURNS TABLE(
  id UUID,
  description TEXT,
  activity_type TEXT,
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

-- Function to create power day usage
CREATE OR REPLACE FUNCTION public.create_power_day_usage(
  p_user_id UUID,
  p_week_number INTEGER,
  p_year INTEGER
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.power_day_usage (
    user_id,
    week_number,
    year
  ) VALUES (
    p_user_id,
    p_week_number,
    p_year
  );
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Error creating power day usage: %', SQLERRM;
    RETURN FALSE;
END;
$$;

-- Function to get power day usage count
CREATE OR REPLACE FUNCTION public.get_power_day_usage(
  p_user_id UUID,
  p_week_number INTEGER,
  p_year INTEGER
)
RETURNS TABLE (count BIGINT)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT COUNT(*)::BIGINT
  FROM public.power_day_usage
  WHERE 
    user_id = p_user_id 
    AND week_number = p_week_number
    AND year = p_year;
END;
$$;
