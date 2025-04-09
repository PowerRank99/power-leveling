
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
  const levelProgress = Math.min(Math.round((currentXP / nextLevelXP) * 100), 100);
  const dailyProgress = Math.min(Math.round((dailyXP / dailyXPCap) * 100), 100);
  
  return (
    <div className="bg-white p-5 mt-3 rounded-xl shadow-sm">
      <div className="mb-5">
        <div className="flex justify-between mb-1">
          <span className="text-sm font-medium text-gray-700">Nível {level}</span>
          <span className="text-sm font-medium">{currentXP}/{nextLevelXP} XP</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2.5">
          <div 
            className="bg-fitblue h-2.5 rounded-full transition-all duration-500" 
            style={{ width: `${levelProgress}%` }}
          ></div>
        </div>
      </div>
      
      <div className="mb-3">
        <div className="flex justify-between mb-1">
          <span className="text-sm font-medium text-gray-700">XP do Dia</span>
          <span className="text-sm font-medium">{dailyXP}/{dailyXPCap}</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2.5">
          <div 
            className="bg-fitgreen h-2.5 rounded-full transition-all duration-500" 
            style={{ width: `${dailyProgress}%` }}
          ></div>
        </div>
      </div>
      
      <div className="flex justify-between text-sm mt-3">
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
