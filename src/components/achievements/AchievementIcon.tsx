
import React from 'react';
import { 
  Star, Dumbbell, Flame, Trophy, Medal, Clock, 
  BookOpen, UserPlus, Zap, Award, Target, Heart,
  Waves, Footprints, ArrowUpRight, PlusCircle
} from 'lucide-react';

export const getIconComponent = (iconName: string): React.ReactNode => {
  switch (iconName) {
    case 'dumbbell':
      return <Dumbbell className="h-6 w-6 text-arcane" />;
    case 'flame':
      return <Flame className="h-6 w-6 text-valor" />;
    case 'trophy':
      return <Trophy className="h-6 w-6 text-achievement" />;
    case 'medal':
      return <Medal className="h-6 w-6 text-achievement" />;
    case 'clock':
      return <Clock className="h-6 w-6 text-arcane" />;
    case 'book':
      return <BookOpen className="h-6 w-6 text-arcane" />;
    case 'user':
      return <UserPlus className="h-6 w-6 text-arcane" />;
    case 'zap':
      return <Zap className="h-6 w-6 text-achievement" />;
    case 'target':
      return <Target className="h-6 w-6 text-valor" />;
    case 'heart':
      return <Heart className="h-6 w-6 text-valor" />;
    case 'waves':
      return <Waves className="h-6 w-6 text-arcane" />;
    case 'footprints':
      return <Footprints className="h-6 w-6 text-valor" />;
    case 'arrow-up-right':
      return <ArrowUpRight className="h-6 w-6 text-achievement" />;
    case 'plus-circle':
      return <PlusCircle className="h-6 w-6 text-arcane" />;
    case 'star':
      return <Star className="h-6 w-6 text-achievement" />;
    default:
      return <Award className="h-6 w-6 text-arcane" />;
  }
};

interface AchievementIconProps {
  iconName: string;
  className?: string;
}

const AchievementIcon: React.FC<AchievementIconProps> = ({ 
  iconName, 
  className = "h-6 w-6" 
}) => {
  const iconElement = React.cloneElement(
    getIconComponent(iconName) as React.ReactElement,
    { className }
  );
  
  return iconElement;
};

export default AchievementIcon;
