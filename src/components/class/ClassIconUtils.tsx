
import React from 'react';
import { Dumbbell, Wind, Sparkles, Shield, Award, Star, Zap, Flame, Target, Search, Sword, Trophy, Heart, Timer, Footprints } from 'lucide-react';

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

// Get bonus type icon with more contextual icons for each bonus type
export const getBonusTypeIcon = (bonusType: string) => {
  switch (bonusType) {
    // Guerreiro bonuses
    case 'compound_lifts': return <Flame className="h-5 w-5 text-white" />; 
    case 'strength': return <Sword className="h-5 w-5 text-white" />;
    
    // Monge bonuses
    case 'bodyweight': return <Dumbbell className="h-5 w-5 text-white" />; 
    case 'streak': return <Zap className="h-5 w-5 text-white" />;
    
    // Ninja bonuses
    case 'cardio': return <Wind className="h-5 w-5 text-white" />; 
    case 'hiit': return <Zap className="h-5 w-5 text-white" />;
    
    // Bruxo bonuses
    case 'flexibility': return <Sparkles className="h-5 w-5 text-white" />; 
    case 'recovery': return <Heart className="h-5 w-5 text-white" />;
    
    // Paladino bonuses
    case 'sports': return <Trophy className="h-5 w-5 text-white" />; 
    case 'long_workouts': return <Timer className="h-5 w-5 text-white" />;
    
    // Movement-related bonuses
    case 'movement': return <Footprints className="h-5 w-5 text-white" />;
    
    // General bonuses
    case 'bonus': return <Shield className="h-5 w-5 text-white" />; 
    case 'achievement': return <Award className="h-5 w-5 text-white" />;
    
    default: return <Shield className="h-5 w-5 text-white" />;
  }
};
