
-- Update achievement seed data with complete set
INSERT INTO public.achievements (
  id,
  name,
  description,
  category,
  rank,
  points,
  xp_reward,
  icon_name,
  requirements,
  string_id
) VALUES
  ('first-workout', 'Primeiro Treino', 'Complete seu primeiro treino', 'workout', 'E', 1, 50, 'dumbbell', '{"workouts_count": 1}', 'first-workout'),
  ('weekly-workouts', 'Trio na Semana', 'Complete 3 treinos em uma semana', 'workout', 'E', 1, 75, 'calendar', '{"weekly_workouts": 3}', 'weekly-three'),
  ('streak-3', 'Trinca Poderosa', 'Treine por 3 dias consecutivos', 'streak', 'E', 1, 75, 'flame', '{"streak_days": 3}', 'first-streak'),
  ('pr-first', 'Quebra-Recorde', 'Estabeleça seu primeiro recorde pessoal', 'record', 'D', 3, 100, 'trending-up', '{"pr_count": 1}', 'first-pr'),
  ('level-5', 'Herói em Ascensão', 'Atinja o nível 5', 'level', 'E', 1, 50, 'arrow-up', '{"level": 5}', 'level-five'),
  ('first-guild', 'Primeira Guilda', 'Junte-se à sua primeira guilda', 'guild', 'E', 1, 50, 'users', '{"guild_count": 1}', 'first-guild'),
  ('manual-first', 'Esporte de Primeira', 'Registre seu primeiro treino manual', 'manual', 'E', 1, 50, 'camera', '{"manual_count": 1}', 'first-manual'),
  ('xp-1000', 'Primeiro Milhar', 'Acumule 1.000 XP', 'xp', 'D', 3, 100, 'trending-up', '{"total_xp": 1000}', 'xp-milestone-1000')
ON CONFLICT (id) DO 
  UPDATE SET 
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    rank = EXCLUDED.rank,
    points = EXCLUDED.points,
    xp_reward = EXCLUDED.xp_reward,
    requirements = EXCLUDED.requirements,
    string_id = EXCLUDED.string_id;
