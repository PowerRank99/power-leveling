
import React from 'react';
import { Shield, Sword, Dumbbell, Wind, Sparkles, Award, Star, Zap } from 'lucide-react';

export const getClassIcon = (iconName: string) => {
  switch (iconName) {
    case 'Sword': return <Sword className="h-6 w-6 text-white" />;
    case 'Dumbbell': return <Dumbbell className="h-6 w-6 text-white" />;
    case 'Wind': return <Wind className="h-6 w-6 text-white" />;
    case 'Sparkles': return <Sparkles className="h-6 w-6 text-white" />;
    case 'Shield': return <Shield className="h-6 w-6 text-white" />;
    case 'Award': return <Award className="h-6 w-6 text-white" />;
    case 'Star': return <Star className="h-6 w-6 text-white" />;
    case 'Zap': return <Zap className="h-6 w-6 text-white" />;
    default: return <Shield className="h-6 w-6 text-white" />;
  }
};

// Get bonus type icon
export const getBonusTypeIcon = (bonusType: string) => {
  switch (bonusType) {
    case 'compound_lifts': return <Dumbbell className="h-4 w-4 text-arcane" />;
    case 'strength': return <Sword className="h-4 w-4 text-arcane" />;
    case 'bodyweight': return <Dumbbell className="h-4 w-4 text-valor" />;
    case 'streak': return <Zap className="h-4 w-4 text-valor" />;
    case 'cardio': return <Wind className="h-4 w-4 text-green-500" />;
    case 'hiit': return <Zap className="h-4 w-4 text-green-500" />;
    case 'flexibility': return <Sparkles className="h-4 w-4 text-purple-500" />;
    case 'recovery': return <Shield className="h-4 w-4 text-purple-500" />;
    case 'sports': return <Award className="h-4 w-4 text-blue-500" />;
    case 'long_workouts': return <Shield className="h-4 w-4 text-blue-500" />;
    default: return <Star className="h-4 w-4 text-text-secondary" />;
  }
};
