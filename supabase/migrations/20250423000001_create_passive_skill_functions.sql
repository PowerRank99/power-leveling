
-- Function to check if a passive skill is on cooldown
CREATE OR REPLACE FUNCTION public.check_passive_skill_usage(
  p_user_id UUID,
  p_skill_name TEXT,
  p_days INTEGER DEFAULT 7
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
  usage_exists BOOLEAN;
BEGIN
  -- Check if the skill has been used within the cooldown period
  SELECT EXISTS(
    SELECT 1
    FROM public.passive_skill_usage
    WHERE 
      user_id = p_user_id 
      AND skill_name = p_skill_name
      AND used_at > (CURRENT_TIMESTAMP - (p_days * INTERVAL '1 day'))
  ) INTO usage_exists;
  
  RETURN usage_exists;
END;
$$;

-- Function to record passive skill usage
CREATE OR REPLACE FUNCTION public.record_passive_skill_usage(
  p_user_id UUID,
  p_skill_name TEXT
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.passive_skill_usage 
    (user_id, skill_name, used_at)
  VALUES 
    (p_user_id, p_skill_name, CURRENT_TIMESTAMP);
END;
$$;
