
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UsersIcon, Crown, BarChart2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Guild {
  id: string;
  name: string;
  description: string;
  avatar: string;
  memberCount: number;
  level: number;
  questCount: number;
  isUserGuildMaster: boolean;
}

interface GuildCardProps {
  guild: Guild;
  isUserMember: boolean;
}

const GuildCard: React.FC<GuildCardProps> = ({ guild, isUserMember }) => {
  const navigate = useNavigate();
  
  const handleCardClick = () => {
    navigate(`/guilds/${guild.id}/leaderboard`);
  };
  
  const handleJoinGuild = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    console.log(`Join guild: ${guild.id}`);
    // Add join guild logic here
  };
  
  return (
    <Card 
      className={`overflow-hidden ${isUserMember ? 'border-gray-200' : 'border-gray-100'} hover:shadow-md transition-shadow cursor-pointer`}
      onClick={handleCardClick}
    >
      <div className="flex p-4">
        <div className="h-16 w-16 rounded-lg overflow-hidden mr-4 flex-shrink-0">
          <img 
            src={guild.avatar} 
            alt={guild.name} 
            className="h-full w-full object-cover"
          />
        </div>
        
        <div className="flex-grow">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-bold text-lg">{guild.name}</h3>
              <p className="text-sm text-gray-500 line-clamp-1">{guild.description}</p>
            </div>
            
            {!isUserMember && (
              <Button 
                size="sm" 
                className="bg-fitblue text-white rounded-full px-4"
                onClick={handleJoinGuild}
              >
                Entrar
              </Button>
            )}
          </div>
          
          <div className="flex flex-wrap mt-2 gap-3">
            <div className="flex items-center text-sm text-gray-600">
              <UsersIcon className="h-4 w-4 mr-1" />
              <span>{guild.memberCount}</span>
            </div>
            
            <div className="flex items-center text-sm text-gray-600">
              <Crown className="h-4 w-4 mr-1 text-yellow-500" />
              <span>Nível {guild.level}</span>
            </div>
            
            {guild.questCount > 0 && (
              <Badge variant="secondary" className="flex items-center px-2 py-1 bg-blue-50 text-fitblue">
                <BarChart2 className="h-3 w-3 mr-1" />
                <span>{guild.questCount} {guild.questCount === 1 ? 'missão ativa' : 'missões ativas'}</span>
              </Badge>
            )}
            
            {guild.isUserGuildMaster && (
              <Badge className="bg-purple-100 text-purple-700 border-purple-200">
                Mestre da Guilda
              </Badge>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default GuildCard;
