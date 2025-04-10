
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
    <div className="bg-gradient-to-r from-arcane-30 to-arcane-15 p-4 border-b border-arcane-30 shadow-glow-subtle">
      <div className="flex items-center">
        <div className="h-16 w-16 rounded-lg overflow-hidden mr-4 shadow-glow-subtle border-2 border-arcane-30">
          <img src={guildInfo.avatar} alt={guildInfo.name} className="h-full w-full object-cover" />
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold font-orbitron text-text-primary flex items-center">
            {guildInfo.name}
          </h2>
          <div className="flex text-sm text-text-secondary mt-1 flex-wrap gap-x-4 font-sora">
            <div className="flex items-center">
              <UsersIcon className="w-4 h-4 mr-1" />
              <span>{guildInfo.memberCount} membros</span>
            </div>
            <div className="flex items-center">
              <Trophy className="w-4 h-4 mr-1 text-achievement" />
              <span>{guildInfo.completedQuests} quests completas</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex mt-4 gap-2">
        <Button 
          onClick={handleQuestsClick}
          className="flex-1 bg-midnight-elevated hover:bg-arcane-15 text-text-primary border border-arcane-30 rounded-md text-sm h-9 font-sora"
        >
          <Compass className="w-4 h-4 mr-1" />
          Ver Quests
        </Button>
        
        {guildInfo.isUserGuildMaster && (
          <Button
            variant="outline"
            className="flex-1 bg-midnight-elevated hover:bg-arcane-15 text-text-primary border border-arcane-30 rounded-md text-sm h-9 font-sora"
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
