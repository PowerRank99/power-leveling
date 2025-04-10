
import React from 'react';
import { Award, Trophy, Info, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import StatCard from '@/components/profile/StatCard';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import XPProgressBar from '@/components/profile/XPProgressBar';

interface ProfileHeaderProps {
  avatar: string;
  name: string;
  username: string;
  level: number;
  className: string;
  workoutsCount: number;
  ranking: number;
  currentXP: number;
  nextLevelXP: number;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  avatar,
  name,
  username,
  level,
  className,
  workoutsCount,
  ranking,
  currentXP,
  nextLevelXP
}) => {
  const isTopRanking = ranking <= 10;
  
  return (
    <div className="bg-gradient-to-b from-midnight-deep to-midnight-base text-text-primary p-6 relative rounded-b-xl shadow-elevated">
      <div className="flex items-center">
        <div className="relative">
          <Avatar className="h-24 w-24 profile-avatar">
            <AvatarImage src={avatar} alt={name} />
            <AvatarFallback className="bg-midnight-elevated text-arcane orbitron-text">{name.charAt(0)}</AvatarFallback>
          </Avatar>
          
          {/* Level Badge */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="absolute -bottom-2 -right-2 level-badge px-2 py-1 rounded-full flex items-center">
                  <Award className="w-3 h-3 mr-1 text-arcane" /> 
                  <span className="font-space font-bold text-xs text-arcane">{level}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p className="text-xs font-sora">Nível de Aventureiro</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        
        <div className="ml-4 flex-1">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl profile-name">{name}</h2>
              <p className="text-text-tertiary text-sm">@{username}</p>
            </div>
          </div>
          
          {/* Class Button */}
          <div className="mt-2 mb-4">
            <Button 
              className="bg-arcane-15 hover:bg-arcane-30 text-text-primary rounded-full text-sm flex items-center gap-1 px-3 py-1 h-auto shadow-subtle backdrop-blur-sm border border-arcane-30 transition-all duration-300 hover:shadow-glow-purple"
            >
              <Trophy className="w-4 h-4 text-arcane" /> <span className="font-space">{className}</span>
            </Button>
          </div>
          
          {/* Level Progress */}
          <XPProgressBar
            current={currentXP}
            total={nextLevelXP}
            label={`Nível ${level}`}
            showXpRemaining={true}
            nextLevel={level + 1}
          />
        </div>
      </div>
      
      {/* Stats */}
      <div className="flex justify-between mt-6 px-4 py-3 metric-container">
        <div className="flex flex-col items-center">
          <span className="text-xs font-sora text-text-tertiary mb-1">Treinos Realizados</span>
          <div className="text-lg flex items-center font-bold font-space text-text-primary">
            <Calendar className="w-4 h-4 mr-1 text-valor" />
            {workoutsCount}
          </div>
          <span className="text-xs text-text-tertiary mt-1 font-sora">Média semanal: 2 treinos</span>
        </div>
        
        <div className="h-10 w-px bg-divider my-auto"></div>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <StatCard 
                  icon={
                    <div className={`text-lg font-bold font-space ${isTopRanking ? 'text-achievement shadow-glow-gold' : 'text-arcane-60'}`}>
                      #{ranking}
                    </div>
                  }
                  value=""
                  label={
                    <div className="flex items-center">
                      Ranking
                      <Info className="w-3 h-3 ml-1 text-text-tertiary" />
                    </div>
                  }
                  light
                />
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p className="text-xs font-sora">Ranking semanal baseado em XP total</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
};

export default ProfileHeader;
