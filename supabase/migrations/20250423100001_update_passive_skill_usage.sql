
-- Add 'used' column to passive_skill_usage table
ALTER TABLE IF EXISTS public.passive_skill_usage 
ADD COLUMN IF NOT EXISTS used BOOLEAN DEFAULT FALSE;

-- Update existing records to mark them as used
UPDATE public.passive_skill_usage
SET used = TRUE
WHERE used IS NULL;

-- Update function to record passive skill usage with used flag
CREATE OR REPLACE FUNCTION public.record_passive_skill_usage(
  p_user_id UUID,
  p_skill_name TEXT,
  p_used BOOLEAN DEFAULT TRUE
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.passive_skill_usage 
    (user_id, skill_name, used, used_at)
  VALUES 
    (p_user_id, p_skill_name, p_used, CASE WHEN p_used THEN CURRENT_TIMESTAMP ELSE NULL END);
END;
$$;

-- Update function to mark passive skill as used
CREATE OR REPLACE FUNCTION public.mark_passive_skill_used(
  p_user_id UUID,
  p_skill_name TEXT
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.passive_skill_usage
  SET 
    used = TRUE,
    used_at = CURRENT_TIMESTAMP
  WHERE 
    user_id = p_user_id 
    AND skill_name = p_skill_name
    AND used = FALSE;
END;
$$;
