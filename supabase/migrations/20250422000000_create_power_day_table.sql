
-- Create the power_day_usage table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.power_day_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.auth.users(id),
  week_number INTEGER NOT NULL,
  year INTEGER NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Add constraint to prevent duplicates
  CONSTRAINT unique_power_day_per_user_week UNIQUE (user_id, week_number, year)
);

-- Add RLS policies
ALTER TABLE public.power_day_usage ENABLE ROW LEVEL SECURITY;

-- Policy for users to view only their power day usage
CREATE POLICY "Users can view their own power day usage"
  ON public.power_day_usage
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy for users to insert their own power day usage
CREATE POLICY "Users can insert their own power day usage"
  ON public.power_day_usage
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS power_day_usage_user_id_idx ON public.power_day_usage (user_id);
CREATE INDEX IF NOT EXISTS power_day_usage_week_year_idx ON public.power_day_usage (week_number, year);
