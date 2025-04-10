
import React from 'react';
import { Shield, Sword, Dumbbell, Wind, Sparkles, Award, Star, Zap, Flame, Target, Trophy } from 'lucide-react';

export const getClassIcon = (iconName: string) => {
  switch (iconName) {
    case 'Sword': return <Sword className="h-6 w-6 text-red-500" />;
    case 'Dumbbell': return <Dumbbell className="h-6 w-6 text-amber-500" />;
    case 'Wind': return <Wind className="h-6 w-6 text-emerald-500" />;
    case 'Sparkles': return <Sparkles className="h-6 w-6 text-violet-500" />;
    case 'Shield': return <Shield className="h-6 w-6 text-blue-500" />;
    case 'Award': return <Award className="h-6 w-6 text-white" />;
    case 'Star': return <Star className="h-6 w-6 text-white" />;
    case 'Zap': return <Zap className="h-6 w-6 text-white" />;
    default: return <Shield className="h-6 w-6 text-white" />;
  }
};

// Get bonus type icon with appropriate color based on type
export const getBonusTypeIcon = (bonusType: string) => {
  switch (bonusType) {
    case 'compound_lifts': return <Flame className="h-5 w-5 text-red-400" />;
    case 'strength': return <Sword className="h-5 w-5 text-red-400" />;
    case 'bodyweight': return <Dumbbell className="h-5 w-5 text-amber-400" />;
    case 'streak': return <Zap className="h-5 w-5 text-amber-400" />;
    case 'cardio': return <Wind className="h-5 w-5 text-emerald-400" />;
    case 'hiit': return <Zap className="h-5 w-5 text-emerald-400" />;
    case 'flexibility': return <Sparkles className="h-5 w-5 text-violet-400" />;
    case 'recovery': return <Shield className="h-5 w-5 text-violet-400" />;
    case 'sports': return <Trophy className="h-5 w-5 text-blue-400" />;
    case 'long_workouts': return <Target className="h-5 w-5 text-blue-400" />;
    default: return <Star className="h-5 w-5 text-text-secondary" />;
  }
};
