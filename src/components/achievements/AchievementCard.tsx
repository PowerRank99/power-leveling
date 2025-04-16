
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Star } from 'lucide-react';

interface AchievementCardProps {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  icon: React.ReactNode;
  iconBg: string;
  status: 'locked' | 'unlocked';
  rarity?: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
}

const AchievementCard: React.FC<AchievementCardProps> = ({
  id,
  title,
  description,
  xpReward,
  icon,
  iconBg,
  status,
  rarity = 'common'
}) => {
  // Map rarity to visual elements
  const rarityMap = {
    common: { color: 'text-text-secondary', bg: 'bg-midnight-card', border: 'border-divider/30' },
    uncommon: { color: 'text-arcane', bg: 'bg-arcane-15', border: 'border-arcane-30' },
    rare: { color: 'text-arcane-60', bg: 'bg-arcane-15', border: 'border-arcane-30' },
    epic: { color: 'text-valor', bg: 'bg-valor-15', border: 'border-valor-30' },
    legendary: { color: 'text-achievement', bg: 'bg-achievement-15', border: 'border-achievement-30' }
  };

  const rarityStyles = rarityMap[rarity];
  
  return (
    <div 
      className={`relative flex flex-col items-center p-4 rounded-lg transform transition-all duration-200 hover:shadow-glow-subtle hover:-translate-y-1 ${
        status === 'locked' 
          ? 'bg-midnight-elevated text-inactive' 
          : 'bg-midnight-card'
      } ${rarityStyles.border} border premium-card overflow-hidden`}
    >
      {/* Rarity indicator */}
      {rarity !== 'common' && (
        <div className="absolute top-2 right-2">
          <div className="flex items-center">
            {rarity === 'legendary' && Array(5).fill(0).map((_, i) => (
              <Star key={i} className="h-3 w-3 text-achievement fill-achievement" />
            ))}
            {rarity === 'epic' && Array(4).fill(0).map((_, i) => (
              <Star key={i} className="h-3 w-3 text-valor fill-valor" />
            ))}
            {rarity === 'rare' && Array(3).fill(0).map((_, i) => (
              <Star key={i} className="h-3 w-3 text-arcane-60 fill-arcane-60" />
            ))}
            {rarity === 'uncommon' && Array(2).fill(0).map((_, i) => (
              <Star key={i} className="h-3 w-3 text-arcane fill-arcane" />
            ))}
          </div>
        </div>
      )}
      
      <div className={`${iconBg} w-16 h-16 rounded-full flex items-center justify-center mb-3 ${
        status === 'unlocked' && rarity !== 'common' ? 'shadow-glow-purple' : ''
      }`}>
        {icon}
      </div>
      
      <h3 className={`font-orbitron font-bold text-center mb-2 ${
        status === 'locked' ? 'text-inactive' : rarityStyles.color
      }`}>
        {title}
      </h3>
      
      <p className={`text-center text-sm mb-3 font-sora ${
        status === 'locked' ? 'text-inactive' : 'text-text-secondary'
      }`}>
        {description}
      </p>
      
      <div className="mt-auto">
        <Badge 
          className={`${
            status === 'unlocked' 
              ? 'bg-arcane-15 text-arcane border border-arcane-30 hover:bg-arcane-30' 
              : 'bg-midnight-elevated border border-divider/30 text-inactive hover:bg-midnight-card'
          }`}
        >
          {status === 'unlocked' ? 'Desbloqueada' : 'Bloqueada'}
        </Badge>
      </div>
      
      <div className={`mt-2 font-medium text-sm font-space ${
        status === 'unlocked' 
          ? 'text-achievement shadow-glow-gold' 
          : 'text-inactive'
      }`}>
        +{xpReward} XP
      </div>
    </div>
  );
};

export default AchievementCard;
