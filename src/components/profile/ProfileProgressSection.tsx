
import React from 'react';
import { Clock } from 'lucide-react';
import XPProgressBar from '@/components/profile/XPProgressBar';
import { Card, CardContent } from '@/components/ui/card';

interface ProfileProgressSectionProps {
  dailyXP: number;
  dailyXPCap: number;
  lastActivity: string;
  xpGain: string;
}

const ProfileProgressSection: React.FC<ProfileProgressSectionProps> = ({
  dailyXP,
  dailyXPCap,
  lastActivity,
  xpGain
}) => {
  return (
    <Card className="mt-3 shadow-sm overflow-hidden border-none">
      <CardContent className="p-4">
        <div className="mb-1">
          <h3 className="text-base font-semibold mb-3">Progresso Diário</h3>
          
          <XPProgressBar 
            current={dailyXP}
            total={dailyXPCap}
            label="EXP do Dia"
            className="bg-fitgreen"
          />
        </div>
        
        <div className="flex justify-between text-sm mt-4">
          <div className="flex items-center text-gray-500">
            <Clock className="w-4 h-4 mr-1" /> 
            {lastActivity}
          </div>
          
          <div className="text-fitgreen font-medium">
            {xpGain.replace('XP', 'EXP')}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileProgressSection;
