
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Trophy, Shield, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

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
    <Card className="premium-card hover:premium-card-elevated transition-all duration-300 transform hover:scale-[1.02] p-1 shadow-inner bg-gradient-to-br from-midnight-card to-midnight-elevated">
      <CardContent className="p-5">
        <div className="flex">
          <div className="h-16 w-16 rounded-xl overflow-hidden border border-arcane-30 shadow-glow-purple mr-4">
            <img src={guild.avatar} alt={guild.name} className="h-full w-full object-cover" />
          </div>
          
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-orbitron font-semibold text-text-primary flex items-center tracking-wider text-base leading-tight mb-1">
                  {guild.name}
                  {guild.isUserGuildMaster && (
                    <Badge variant="master" className="ml-2 px-2 py-0.5 text-xs">
                      Mestre
                    </Badge>
                  )}
                </h3>
                <p className="text-sm text-text-secondary font-sora line-clamp-2 leading-snug">{guild.description}</p>
              </div>
            </div>
            
            <div className="flex gap-x-3 mt-3 text-xs">
              <div className="flex items-center text-text-secondary bg-midnight-elevated/70 px-2.5 py-1.5 rounded-full border border-divider/30 shadow-subtle">
                <Users className="w-3.5 h-3.5 mr-1.5 text-arcane" />
                <span className="font-space">{guild.memberCount}</span>
              </div>
              
              <div className="flex items-center text-text-secondary bg-midnight-elevated/70 px-2.5 py-1.5 rounded-full border border-divider/30 shadow-subtle">
                <Trophy className="w-3.5 h-3.5 mr-1.5 text-achievement" />
                <span className="font-space">Nível {guild.level}</span>
              </div>
              
              <div className="flex items-center text-text-secondary bg-midnight-elevated/70 px-2.5 py-1.5 rounded-full border border-divider/30 shadow-subtle">
                <Shield className="w-3.5 h-3.5 mr-1.5 text-arcane" />
                <span className="font-space">{guild.questCount} missões</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-4 flex justify-end">
          {isUserMember ? (
            <Button 
              onClick={handleGuildClick} 
              className="text-sm bg-midnight-elevated hover:bg-arcane-15 text-text-primary border border-arcane-30 shadow-glow-subtle transition-all duration-300 hover:shadow-glow-purple group"
              size="sm"
            >
              Visitar 
              <ArrowRight className="w-3.5 h-3.5 ml-1 transition-transform duration-300 group-hover:translate-x-1" />
            </Button>
          ) : (
            <Button 
              className="text-sm bg-arcane hover:bg-arcane-60 text-text-primary shadow-glow-subtle transition-all duration-300 hover:shadow-glow-purple group"
              size="sm"
            >
              Juntar-se
              <ArrowRight className="w-3.5 h-3.5 ml-1 transition-transform duration-300 group-hover:translate-x-1" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default GuildCard;
