
import React from 'react';
import { Shield, Sword, Dumbbell, Wind, Sparkles, Award, Star, Zap } from 'lucide-react';

export const getClassIcon = (iconName: string) => {
  switch (iconName) {
    case 'Sword': return <Sword className="h-6 w-6 text-red-500" />;
    case 'Dumbbell': return <Dumbbell className="h-6 w-6 text-amber-500" />;
    case 'Wind': return <Wind className="h-6 w-6 text-emerald-500" />;
    case 'Sparkles': return <Sparkles className="h-6 w-6 text-blue-500" />;
    case 'Shield': return <Shield className="h-6 w-6 text-yellow-500" />;
    case 'Award': return <Award className="h-6 w-6 text-white" />;
    case 'Star': return <Star className="h-6 w-6 text-white" />;
    case 'Zap': return <Zap className="h-6 w-6 text-white" />;
    default: return <Shield className="h-6 w-6 text-white" />;
  }
};

// Get bonus type icon with appropriate color based on type
export const getBonusTypeIcon = (bonusType: string) => {
  switch (bonusType) {
    case 'compound_lifts': return <Dumbbell className="h-4 w-4 text-red-500" />;
    case 'strength': return <Sword className="h-4 w-4 text-red-500" />;
    case 'bodyweight': return <Dumbbell className="h-4 w-4 text-amber-500" />;
    case 'streak': return <Zap className="h-4 w-4 text-amber-500" />;
    case 'cardio': return <Wind className="h-4 w-4 text-emerald-500" />;
    case 'hiit': return <Zap className="h-4 w-4 text-emerald-500" />;
    case 'flexibility': return <Sparkles className="h-4 w-4 text-blue-500" />;
    case 'recovery': return <Shield className="h-4 w-4 text-blue-500" />;
    case 'sports': return <Award className="h-4 w-4 text-yellow-500" />;
    case 'long_workouts': return <Shield className="h-4 w-4 text-yellow-500" />;
    default: return <Star className="h-4 w-4 text-text-secondary" />;
  }
};
