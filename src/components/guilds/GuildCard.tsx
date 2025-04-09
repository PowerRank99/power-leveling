
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UsersIcon, Crown, BarChart2, Compass, Shield } from 'lucide-react';
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
  
  const handleQuestsClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    navigate(`/guilds/${guild.id}/quests`);
  };
  
  return (
    <Card 
      className={`overflow-hidden ${isUserMember ? 'border-fitblue border-opacity-30' : 'border-gray-100'} 
        hover:shadow-md transition-all duration-200 cursor-pointer bg-gradient-to-br 
        ${isUserMember ? 'from-blue-50 to-white' : 'from-gray-50 to-white'}`}
      onClick={handleCardClick}
    >
      <div className="flex p-4">
        <div className={`h-16 w-16 rounded-lg overflow-hidden mr-4 flex-shrink-0 
          ${isUserMember ? 'ring-2 ring-fitblue ring-opacity-30' : ''}`}>
          <img 
            src={guild.avatar} 
            alt={guild.name} 
            className="h-full w-full object-cover"
          />
        </div>
        
        <div className="flex-grow">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center">
                <h3 className="font-bold text-lg">{guild.name}</h3>
                {guild.isUserGuildMaster && (
                  <Badge className="ml-2 bg-purple-100 text-purple-700 border-purple-200">
                    <Crown className="h-3 w-3 mr-1" />
                    <span className="text-xs">Master</span>
                  </Badge>
                )}
              </div>
              <p className="text-sm text-gray-500 line-clamp-1">{guild.description}</p>
            </div>
            
            {!isUserMember && (
              <Button 
                size="sm" 
                className="bg-fitblue text-white rounded-full px-4 transition-all hover:bg-fitblue-600"
                onClick={handleJoinGuild}
              >
                <Shield className="h-3.5 w-3.5 mr-1" />
                <span>Join</span>
              </Button>
            )}
            
            {isUserMember && (
              <Button
                size="sm"
                variant="outline"
                className="text-fitblue border-fitblue rounded-full px-4 flex items-center gap-1"
                onClick={handleQuestsClick}
              >
                <Compass className="h-3 w-3" />
                <span>Quests</span>
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
              <span>Level {guild.level}</span>
            </div>
            
            {guild.questCount > 0 && (
              <Badge variant="secondary" className="flex items-center px-2 py-1 bg-blue-50 text-fitblue">
                <BarChart2 className="h-3 w-3 mr-1" />
                <span>{guild.questCount} {guild.questCount === 1 ? 'active quest' : 'active quests'}</span>
              </Badge>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default GuildCard;
