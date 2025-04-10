
import React from 'react';
import { Award, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Trophy from '@/components/icons/Trophy';
import StatCard from '@/components/profile/StatCard';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

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
  const levelProgress = Math.min(Math.round((currentXP / nextLevelXP) * 100), 100);
  
  return (
    <div className="bg-gradient-arcane-valor text-ghostwhite p-6 relative rounded-b-xl shadow-lg card-glass overflow-hidden">
      {/* Animated background patterns */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute w-20 h-20 bg-ghostwhite rounded-full blur-xl top-20 -left-10 animate-pulse"></div>
        <div className="absolute w-32 h-32 bg-xpgold rounded-full blur-xl -bottom-10 -right-10 animate-pulse"></div>
      </div>
      
      <div className="flex items-center relative z-10">
        <div className="relative">
          <Avatar className="h-24 w-24 border-4 border-white/20 shadow-lg">
            <AvatarImage src={avatar} alt={name} />
            <AvatarFallback className="font-orbitron text-xl bg-arcane">{name.charAt(0)}</AvatarFallback>
          </Avatar>
          
          {/* Level Badge */}
          <div className="absolute -bottom-2 -right-2 bg-gradient-valor-xpgold text-ghostwhite text-xs font-space-grotesk font-bold px-2 py-1 rounded-full flex items-center shadow-lg animate-glow-pulse">
            <Award className="w-3 h-3 mr-1" /> {level}
          </div>
        </div>
        
        <div className="ml-4 flex-1">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-orbitron font-bold tracking-wide">{name}</h2>
              <p className="text-blue-100 text-sm font-sora">@{username}</p>
            </div>
          </div>
          
          {/* Class Button */}
          <div className="mt-2 mb-4">
            <Button 
              className="bg-white/20 text-ghostwhite rounded-full text-sm flex items-center gap-1 px-3 py-1 h-auto shadow-md backdrop-blur-md hover:bg-white/30 transition-all"
            >
              <Trophy className="w-4 h-4" /> <span className="font-orbitron tracking-wide">{className}</span>
            </Button>
          </div>
          
          {/* Level Progress */}
          <div className="mb-1 flex justify-between text-xs font-space-grotesk">
            <span className="flex items-center">
              <Badge variant="outline" className="bg-midnight-light/40 border-ghostwhite/20 text-ghostwhite mr-2 font-orbitron">
                Nível {level}
              </Badge>
              {level % 5 === 0 && (
                <Badge className="bg-xpgold text-midnight font-sora font-bold animate-pulse">
                  <Sparkles className="w-3 h-3 mr-1" /> Milestone!
                </Badge>
              )}
            </span>
            <span className="font-medium tracking-wider">{currentXP}/{nextLevelXP} XP</span>
          </div>
          <Progress 
            value={levelProgress} 
            className="h-1.5 bg-white/20" 
            indicatorColor="bg-gradient-valor-xpgold"
            showAnimation={true}
          />
        </div>
      </div>
      
      {/* Stats */}
      <div className="flex justify-between mt-6 px-4 py-3 bg-white/5 dark:bg-black/20 rounded-lg backdrop-blur-md card-glass border border-white/10">
        <StatCard 
          icon={<div className="text-lg font-space-grotesk font-bold">{workoutsCount}</div>}
          value=""
          label="Treinos"
          light
          animateValue={workoutsCount > 10}
          color="energy"
        />
        
        <div className="h-10 w-px bg-white/20 my-auto"></div>
        
        <StatCard 
          icon={<div className="text-lg font-space-grotesk font-bold">#{ranking}</div>}
          value=""
          label="Ranking"
          light
          animateValue={ranking < 10}
          color="xpgold"
        />
      </div>
    </div>
  );
};

export default ProfileHeader;
