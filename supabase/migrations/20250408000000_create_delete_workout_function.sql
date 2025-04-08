
CREATE OR REPLACE FUNCTION public.delete_workout_with_sets(workout_id_param UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Delete sets associated with the workout
  DELETE FROM public.workout_sets
  WHERE workout_id = workout_id_param;
  
  -- Delete the workout itself
  DELETE FROM public.workouts
  WHERE id = workout_id_param;
END;
$$;
