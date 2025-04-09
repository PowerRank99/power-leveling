
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { UsersIcon, Trophy, Compass, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface GuildInfo {
  name: string;
  avatar: string;
  memberCount: number;
  activeMemberCount?: number;
  level: number;
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
    <div className="bg-gradient-to-r from-fitblue to-blue-500 text-white p-4">
      <div className="flex items-center">
        <div className="h-16 w-16 rounded-lg overflow-hidden mr-4 shadow-md border-2 border-white/30">
          <img src={guildInfo.avatar} alt={guildInfo.name} className="h-full w-full object-cover" />
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold flex items-center">
            {guildInfo.name}
            <Badge className="ml-2 bg-yellow-500/80 text-white text-xs">Nível {guildInfo.level}</Badge>
          </h2>
          <div className="flex text-sm text-white/80 mt-1 flex-wrap gap-x-4">
            <div className="flex items-center">
              <UsersIcon className="w-4 h-4 mr-1" />
              <span>{guildInfo.memberCount} membros</span>
            </div>
            <div className="flex items-center">
              <Trophy className="w-4 h-4 mr-1 text-yellow-300" />
              <span>{guildInfo.completedQuests} missões completadas</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex mt-4 gap-2">
        <Button 
          onClick={handleQuestsClick}
          className="flex-1 bg-white/15 hover:bg-white/25 text-white border border-white/30 backdrop-blur-sm rounded-full text-sm h-9"
        >
          <Compass className="w-4 h-4 mr-1" />
          Ver Missões
        </Button>
        
        {guildInfo.isUserGuildMaster && (
          <Button
            variant="outline"
            className="flex-1 bg-white/15 hover:bg-white/25 text-white border border-white/30 backdrop-blur-sm rounded-full text-sm h-9"
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
