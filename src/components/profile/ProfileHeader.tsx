
import React from 'react';
import { Award, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Trophy from '@/components/icons/Trophy';
import StatCard from '@/components/profile/StatCard';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';

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
    <div className="bg-gradient-arcane-valor text-ghost p-6 relative rounded-xl shadow-lg mb-6 overflow-hidden">
      <div className="absolute inset-0 bg-shimmer-gold bg-[length:200%_100%] animate-shimmer opacity-20"></div>
      <div className="flex items-center relative z-10">
        <div className="relative">
          <Avatar className="h-24 w-24 border-4 border-ghost/20 shadow-md">
            <AvatarImage src={avatar} alt={name} />
            <AvatarFallback className="bg-arcane-700">{name.charAt(0)}</AvatarFallback>
          </Avatar>
          
          {/* Level Badge */}
          <div className="absolute -bottom-2 -right-2 bg-gradient-to-br from-arcane to-arcane-700 text-ghost text-xs font-bold px-2 py-1 rounded-full flex items-center shadow-glow">
            <Award className="w-3 h-3 mr-1 text-xpgold" /> <span className="font-mono">{level}</span>
          </div>
        </div>
        
        <div className="ml-4 flex-1">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-display tracking-wider">{name}</h2>
              <p className="text-ghost-300 text-sm font-mono">@{username}</p>
            </div>
          </div>
          
          {/* Class Button */}
          <div className="mt-2 mb-4">
            <Button 
              className="bg-black/20 text-ghost rounded-full text-sm flex items-center gap-1 px-3 py-1 h-auto shadow-sm backdrop-blur-sm hover:bg-black/30"
            >
              <Trophy className="w-4 h-4 text-xpgold" /> <span className="font-display tracking-wide">{className}</span>
            </Button>
          </div>
          
          {/* Level Progress */}
          <div className="mb-1 flex justify-between text-xs font-mono">
            <span>Nível {level}</span>
            <span className="text-xpgold">{currentXP}/{nextLevelXP} XP</span>
          </div>
          <Progress value={levelProgress} className="h-2 bg-black/30" 
            indicatorColor="bg-xpgold" />
        </div>
      </div>
      
      {/* Stats */}
      <div className="flex justify-between mt-6 px-4 py-3 bg-black/20 rounded-lg backdrop-blur-sm">
        <StatCard 
          icon={<div className="text-lg font-bold font-mono text-xpgold">{workoutsCount}</div>}
          value=""
          label="Treinos"
          light
        />
        
        <div className="h-10 w-px bg-ghost/20 my-auto"></div>
        
        <StatCard 
          icon={<div className="text-lg font-bold font-mono text-xpgold">#{ranking}</div>}
          value=""
          label="Ranking"
          light
        />
      </div>
    </div>
  );
};

export default ProfileHeader;
