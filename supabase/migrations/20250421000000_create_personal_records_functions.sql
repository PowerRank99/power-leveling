
-- Create function to insert a personal record
CREATE OR REPLACE FUNCTION public.insert_personal_record(
  p_user_id UUID,
  p_exercise_id UUID,
  p_weight NUMERIC,
  p_previous_weight NUMERIC
) RETURNS void AS $$
BEGIN
  INSERT INTO public.personal_records 
    (user_id, exercise_id, weight, previous_weight)
  VALUES 
    (p_user_id, p_exercise_id, p_weight, p_previous_weight);
END;
$$ LANGUAGE plpgsql;

-- Create function to check if an exercise is on cooldown for PR bonuses
CREATE OR REPLACE FUNCTION public.check_personal_record_cooldown(
  p_user_id UUID,
  p_exercise_id UUID,
  p_days INTEGER
) RETURNS boolean AS $$
DECLARE
  recent_record_count INTEGER;
BEGIN
  -- Count records within the cooldown period
  SELECT COUNT(*)
  INTO recent_record_count
  FROM public.personal_records
  WHERE 
    user_id = p_user_id 
    AND exercise_id = p_exercise_id
    AND recorded_at > (CURRENT_TIMESTAMP - (p_days * INTERVAL '1 day'));
  
  -- Return true if no recent records found (not on cooldown)
  RETURN recent_record_count = 0;
END;
$$ LANGUAGE plpgsql;
