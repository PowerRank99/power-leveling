
import React from 'react';
import { Calendar, Clock, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import XPProgressBar from '@/components/profile/XPProgressBar';

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
    <Card className="rpg-panel mb-6 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-arcane/5 to-energy/5 opacity-20"></div>
      
      <CardHeader className="px-4 py-3 flex flex-row items-center">
        <TrendingUp className="w-5 h-5 text-energy mr-2" />
        <CardTitle className="text-lg">Progresso</CardTitle>
      </CardHeader>
      
      <CardContent className="p-4 relative z-10">
        <XPProgressBar 
          current={dailyXP} 
          total={dailyXPCap} 
          label="XP Diário" 
          className="bg-xpgold" 
        />
        
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="p-3 rounded-lg flex items-center border border-arcane/10 bg-midnight-100/40">
            <div className="mr-3 w-8 h-8 rounded-full bg-arcane/20 flex items-center justify-center">
              <Clock className="w-4 h-4 text-arcane-400" />
            </div>
            <div>
              <p className="text-xs text-ghost-500">Última Atividade</p>
              <p className="font-medium text-ghost">{lastActivity}</p>
            </div>
          </div>
          
          <div className="p-3 rounded-lg flex items-center border border-arcane/10 bg-midnight-100/40">
            <div className="mr-3 w-8 h-8 rounded-full bg-xpgold/20 flex items-center justify-center">
              <Calendar className="w-4 h-4 text-xpgold" />
            </div>
            <div>
              <p className="text-xs text-ghost-500">Próxima Sessão</p>
              <p className="font-medium text-ghost font-mono">{xpGain}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileProgressSection;
