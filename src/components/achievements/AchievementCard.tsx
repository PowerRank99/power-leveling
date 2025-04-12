
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Star, Lock, Award, Dumbbell, Calendar, Target, Flame, Clock, Users, Zap, Shield, Crown } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import RankBadge from './RankBadge';

interface AchievementCardProps {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  points: number;
  iconName?: string;
  status: 'locked' | 'unlocked';
  rank: string;
  category?: string;
  progress?: {
    current: number;
    total: number;
  };
  onClick?: () => void;
}

const AchievementCard: React.FC<AchievementCardProps> = ({
  id,
  title,
  description,
  xpReward,
  points,
  iconName = 'award',
  status,
  rank,
  category,
  progress,
  onClick
}) => {
  // Get icon based on iconName
  const getIcon = () => {
    switch (iconName) {
      case 'dumbbell': return <Dumbbell className={`h-6 w-6 ${getIconColor()}`} />;
      case 'flame': return <Flame className={`h-6 w-6 ${getIconColor()}`} />;
      case 'target': return <Target className={`h-6 w-6 ${getIconColor()}`} />;
      case 'calendar': return <Calendar className={`h-6 w-6 ${getIconColor()}`} />;
      case 'users': return <Users className={`h-6 w-6 ${getIconColor()}`} />;
      case 'zap': return <Zap className={`h-6 w-6 ${getIconColor()}`} />;
      case 'clock': return <Clock className={`h-6 w-6 ${getIconColor()}`} />;
      case 'shield': return <Shield className={`h-6 w-6 ${getIconColor()}`} />;
      case 'crown': return <Crown className={`h-6 w-6 ${getIconColor()}`} />;
      case 'star': return <Star className={`h-6 w-6 ${getIconColor()}`} />;
      default: return <Award className={`h-6 w-6 ${getIconColor()}`} />;
    }
  };
  
  // Get icon color based on status and rank
  const getIconColor = () => {
    if (status === 'locked') return 'text-inactive';
    
    switch (rank) {
      case 'S': return 'text-achievement';
      case 'A': return 'text-achievement';
      case 'B': return 'text-valor';
      case 'C': return 'text-arcane-60';
      case 'D': return 'text-arcane';
      case 'E': return 'text-text-secondary';
      default: return 'text-text-tertiary';
    }
  };
  
  // Get background color based on rank
  const getIconBg = () => {
    if (status === 'locked') return 'bg-midnight-elevated';
    
    switch (rank) {
      case 'S': return 'bg-achievement-15';
      case 'A': return 'bg-achievement-15';
      case 'B': return 'bg-valor-15';
      case 'C': return 'bg-arcane-15';
      case 'D': return 'bg-arcane-15';
      case 'E': return 'bg-midnight-elevated';
      default: return 'bg-midnight-elevated';
    }
  };
  
  // Get border color based on rank
  const getBorderColor = () => {
    if (status === 'locked') return 'border-divider/30';
    
    switch (rank) {
      case 'S': return 'border-achievement-30';
      case 'A': return 'border-achievement-30';
      case 'B': return 'border-valor-30';
      case 'C': return 'border-arcane-30';
      case 'D': return 'border-arcane-30';
      case 'E': return 'border-divider/30';
      default: return 'border-divider/30';
    }
  };
  
  // Get glow effect based on rank
  const getGlowEffect = () => {
    if (status === 'locked') return '';
    
    switch (rank) {
      case 'S': return 'shadow-glow-gold';
      case 'A': return 'shadow-glow-gold';
      case 'B': return 'shadow-glow-valor';
      case 'C': 
      case 'D': return 'shadow-glow-purple';
      default: return 'shadow-glow-subtle';
    }
  };
  
  return (
    <div 
      className={`relative flex flex-col h-full p-4 rounded-lg transform transition-all duration-200 
        hover:shadow-elevated hover:-translate-y-1 premium-card overflow-hidden
        ${status === 'locked' ? 'bg-midnight-elevated text-inactive' : 'bg-midnight-card'}
        ${getBorderColor()} border cursor-pointer`}
      onClick={onClick}
    >
      {/* Rank badge */}
      <div className="absolute top-2 right-2">
        <RankBadge rank={rank} size="sm" />
      </div>
      
      {/* Icon */}
      <div className={`${getIconBg()} w-16 h-16 rounded-full flex items-center justify-center mb-3 ${
        status === 'unlocked' ? getGlowEffect() : ''
      } mx-auto`}>
        {getIcon()}
      </div>
      
      {/* Title */}
      <h3 className={`font-orbitron font-bold text-center mb-2 ${
        status === 'locked' ? 'text-inactive' : 'text-text-primary'
      }`}>
        {title}
      </h3>
      
      {/* Description */}
      <p className={`text-center text-sm mb-3 font-sora ${
        status === 'locked' ? 'text-inactive' : 'text-text-secondary'
      }`}>
        {description}
      </p>
      
      {/* Progress (if available) */}
      {progress && status === 'locked' && (
        <div className="mb-3 w-full">
          <div className="flex justify-between text-xs text-text-tertiary mb-1">
            <span>{progress.current}</span>
            <span>{progress.total}</span>
          </div>
          <Progress 
            value={(progress.current / progress.total) * 100} 
            className="h-1.5 bg-midnight-elevated" 
            indicatorClassName={rank === 'S' || rank === 'A' 
              ? 'bg-achievement' 
              : rank === 'B' 
                ? 'bg-valor' 
                : 'bg-arcane'
            } 
          />
        </div>
      )}
      
      {/* Status badge */}
      <div className="mt-auto flex justify-between items-center">
        <Badge 
          className={`${
            status === 'unlocked' 
              ? 'bg-arcane-15 text-arcane border border-arcane-30 hover:bg-arcane-30' 
              : 'bg-midnight-elevated border border-divider/30 text-inactive hover:bg-midnight-card'
          }`}
        >
          {status === 'locked' && <Lock className="h-3 w-3 mr-1" />}
          {status === 'unlocked' ? 'Desbloqueada' : 'Bloqueada'}
        </Badge>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className={`flex items-center font-space text-sm ${
                status === 'unlocked' 
                  ? 'text-achievement' 
                  : 'text-inactive'
              }`}>
                <span>{points}</span>
                <Star className="h-3 w-3 ml-0.5" />
              </div>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p className="text-xs">{points} ponto{points !== 1 ? 's' : ''} de conquista</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      {/* XP Reward */}
      <div className={`mt-2 font-medium text-xs text-center font-space ${
        status === 'unlocked' 
          ? 'text-achievement' 
          : 'text-inactive'
      }`}>
        +{xpReward} XP
      </div>
    </div>
  );
};

export default AchievementCard;
