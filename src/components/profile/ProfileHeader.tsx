
import React from 'react';
import { Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Trophy from '@/components/icons/Trophy';
import StatCard from '@/components/profile/StatCard';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

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
    <div className="bg-gradient-to-b from-midnight-deep to-midnight-base text-text-primary p-6 relative rounded-b-xl shadow-elevated">
      <div className="flex items-center">
        <div className="relative">
          <Avatar className="h-24 w-24 profile-avatar">
            <AvatarImage src={avatar} alt={name} />
            <AvatarFallback className="bg-midnight-elevated text-arcane font-orbitron">{name.charAt(0)}</AvatarFallback>
          </Avatar>
          
          {/* Level Badge */}
          <div className="absolute -bottom-2 -right-2 level-badge px-2 py-1 rounded-full flex items-center">
            <Award className="w-3 h-3 mr-1 text-arcane" /> 
            <span className="font-space font-bold text-xs text-arcane">{level}</span>
          </div>
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
          <div className="mb-1 flex justify-between text-xs">
            <span className="text-text-tertiary font-sora">Nível {level}</span>
            <span className="font-space font-medium text-arcane-60">{currentXP}/{nextLevelXP} XP</span>
          </div>
          <div className="h-1.5 bg-divider rounded-full overflow-hidden">
            <div className="progress-bar-fill h-full bg-gradient-to-r from-arcane-60 to-valor-60 rounded-full transition-all duration-500" 
                 style={{ width: `${levelProgress}%` }}></div>
          </div>
        </div>
      </div>
      
      {/* Stats */}
      <div className="flex justify-between mt-6 px-4 py-3 metric-container">
        <StatCard 
          icon={<div className="text-lg font-bold font-space text-text-primary">{workoutsCount}</div>}
          value=""
          label="Treinos"
          light
        />
        
        <div className="h-10 w-px bg-divider my-auto"></div>
        
        <StatCard 
          icon={<div className="text-lg font-bold font-space text-achievement shadow-glow-gold">#{ranking}</div>}
          value=""
          label="Ranking"
          light
        />
      </div>
    </div>
  );
};

export default ProfileHeader;
