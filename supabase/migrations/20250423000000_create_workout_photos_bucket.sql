
-- Create storage bucket for workout photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('workout-photos', 'Workout Photos', true);

-- Create a policy to allow authenticated users to upload photos
CREATE POLICY "Users can upload workout photos"
ON storage.objects
FOR INSERT 
TO authenticated
WITH CHECK (bucket_id = 'workout-photos' AND auth.uid() = owner);

-- Create a policy to allow users to select their own photos
CREATE POLICY "Users can select their own workout photos"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'workout-photos' AND owner = auth.uid());

-- Create a policy to allow public access to workout photos
CREATE POLICY "Anyone can view workout photos"
ON storage.objects
FOR SELECT
USING (bucket_id = 'workout-photos');
