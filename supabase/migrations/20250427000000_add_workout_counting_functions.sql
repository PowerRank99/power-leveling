
-- Function to count workouts by exercise type
CREATE OR REPLACE FUNCTION public.count_workouts_by_exercise_type(
  p_user_id UUID,
  p_type TEXT
)
RETURNS TABLE(count BIGINT)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- First count regular workouts with exercises of the specified type
  RETURN QUERY
  WITH workout_with_type AS (
    SELECT DISTINCT w.id
    FROM workouts w
    JOIN workout_sets ws ON w.id = ws.workout_id
    JOIN exercises e ON ws.exercise_id = e.id
    WHERE 
      w.user_id = p_user_id AND
      e.type = p_type AND
      w.completed_at IS NOT NULL
  )
  SELECT COUNT(*)::BIGINT FROM workout_with_type
  UNION ALL
  -- Then add manual workouts with specified activity type
  SELECT COUNT(*)::BIGINT
  FROM manual_workouts
  WHERE 
    user_id = p_user_id AND
    activity_type = p_type;
END;
$$;

-- Function to get a user's workout variety statistics
CREATE OR REPLACE FUNCTION public.get_user_workout_variety_stats(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
  exercise_type_counts JSONB;
  total_variety INTEGER;
BEGIN
  -- Count workouts by exercise type
  WITH type_counts AS (
    -- Count from regular workouts
    SELECT e.type, COUNT(DISTINCT w.id) as count
    FROM workouts w
    JOIN workout_sets ws ON w.id = ws.workout_id
    JOIN exercises e ON ws.exercise_id = e.id
    WHERE 
      w.user_id = p_user_id AND
      w.completed_at IS NOT NULL
    GROUP BY e.type
    
    UNION ALL
    
    -- Count from manual workouts
    SELECT activity_type as type, COUNT(*) as count
    FROM manual_workouts
    WHERE user_id = p_user_id
    GROUP BY activity_type
  )
  SELECT 
    jsonb_object_agg(type, count) INTO exercise_type_counts
  FROM type_counts;
  
  -- Count total unique exercise types user has done
  SELECT COUNT(DISTINCT type) INTO total_variety
  FROM type_counts;
  
  -- Build result object
  result := jsonb_build_object(
    'type_counts', COALESCE(exercise_type_counts, '{}'::jsonb),
    'total_variety', total_variety
  );
  
  RETURN result;
END;
$$;
