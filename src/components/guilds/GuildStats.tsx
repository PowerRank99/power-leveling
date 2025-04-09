
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { TrendingUp } from 'lucide-react';

interface GuildStatsProps {
  weeklyExp: number;
  totalExp: number;
  activeMemberCount: number;
  memberCount: number;
  activeQuests: number;
}

const GuildStats: React.FC<GuildStatsProps> = ({
  weeklyExp,
  totalExp,
  activeMemberCount,
  memberCount,
  activeQuests
}) => {
  const [showStats, setShowStats] = useState(true);
  
  const toggleStats = () => {
    setShowStats(!showStats);
  };
  
  return (
    <div className="bg-white border-b border-gray-200 overflow-hidden transition-all duration-300 shadow-sm">
      <div 
        className="p-3 flex justify-between items-center cursor-pointer border-b border-gray-100"
        onClick={toggleStats}
      >
        <h3 className="text-sm font-semibold text-gray-600 flex items-center">
          <TrendingUp className="w-4 h-4 mr-1.5 text-fitblue" />
          Estatísticas da Guilda
        </h3>
        <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
          {showStats ? '−' : '+'}
        </Button>
      </div>
      
      {showStats && (
        <div className="p-4 grid grid-cols-2 gap-3 animate-fade-in">
          <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
            <div className="text-xs text-gray-500 mb-1">EXP Semanal</div>
            <div className="text-xl font-bold text-fitblue flex items-center">
              {weeklyExp} <TrendingUp className="w-4 h-4 ml-1 text-green-500" />
            </div>
          </div>
          
          <div className="bg-purple-50 rounded-lg p-3 border border-purple-100">
            <div className="text-xs text-gray-500 mb-1">EXP Total</div>
            <div className="text-xl font-bold text-purple-600">
              {totalExp}
            </div>
          </div>
          
          <div className="bg-green-50 rounded-lg p-3 border border-green-100">
            <div className="text-xs text-gray-500 mb-1">Membros Ativos</div>
            <div className="text-xl font-bold text-green-600">
              {activeMemberCount}/{memberCount}
            </div>
          </div>
          
          <div className="bg-amber-50 rounded-lg p-3 border border-amber-100">
            <div className="text-xs text-gray-500 mb-1">Missões Ativas</div>
            <div className="text-xl font-bold text-amber-600">
              {activeQuests}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GuildStats;
