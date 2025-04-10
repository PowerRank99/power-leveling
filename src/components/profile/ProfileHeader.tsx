
import React from 'react';
import { Award, Sparkles, Shield } from 'lucide-react';
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
  const isHighLevel = level >= 10;
  
  return (
    <div className="relative p-6 rounded-xl shadow-md overflow-hidden card-glass bg-card">
      {/* Refined background with subtle gradients and overlays */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-arcane-purple-15 to-valor-crimson-60/10 opacity-50"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-bg-deep/50 to-transparent"></div>
      </div>
      
      {/* Subtle ambient glows */}
      <div className="absolute inset-0 opacity-10 z-0">
        <div className="absolute w-32 h-32 bg-arcane-purple rounded-full blur-xl -top-10 -left-10"></div>
        <div className="absolute w-40 h-40 bg-xp-gold rounded-full blur-xl -bottom-20 -right-10"></div>
      </div>
      
      {/* Very subtle particle effects for high-level players */}
      {isHighLevel && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          {[...Array(3)].map((_, i) => (
            <div 
              key={i}
              className="absolute w-0.5 h-0.5 bg-xp-gold rounded-full opacity-40"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDuration: `${2 + Math.random() * 2}s`,
                animationDelay: `${Math.random() * 2}s`
              }}
            ></div>
          ))}
        </div>
      )}
      
      <div className="flex items-center relative z-10">
        <div className="relative">
          <div className={`absolute inset-0 rounded-full ${isHighLevel ? 'opacity-40' : 'opacity-0'}`} 
               style={{boxShadow: isHighLevel ? 'var(--glow-gold)' : 'none'}}></div>
          <Avatar className="h-20 w-20 border-2 border-arcane-purple-30 shadow-subtle">
            <AvatarImage src={avatar} alt={name} />
            <AvatarFallback className="font-orbitron text-lg bg-arcane-muted">{name.charAt(0)}</AvatarFallback>
          </Avatar>
          
          {/* Refined Level Badge */}
          <div className="absolute -bottom-1 -right-1 bg-gradient-to-br from-valor-crimson-60/90 to-xp-gold-60/90 text-ghost-white-95 text-xs font-ibm-plex font-medium px-1.5 py-0.5 rounded-full flex items-center shadow-md">
            <Award className="w-3 h-3 mr-0.5" /> {level}
          </div>
        </div>
        
        <div className="ml-4 flex-1">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-orbitron font-bold tracking-wide text-ghost-white-95">{name}</h2>
              <p className="text-ghost-white-50 text-xs font-sora">@{username}</p>
            </div>
          </div>
          
          {/* Class Button */}
          <div className="mt-2 mb-4">
            <Button 
              className="bg-bg-card-alt/40 text-ghost-white-90 rounded-full text-xs flex items-center gap-1 px-3 py-1 h-auto shadow-subtle backdrop-blur-sm hover:bg-bg-card-elevated/60 transition-premium border border-arcane-purple-30"
            >
              <Trophy className="w-3.5 h-3.5" /> <span className="font-orbitron tracking-wide">{className}</span>
            </Button>
          </div>
          
          {/* Level Progress */}
          <div className="mb-1 flex justify-between text-xs font-ibm-plex">
            <span className="flex items-center">
              <Badge 
                variant="outline" 
                className={`bg-card-alt/20 border-arcane-purple-30 text-ghost-white-90 mr-2 font-orbitron text-xs ${isHighLevel ? 'opacity-90' : 'opacity-80'}`}
              >
                <Shield className="w-3 h-3 mr-1" /> Nível {level}
              </Badge>
              {level % 5 === 0 && (
                <Badge className="bg-xp-gold-60/90 text-bg-deep font-sora text-xs">
                  <Sparkles className="w-2.5 h-2.5 mr-1" /> Milestone
                </Badge>
              )}
            </span>
            <span className="font-medium tracking-wider text-ghost-white-90">{currentXP}/{nextLevelXP}</span>
          </div>
          <Progress 
            value={levelProgress} 
            className="h-1.5 bg-white/10" 
            indicatorColor="bg-gradient-to-r from-valor-crimson-60/90 to-xp-gold-60/90"
            showAnimation={levelProgress > 80}
          />
        </div>
      </div>
      
      {/* Stats */}
      <div className="flex justify-between mt-5 px-4 py-3 bg-card-alt/40 rounded-lg backdrop-blur-sm border border-divider shadow-subtle">
        <StatCard 
          icon={<div className="text-base font-ibm-plex font-medium opacity-90">{workoutsCount}</div>}
          value=""
          label="Treinos"
          light
          animateValue={workoutsCount > 10}
          color="energy"
        />
        
        <div className="h-8 w-px bg-white/5 my-auto"></div>
        
        <StatCard 
          icon={<div className="text-base font-ibm-plex font-medium opacity-90">#{ranking}</div>}
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
