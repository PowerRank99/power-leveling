
import React from 'react';
import { Clock } from 'lucide-react';
import XPProgressBar from '@/components/profile/XPProgressBar';

interface ProfileProgressSectionProps {
  level: number;
  currentXP: number;
  nextLevelXP: number;
  dailyXP: number;
  dailyXPCap: number;
  lastActivity: string;
  xpGain: string;
}

const ProfileProgressSection: React.FC<ProfileProgressSectionProps> = ({
  level,
  currentXP,
  nextLevelXP,
  dailyXP,
  dailyXPCap,
  lastActivity,
  xpGain
}) => {
  return (
    <div className="bg-white p-4 mt-2">
      <XPProgressBar
        current={currentXP}
        total={nextLevelXP}
        label={`Nível ${level}`}
      />
      
      <XPProgressBar
        current={dailyXP}
        total={dailyXPCap}
        label="XP do Dia"
        className="bg-fitgreen"
      />
      
      <div className="flex justify-between text-sm mt-2">
        <div className="flex items-center text-gray-500">
          <Clock className="w-4 h-4 mr-1" /> 
          {lastActivity}
        </div>
        
        <div className="text-fitgreen font-medium">
          {xpGain}
        </div>
      </div>
    </div>
  );
};

export default ProfileProgressSection;
