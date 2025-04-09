
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Dumbbell, Flame, Users, Award, Star } from 'lucide-react';

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
    common: { color: 'text-gray-600', bg: 'bg-gray-100', border: 'border-gray-200' },
    uncommon: { color: 'text-fitgreen-600', bg: 'bg-fitgreen-50', border: 'border-fitgreen-200' },
    rare: { color: 'text-fitblue-600', bg: 'bg-fitblue-50', border: 'border-fitblue-200' },
    epic: { color: 'text-fitpurple-600', bg: 'bg-fitpurple-50', border: 'border-fitpurple-200' },
    legendary: { color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200' }
  };

  const rarityStyles = rarityMap[rarity];
  
  return (
    <div 
      className={`relative flex flex-col items-center p-4 rounded-lg shadow-sm transform transition-all duration-200 hover:shadow-md hover:-translate-y-1 ${
        status === 'locked' ? 'bg-gray-100' : 'bg-white'
      } ${rarityStyles.border} border overflow-hidden`}
    >
      {/* Rarity indicator */}
      {rarity !== 'common' && (
        <div className="absolute top-2 right-2">
          <div className="flex items-center">
            {rarity === 'legendary' && Array(5).fill(0).map((_, i) => (
              <Star key={i} className="h-3 w-3 text-yellow-500 fill-yellow-500" />
            ))}
            {rarity === 'epic' && Array(4).fill(0).map((_, i) => (
              <Star key={i} className="h-3 w-3 text-fitpurple-500 fill-fitpurple-500" />
            ))}
            {rarity === 'rare' && Array(3).fill(0).map((_, i) => (
              <Star key={i} className="h-3 w-3 text-fitblue-500 fill-fitblue-500" />
            ))}
            {rarity === 'uncommon' && Array(2).fill(0).map((_, i) => (
              <Star key={i} className="h-3 w-3 text-fitgreen-500 fill-fitgreen-500" />
            ))}
          </div>
        </div>
      )}
      
      <div className={`${iconBg} w-16 h-16 rounded-full flex items-center justify-center mb-3`}>
        {icon}
      </div>
      
      <h3 className={`font-bold text-center mb-2 ${
        status === 'locked' ? 'text-gray-500' : rarityStyles.color
      }`}>
        {title}
      </h3>
      
      <p className={`text-center text-sm mb-3 ${
        status === 'locked' ? 'text-gray-400' : 'text-gray-600'
      }`}>
        {description}
      </p>
      
      <div className="mt-auto">
        <Badge 
          variant={status === 'unlocked' ? 'default' : 'outline'}
          className={`${
            status === 'unlocked' 
              ? 'bg-fitgreen-100 text-fitgreen-600 hover:bg-fitgreen-200' 
              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
          }`}
        >
          {status === 'unlocked' ? 'Desbloqueada' : 'Bloqueada'}
        </Badge>
      </div>
      
      <div className={`mt-2 font-medium text-sm ${
        status === 'unlocked' ? 'text-fitgreen-600' : 'text-gray-400'
      }`}>
        +{xpReward} XP
      </div>
    </div>
  );
};

export default AchievementCard;
