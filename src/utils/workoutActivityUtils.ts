
/**
 * Maps activity type codes to human-readable labels
 */
export const getActivityLabel = (activityType: string | null | undefined): string => {
  const activityMap: Record<string, string> = {
    'strength': 'Musculação',
    'cardio': 'Cardio',
    'running': 'Corrida',
    'yoga': 'Yoga',
    'sports': 'Esportes',
    'bodyweight': 'Calistenia',
    'flexibility': 'Flexibilidade',
    'other': 'Outro'
  };
  
  return activityType ? (activityMap[activityType] || activityType) : 'Não especificado';
};
