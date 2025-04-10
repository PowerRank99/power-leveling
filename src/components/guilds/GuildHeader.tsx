
import React from 'react';
import { Button } from '@/components/ui/button';
import { UsersIcon, Trophy, Compass, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface GuildInfo {
  name: string;
  avatar: string;
  memberCount: number;
  activeMemberCount?: number;
  completedQuests: number;
  isUserGuildMaster?: boolean;
}

interface GuildHeaderProps {
  guildInfo: GuildInfo;
  guildId: string;
}

const GuildHeader: React.FC<GuildHeaderProps> = ({ guildInfo, guildId }) => {
  const navigate = useNavigate();

  const handleQuestsClick = () => {
    navigate(`/guilds/${guildId}/quests`);
  };

  return (
    <div className="bg-gradient-to-r from-arcane to-valor p-5 border-b border-arcane-30 shadow-glow-purple">
      <div className="flex items-center">
        <div className="h-18 w-18 rounded-lg overflow-hidden mr-5 shadow-glow-purple border-2 border-arcane-30 transform hover:scale-105 transition-all duration-300">
          <img src={guildInfo.avatar} alt={guildInfo.name} className="h-full w-full object-cover" />
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold font-orbitron text-text-primary flex items-center tracking-wider mb-1">
            {guildInfo.name}
          </h2>
          <div className="flex text-sm text-text-secondary mt-2 flex-wrap gap-x-4 font-sora">
            <div className="flex items-center bg-midnight-elevated/40 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/10 shadow-glow-subtle">
              <UsersIcon className="w-4 h-4 mr-2 text-arcane" />
              <span className="font-space">{guildInfo.memberCount} membros</span>
            </div>
            <div className="flex items-center bg-midnight-elevated/40 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/10 shadow-glow-subtle">
              <Trophy className="w-4 h-4 mr-2 text-achievement" />
              <span className="font-space">{guildInfo.completedQuests} quests completas</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex mt-5 gap-3">
        <Button 
          onClick={handleQuestsClick}
          className="flex-1 bg-midnight-elevated hover:bg-arcane-15 text-text-primary border border-arcane-30 rounded-md text-sm h-10 font-sora shadow-glow-subtle hover:shadow-glow-purple transition-all duration-300 gap-2"
        >
          <Compass className="w-4 h-4" />
          Ver Quests
        </Button>
        
        {guildInfo.isUserGuildMaster && (
          <Button
            variant="outline"
            className="flex-1 bg-midnight-elevated hover:bg-arcane-15 text-text-primary border border-arcane-30 rounded-md text-sm h-10 font-sora shadow-glow-subtle hover:shadow-glow-purple transition-all duration-300 gap-2"
          >
            <Shield className="w-4 h-4" />
            Gerenciar Guilda
          </Button>
        )}
      </div>
    </div>
  );
};

export default GuildHeader;
