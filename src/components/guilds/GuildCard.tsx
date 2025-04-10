
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Trophy, Shield, Users } from 'lucide-react';

interface GuildCardProps {
  guild: {
    id: string;
    name: string;
    description: string;
    avatar: string;
    memberCount: number;
    level: number;
    questCount: number;
    isUserGuildMaster: boolean;
  };
  isUserMember: boolean;
}

const GuildCard: React.FC<GuildCardProps> = ({ guild, isUserMember }) => {
  const navigate = useNavigate();
  
  const handleGuildClick = () => {
    if (isUserMember) {
      navigate(`/guilds/${guild.id}/leaderboard`);
    }
  };
  
  return (
    <Card className="premium-card hover:premium-card-elevated transition-all duration-300">
      <CardContent className="p-4">
        <div className="flex">
          <div className="h-14 w-14 rounded-xl overflow-hidden border border-divider shadow-subtle mr-3">
            <img src={guild.avatar} alt={guild.name} className="h-full w-full object-cover" />
          </div>
          
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-orbitron font-semibold text-text-primary flex items-center">
                  {guild.name}
                  {guild.isUserGuildMaster && (
                    <span className="ml-2 bg-achievement-15 text-achievement text-xs px-2 py-0.5 rounded-full font-space border border-achievement-30">
                      Mestre
                    </span>
                  )}
                </h3>
                <p className="text-sm text-text-secondary font-sora line-clamp-2">{guild.description}</p>
              </div>
            </div>
            
            <div className="flex gap-x-3 mt-2 text-xs">
              <div className="flex items-center text-text-tertiary">
                <Users className="w-3.5 h-3.5 mr-1 text-arcane" />
                <span className="font-space">{guild.memberCount}</span>
              </div>
              
              <div className="flex items-center text-text-tertiary">
                <Trophy className="w-3.5 h-3.5 mr-1 text-achievement" />
                <span className="font-space">Nível {guild.level}</span>
              </div>
              
              <div className="flex items-center text-text-tertiary">
                <Shield className="w-3.5 h-3.5 mr-1 text-arcane" />
                <span className="font-space">{guild.questCount} missões</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-3 flex justify-end">
          {isUserMember ? (
            <Button 
              onClick={handleGuildClick} 
              className="text-sm bg-midnight-elevated hover:bg-arcane-15 text-text-primary border border-arcane-30"
              size="sm"
            >
              Visitar <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          ) : (
            <Button 
              className="text-sm bg-arcane hover:bg-arcane-60 text-text-primary shadow-glow-subtle"
              size="sm"
            >
              Juntar-se <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default GuildCard;
