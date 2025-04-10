
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
    <div className="bg-gradient-to-r from-arcane to-valor p-4 border-b border-arcane-30 shadow-glow-subtle">
      <div className="flex items-center">
        <div className="h-16 w-16 rounded-lg overflow-hidden mr-4 shadow-glow-purple border-2 border-arcane-30 transform hover:scale-105 transition-all duration-300">
          <img src={guildInfo.avatar} alt={guildInfo.name} className="h-full w-full object-cover" />
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold font-orbitron text-text-primary flex items-center tracking-wider">
            {guildInfo.name}
          </h2>
          <div className="flex text-sm text-text-secondary mt-1 flex-wrap gap-x-4 font-sora">
            <div className="flex items-center bg-midnight-elevated/30 backdrop-blur-sm px-2 py-1 rounded-full border border-white/10">
              <UsersIcon className="w-4 h-4 mr-1" />
              <span className="font-space">{guildInfo.memberCount} membros</span>
            </div>
            <div className="flex items-center bg-midnight-elevated/30 backdrop-blur-sm px-2 py-1 rounded-full border border-white/10">
              <Trophy className="w-4 h-4 mr-1 text-achievement" />
              <span className="font-space">{guildInfo.completedQuests} quests completas</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex mt-4 gap-2">
        <Button 
          onClick={handleQuestsClick}
          className="flex-1 bg-midnight-elevated hover:bg-arcane-15 text-text-primary border border-arcane-30 rounded-md text-sm h-9 font-sora shadow-glow-subtle hover:shadow-glow-purple transition-all duration-300"
        >
          <Compass className="w-4 h-4 mr-1" />
          Ver Quests
        </Button>
        
        {guildInfo.isUserGuildMaster && (
          <Button
            variant="outline"
            className="flex-1 bg-midnight-elevated hover:bg-arcane-15 text-text-primary border border-arcane-30 rounded-md text-sm h-9 font-sora shadow-glow-subtle hover:shadow-glow-purple transition-all duration-300"
          >
            <Shield className="w-4 h-4 mr-1" />
            Gerenciar Guilda
          </Button>
        )}
      </div>
    </div>
  );
};

export default GuildHeader;
