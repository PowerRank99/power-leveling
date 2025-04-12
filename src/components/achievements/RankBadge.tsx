
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Crown, Star, Flame, Shield, Award, Zap } from 'lucide-react';

interface RankBadgeProps {
  rank: string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

const RankBadge: React.FC<RankBadgeProps> = ({ 
  rank, 
  size = 'md',
  showIcon = true 
}) => {
  // Map rank to appropriate styling
  const getRankDetails = () => {
    switch(rank) {
      case 'S':
        return { 
          color: 'bg-achievement-15 text-achievement border-achievement-30',
          icon: <Crown className="h-3 w-3 mr-1" />,
          label: 'S'
        };
      case 'A':
        return { 
          color: 'bg-achievement-15 text-achievement border-achievement-30',
          icon: <Star className="h-3 w-3 mr-1" />,
          label: 'A'
        };
      case 'B':
        return { 
          color: 'bg-valor-15 text-valor border-valor-30',
          icon: <Flame className="h-3 w-3 mr-1" />,
          label: 'B'
        };
      case 'C':
        return { 
          color: 'bg-arcane-15 text-arcane-60 border-arcane-30',
          icon: <Shield className="h-3 w-3 mr-1" />,
          label: 'C'
        };
      case 'D':
        return { 
          color: 'bg-arcane-15 text-arcane border-arcane-30',
          icon: <Zap className="h-3 w-3 mr-1" />,
          label: 'D'
        };
      case 'E':
        return { 
          color: 'bg-midnight-elevated text-text-secondary border-divider/30',
          icon: <Award className="h-3 w-3 mr-1" />,
          label: 'E'
        };
      default:
        return { 
          color: 'bg-midnight-elevated text-text-tertiary border-divider/30',
          icon: <Award className="h-3 w-3 mr-1" />,
          label: 'Unranked'
        };
    }
  };

  const { color, icon, label } = getRankDetails();
  
  // Size classes
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5'
  };
  
  return (
    <Badge 
      className={`${color} ${sizeClasses[size]} shadow-glow-subtle ${rank === 'S' || rank === 'A' ? 'shadow-glow-gold' : rank === 'B' ? 'shadow-glow-valor' : 'shadow-glow-purple'} font-bold flex items-center`}
    >
      {showIcon && icon}
      {label}
    </Badge>
  );
};

export default RankBadge;
