
import { Dumbbell, Flame, Timer, Star, Activity, Zap, Lightbulb, Heart, PlayCircle, Sword, Wind, Sparkles, Shield, Leaf, Fist } from 'lucide-react';
import React from 'react';

/**
 * Get the appropriate icon based on bonus type
 */
export const getBonusTypeIcon = (bonusType: string): React.ReactNode => {
  const lowerType = bonusType.toLowerCase();
  
  if (lowerType.includes('compound') || lowerType.includes('compost')) {
    return <Dumbbell className="h-4 w-4 text-white" />;
  } else if (lowerType.includes('strength') || lowerType.includes('força')) {
    return <Flame className="h-4 w-4 text-white" />; // Changed from Fire to Flame
  } else if (lowerType.includes('bodyweight') || lowerType.includes('corpo') || lowerType.includes('calistenia')) {
    return <Fist className="h-4 w-4 text-white" />;
  } else if (lowerType.includes('cardio') || lowerType.includes('hiit')) {
    return <Zap className="h-4 w-4 text-white" />;
  } else if (lowerType.includes('flex') || lowerType.includes('yoga') || lowerType.includes('mobil')) {
    return <Leaf className="h-4 w-4 text-white" />;
  } else if (lowerType.includes('recovery') || lowerType.includes('recup')) {
    return <Heart className="h-4 w-4 text-white" />;
  } else if (lowerType.includes('sport') || lowerType.includes('esport')) {
    return <PlayCircle className="h-4 w-4 text-white" />;
  } else if (lowerType.includes('time') || lowerType.includes('streak')) {
    return <Timer className="h-4 w-4 text-white" />;
  } else if (lowerType.includes('guilda') || lowerType.includes('contribuição')) {
    return <Shield className="h-4 w-4 text-white" />;
  }
  
  // Default icon
  return <Star className="h-4 w-4 text-white" />;
};

/**
 * Get the class icon based on class name
 */
export const getClassIcon = (className: string | null): React.ReactNode => {
  if (!className) return <Shield className="h-6 w-6 text-white" />;
  
  switch (className.toLowerCase()) {
    case 'guerreiro': return <Sword className="h-6 w-6 text-white" />;
    case 'monge': return <Fist className="h-6 w-6 text-white" />; // Changed from Dumbbell to Fist
    case 'ninja': return <Wind className="h-6 w-6 text-white" />;
    case 'bruxo': return <Sparkles className="h-6 w-6 text-white" />;
    case 'paladino': return <Shield className="h-6 w-6 text-white" />;
    case 'druida': return <Leaf className="h-6 w-6 text-white" />;
    default: return <Shield className="h-6 w-6 text-white" />;
  }
};

/**
 * Get the class color based on class name
 */
export const getClassColor = (className: string | null): string => {
  if (!className) return 'text-gray-400';
  
  switch (className.toLowerCase()) {
    case 'guerreiro': return 'text-red-500';
    case 'monge': return 'text-amber-500';
    case 'ninja': return 'text-emerald-500';
    case 'bruxo': return 'text-violet-500';
    case 'paladino': return 'text-blue-500';
    case 'druida': return 'text-green-500';
    default: return 'text-gray-400';
  }
};
