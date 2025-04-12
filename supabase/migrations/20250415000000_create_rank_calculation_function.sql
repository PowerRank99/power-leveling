
-- Create function to calculate rank from achievement points and level
CREATE OR REPLACE FUNCTION public.calculate_user_rank(
  p_level INTEGER,
  p_achievement_points INTEGER
)
RETURNS TEXT AS $$
DECLARE
  rank_score NUMERIC;
  user_rank TEXT;
BEGIN
  -- Calculate rank score using formula: 1.5 × Level + 2 × (Achievement Points)
  rank_score := 1.5 * COALESCE(p_level, 1) + 2 * COALESCE(p_achievement_points, 0);
  
  -- Determine rank based on score
  IF rank_score < 20 THEN
    user_rank := 'Unranked';
  ELSIF rank_score < 50 THEN
    user_rank := 'E';
  ELSIF rank_score < 80 THEN
    user_rank := 'D';
  ELSIF rank_score < 120 THEN
    user_rank := 'C';
  ELSIF rank_score < 160 THEN
    user_rank := 'B';
  ELSIF rank_score < 198 THEN
    user_rank := 'A';
  ELSE
    user_rank := 'S';
  END IF;
  
  RETURN user_rank;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Add a trigger to update rank when level or achievement points change
CREATE OR REPLACE FUNCTION public.update_user_rank()
RETURNS TRIGGER AS $$
BEGIN
  NEW.rank := public.calculate_user_rank(NEW.level, NEW.achievement_points);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
DROP TRIGGER IF EXISTS trigger_update_user_rank ON public.profiles;
CREATE TRIGGER trigger_update_user_rank
BEFORE UPDATE OF level, achievement_points ON public.profiles
FOR EACH ROW
WHEN (OLD.level IS DISTINCT FROM NEW.level OR OLD.achievement_points IS DISTINCT FROM NEW.achievement_points)
EXECUTE FUNCTION public.update_user_rank();
