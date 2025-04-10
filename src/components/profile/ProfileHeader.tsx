
import React from 'react';
import { Award } from 'lucide-react';
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
    <div className="bg-gradient-to-b from-arcane to-arcane-dark dark:from-midnight dark:to-arcane-dark text-white p-6 relative rounded-b-xl shadow-md">
      <div className="flex items-center">
        <div className="relative">
          <Avatar className="h-24 w-24 border-4 border-white/20 shadow-md">
            <AvatarImage src={avatar} alt={name} />
            <AvatarFallback className="font-cinzel text-xl">{name.charAt(0)}</AvatarFallback>
          </Avatar>
          
          {/* Level Badge */}
          <div className="absolute -bottom-2 -right-2 bg-gradient-crimson-gold text-white text-xs font-ibm-plex font-bold px-2 py-1 rounded-full flex items-center shadow-md animate-glow-pulse">
            <Award className="w-3 h-3 mr-1" /> {level}
          </div>
        </div>
        
        <div className="ml-4 flex-1">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-cinzel font-bold">{name}</h2>
              <p className="text-blue-100 text-sm font-inter">@{username}</p>
            </div>
          </div>
          
          {/* Class Button */}
          <div className="mt-2 mb-4">
            <Button 
              className="bg-white/20 text-white rounded-full text-sm flex items-center gap-1 px-3 py-1 h-auto shadow-sm backdrop-blur-sm hover:bg-white/30 transition-all"
            >
              <Trophy className="w-4 h-4" /> <span className="font-cinzel">{className}</span>
            </Button>
          </div>
          
          {/* Level Progress */}
          <div className="mb-1 flex justify-between text-xs font-ibm-plex">
            <span>Nível {level}</span>
            <span className="font-medium">{currentXP}/{nextLevelXP} XP</span>
          </div>
          <Progress value={levelProgress} className="h-1.5 bg-white/20" 
            indicatorColor="bg-gradient-crimson-gold" />
        </div>
      </div>
      
      {/* Stats */}
      <div className="flex justify-between mt-6 px-4 py-3 bg-white/10 dark:bg-black/20 rounded-lg backdrop-blur-sm card-glass">
        <StatCard 
          icon={<div className="text-lg font-ibm-plex font-bold">{workoutsCount}</div>}
          value=""
          label="Treinos"
          light
        />
        
        <div className="h-10 w-px bg-white/20 my-auto"></div>
        
        <StatCard 
          icon={<div className="text-lg font-ibm-plex font-bold">#{ranking}</div>}
          value=""
          label="Ranking"
          light
        />
      </div>
    </div>
  );
};

export default ProfileHeader;
