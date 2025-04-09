
-- Creates a function that updates both achievement count and XP in one transaction
CREATE OR REPLACE FUNCTION public.increment_achievement_and_xp(
  user_id UUID,
  xp_amount INTEGER
)
RETURNS void AS $$
BEGIN
  UPDATE public.profiles
  SET 
    achievements_count = achievements_count + 1,
    xp = xp + xp_amount
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
