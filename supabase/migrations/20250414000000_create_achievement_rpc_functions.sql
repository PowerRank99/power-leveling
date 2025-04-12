
-- Create function to get achievement progress by ID
CREATE OR REPLACE FUNCTION public.get_achievement_progress_by_id(
  p_user_id UUID,
  p_achievement_id UUID
)
RETURNS SETOF achievement_progress AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM public.achievement_progress
  WHERE user_id = p_user_id
  AND achievement_id = p_achievement_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to efficiently check for multiple achievements at once
CREATE OR REPLACE FUNCTION public.check_multiple_achievements(
  p_user_id UUID,
  p_achievement_ids UUID[]
)
RETURNS TABLE(
  achievement_id UUID,
  is_awarded BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.id AS achievement_id,
    CASE WHEN ua.id IS NOT NULL THEN TRUE ELSE FALSE END AS is_awarded
  FROM 
    unnest(p_achievement_ids) AS a_id
  JOIN 
    public.achievements a ON a.id = a_id
  LEFT JOIN 
    public.user_achievements ua ON ua.achievement_id = a.id AND ua.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to update profile achievements count and points
CREATE OR REPLACE FUNCTION public.update_achievement_stats(
  p_user_id UUID,
  p_achievement_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  achievement_points INTEGER;
  achievement_xp INTEGER;
BEGIN
  -- Get achievement data
  SELECT points, xp_reward INTO achievement_points, achievement_xp
  FROM public.achievements
  WHERE id = p_achievement_id;
  
  -- Update profile
  UPDATE public.profiles
  SET 
    achievements_count = COALESCE(achievements_count, 0) + 1,
    achievement_points = COALESCE(achievement_points, 0) + COALESCE(achievement_points, 0),
    xp = COALESCE(xp, 0) + COALESCE(achievement_xp, 0)
  WHERE id = p_user_id;
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
