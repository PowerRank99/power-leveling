
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Star, Dumbbell, Flame, Trophy, Medal, Clock, BookOpen, UserPlus, Zap, Award } from 'lucide-react';
import { Achievement } from '@/services/rpg/AchievementService';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { RankService } from '@/services/rpg/RankService';

interface AchievementCardProps {
  achievement: Achievement;
}

const AchievementCard: React.FC<AchievementCardProps> = ({ achievement }) => {
  // Map icon name to icon component
  const getIconComponent = (iconName: string) => {
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
      default:
        return <Award className="h-6 w-6 text-arcane" />;
    }
  };
  
  // Map achievement rank to styles
  const getRankStyles = (rank: string) => {
    const colorClass = RankService.getRankColorClass(rank);
    let bgClass = 'bg-arcane-15';
    let borderClass = 'border-arcane-30';
    
    switch (rank) {
      case 'S':
        bgClass = 'bg-achievement-15';
        borderClass = 'border-achievement-30';
        break;
      case 'A':
        bgClass = 'bg-achievement-15';
        borderClass = 'border-achievement-30';
        break;
      case 'B':
        bgClass = 'bg-valor-15';
        borderClass = 'border-valor-30';
        break;
      case 'C':
        bgClass = 'bg-valor-15';
        borderClass = 'border-valor-30';
        break;
      case 'D':
        bgClass = 'bg-arcane-15';
        borderClass = 'border-arcane-30';
        break;
      case 'E':
        bgClass = 'bg-arcane-15';
        borderClass = 'border-arcane-30';
        break;
      default:
        bgClass = 'bg-midnight-elevated';
        borderClass = 'border-divider/30';
    }
    
    return { colorClass, bgClass, borderClass };
  };
  
  // Get rank stars based on achievement rank
  const getRankStars = (rank: string) => {
    const starsMap = {
      'S': 5,
      'A': 4,
      'B': 3,
      'C': 2,
      'D': 1,
      'E': 0,
      'Unranked': 0
    };
    
    return starsMap[rank] || 0;
  };
  
  const { colorClass, bgClass, borderClass } = getRankStyles(achievement.rank);
  const rankStars = getRankStars(achievement.rank);
  const isLocked = !achievement.unlocked;
  
  return (
    <div 
      className={`relative flex flex-col items-center p-4 rounded-lg transform transition-all duration-200 hover:shadow-glow-subtle hover:-translate-y-1 ${
        isLocked 
          ? 'bg-midnight-elevated text-inactive' 
          : 'bg-midnight-card'
      } ${borderClass} border premium-card overflow-hidden`}
    >
      {/* Rank indicator */}
      {rankStars > 0 && (
        <div className="absolute top-2 right-2">
          <div className="flex items-center">
            {Array(rankStars).fill(0).map((_, i) => (
              <Star 
                key={i} 
                className={`h-3 w-3 ${
                  isLocked ? 'text-inactive' : colorClass
                } ${
                  isLocked ? '' : 'fill-current'
                }`} 
              />
            ))}
          </div>
        </div>
      )}
      
      <div className={`${bgClass} w-16 h-16 rounded-full flex items-center justify-center mb-3 ${
        !isLocked && achievement.rank !== 'Unranked' ? 'shadow-glow-purple' : ''
      }`}>
        {getIconComponent(achievement.icon_name)}
      </div>
      
      <h3 className={`font-orbitron font-bold text-center mb-2 ${
        isLocked ? 'text-inactive' : colorClass
      }`}>
        {achievement.name}
      </h3>
      
      <p className={`text-center text-sm mb-3 font-sora ${
        isLocked ? 'text-inactive' : 'text-text-secondary'
      }`}>
        {achievement.description}
      </p>
      
      <div className="mt-auto">
        <Badge 
          className={`${
            !isLocked 
              ? 'bg-arcane-15 text-arcane border border-arcane-30 hover:bg-arcane-30' 
              : 'bg-midnight-elevated border border-divider/30 text-inactive hover:bg-midnight-card'
          }`}
        >
          {!isLocked ? 'Desbloqueada' : 'Bloqueada'}
        </Badge>
      </div>
      
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={`mt-2 font-medium text-sm font-space ${
              !isLocked 
                ? 'text-achievement shadow-glow-gold' 
                : 'text-inactive'
            }`}>
              +{achievement.xp_reward} XP
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs">+{achievement.points} pontos de conquista</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default AchievementCard;
