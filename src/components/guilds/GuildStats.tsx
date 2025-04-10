
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { TrendingUp, ChevronDown, ChevronUp, Users, Shield, Award } from 'lucide-react';

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
    <div className="bg-midnight-card border border-divider overflow-hidden transition-all duration-300 rounded-lg shadow-subtle">
      <div 
        className="p-3 flex justify-between items-center cursor-pointer border-b border-divider"
        onClick={toggleStats}
      >
        <h3 className="text-sm font-orbitron text-text-primary flex items-center">
          <TrendingUp className="w-4 h-4 mr-1.5 text-arcane" />
          Estatísticas da Guilda
        </h3>
        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-text-secondary hover:text-text-primary hover:bg-midnight-elevated">
          {showStats ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </div>
      
      {showStats && (
        <div className="p-4 grid grid-cols-2 gap-3 animate-fade-in">
          <div className="bg-midnight-elevated rounded-lg p-3 border border-arcane-15">
            <div className="text-xs text-text-secondary mb-1 font-sora">EXP Semanal</div>
            <div className="text-xl font-bold text-arcane flex items-center font-space">
              {weeklyExp} <TrendingUp className="w-4 h-4 ml-1 text-arcane-60" />
            </div>
          </div>
          
          <div className="bg-midnight-elevated rounded-lg p-3 border border-arcane-15">
            <div className="text-xs text-text-secondary mb-1 font-sora">EXP Total</div>
            <div className="text-xl font-bold text-arcane flex items-center font-space">
              {totalExp}
            </div>
          </div>
          
          <div className="bg-midnight-elevated rounded-lg p-3 border border-arcane-15">
            <div className="text-xs text-text-secondary mb-1 font-sora">Membros Ativos</div>
            <div className="text-xl font-bold text-text-primary flex items-center font-space">
              <Users className="w-4 h-4 mr-1 text-arcane-60" />
              {activeMemberCount}/{memberCount}
            </div>
          </div>
          
          <div className="bg-midnight-elevated rounded-lg p-3 border border-arcane-15">
            <div className="text-xs text-text-secondary mb-1 font-sora">Missões Ativas</div>
            <div className="text-xl font-bold text-achievement flex items-center font-space">
              <Shield className="w-4 h-4 mr-1 text-achievement-60" />
              {activeQuests}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GuildStats;
