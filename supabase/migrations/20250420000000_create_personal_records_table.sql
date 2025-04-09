
-- Create table to track personal records for XP bonuses
CREATE TABLE IF NOT EXISTS public.personal_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  exercise_id UUID REFERENCES public.exercises NOT NULL,
  weight NUMERIC NOT NULL,
  previous_weight NUMERIC NOT NULL,
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies
ALTER TABLE public.personal_records ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to view their own personal records
CREATE POLICY "Users can view their own personal records" 
ON public.personal_records 
FOR SELECT 
USING (auth.uid() = user_id);

-- Create policy to allow users to insert their own personal records
CREATE POLICY "Users can insert their own personal records" 
ON public.personal_records 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Add routine difficulty column to store workout difficulty level
ALTER TABLE public.routines ADD COLUMN IF NOT EXISTS difficulty TEXT DEFAULT 'intermediario';

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_personal_records_user_id ON public.personal_records (user_id);
CREATE INDEX IF NOT EXISTS idx_personal_records_exercise_id ON public.personal_records (exercise_id);
CREATE INDEX IF NOT EXISTS idx_personal_records_recorded_at ON public.personal_records (recorded_at);
