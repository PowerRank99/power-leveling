
import { Dumbbell, Flame, Timer, Star, Activity, Zap, Lightbulb, Heart, PlayCircle, Leaf } from 'lucide-react';
import React from 'react';

/**
 * Get the appropriate icon based on bonus type
 */
export const getBonusTypeIcon = (bonusType: string): React.ReactNode => {
  const lowerType = bonusType.toLowerCase();
  
  if (lowerType.includes('compound') || lowerType.includes('compost')) {
    return <Dumbbell className="h-4 w-4 text-white" />;
  } else if (lowerType.includes('strength') || lowerType.includes('força')) {
    return <Flame className="h-4 w-4 text-white" />; 
  } else if (lowerType.includes('bodyweight') || lowerType.includes('corpo')) {
    return <Activity className="h-4 w-4 text-white" />;
  } else if (lowerType.includes('cardio') || lowerType.includes('hiit')) {
    return <Zap className="h-4 w-4 text-white" />;
  } else if (lowerType.includes('flex') || lowerType.includes('yoga') || lowerType.includes('ritmo da natureza')) {
    return <Leaf className="h-4 w-4 text-white" />;
  } else if (lowerType.includes('recovery') || lowerType.includes('recup') || lowerType.includes('rest')) {
    return <Heart className="h-4 w-4 text-white" />;
  } else if (lowerType.includes('sport') || lowerType.includes('esport')) {
    return <PlayCircle className="h-4 w-4 text-white" />;
  } else if (lowerType.includes('time') || lowerType.includes('streak')) {
    return <Timer className="h-4 w-4 text-white" />;
  } else if (lowerType.includes('achievement') || lowerType.includes('conquista')) {
    return <Star className="h-4 w-4 text-white" />;
  }
  
  // Default icon
  return <Star className="h-4 w-4 text-white" />;
};
