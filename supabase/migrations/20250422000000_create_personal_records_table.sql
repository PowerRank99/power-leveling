
-- Create personal records table if not exists
CREATE TABLE IF NOT EXISTS public.personal_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exercise_id UUID NOT NULL REFERENCES public.exercises(id) ON DELETE CASCADE,
  weight NUMERIC NOT NULL DEFAULT 0,
  previous_weight NUMERIC NOT NULL DEFAULT 0,
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS personal_records_user_id_idx ON public.personal_records(user_id);
CREATE INDEX IF NOT EXISTS personal_records_exercise_id_idx ON public.personal_records(exercise_id);

-- Enable RLS
ALTER TABLE public.personal_records ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own personal records"
  ON public.personal_records
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own personal records"
  ON public.personal_records
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create a unique constraint to prevent duplicates for the same user and exercise on the same day
CREATE UNIQUE INDEX IF NOT EXISTS personal_records_user_exercise_date_idx 
  ON public.personal_records (user_id, exercise_id, DATE(recorded_at));
