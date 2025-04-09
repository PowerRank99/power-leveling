
-- Create increment function for easy counter updates
CREATE OR REPLACE FUNCTION public.increment(x integer)
RETURNS integer AS $$
  BEGIN
    RETURN $1 + x;
  END;
$$ LANGUAGE plpgsql STABLE;
