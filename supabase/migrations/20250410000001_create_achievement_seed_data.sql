
-- Create seed data for achievements
INSERT INTO public.achievements (
  id, 
  name, 
  description, 
  category, 
  xp_reward, 
  icon_name, 
  requirements
) VALUES 
  ('first_workout', 'Primeiro Treino', 'Complete seu primeiro treino', 'Marco', 50, 'trophy', '{"workouts_count": 1}'),
  ('10_workouts', 'Consistência', 'Complete 10 treinos', 'Marco', 100, 'award', '{"workouts_count": 10}'),
  ('50_workouts', 'Entusiasta Fitness', 'Complete 50 treinos', 'Marco', 200, 'medal', '{"workouts_count": 50}'),
  ('100_workouts', 'Campeão Fitness', 'Complete 100 treinos', 'Marco', 300, 'crown', '{"workouts_count": 100}'),
  ('streak_7_days', 'Sequência Iniciante', '7 dias seguidos treinando', 'Sequência', 100, 'flame', '{"streak_days": 7}'),
  ('streak_30_days', 'Rei da Consistência', '30 dias seguidos treinando', 'Sequência', 300, 'zap', '{"streak_days": 30}'),
  ('streak_100_days', 'Lendário', '100 dias seguidos treinando', 'Sequência', 500, 'star', '{"streak_days": 100}')
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  xp_reward = EXCLUDED.xp_reward,
  requirements = EXCLUDED.requirements;
