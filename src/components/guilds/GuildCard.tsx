
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Trophy, Shield, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      <Card className="premium-card hover:premium-card-elevated transition-all duration-300 shadow-subtle hover:shadow-elevated border-arcane-15">
        <CardContent className="p-4">
          <div className="flex">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
              className="h-14 w-14 rounded-xl overflow-hidden border border-arcane-30 shadow-glow-purple mr-3"
            >
              <img src={guild.avatar} alt={guild.name} className="h-full w-full object-cover" />
            </motion.div>
            
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-orbitron font-bold text-text-primary flex items-center tracking-wider text-base">
                    {guild.name}
                    {guild.isUserGuildMaster && (
                      <span className="ml-2 bg-achievement-15 text-achievement text-xs px-2 py-0.5 rounded-full font-space border border-achievement-30 shadow-glow-gold">
                        Mestre
                      </span>
                    )}
                  </h3>
                  <p className="text-sm text-text-primary/85 font-sora line-clamp-2 mt-0.5 leading-snug" style={{ textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)' }}>
                    {guild.description}
                  </p>
                </div>
              </div>
              
              <div className="flex gap-x-3 mt-2 text-xs">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <motion.div 
                        whileHover={{ y: -2 }}
                        className="flex items-center text-text-tertiary bg-midnight-elevated px-2 py-1 rounded-full border border-divider/20 hover:border-arcane-30 transition-all duration-200"
                      >
                        <Users className="w-3.5 h-3.5 mr-1 text-arcane" />
                        <span className="font-space tracking-wide">{guild.memberCount}</span>
                      </motion.div>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="bg-midnight-elevated border border-arcane-30 text-text-primary text-xs">
                      Membros
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <motion.div 
                        whileHover={{ y: -2 }}
                        className="flex items-center text-text-tertiary bg-midnight-elevated px-2 py-1 rounded-full border border-divider/20 hover:border-achievement-30 transition-all duration-200"
                      >
                        <Trophy className="w-3.5 h-3.5 mr-1 text-achievement" />
                        <span className="font-space tracking-wide">Nível {guild.level}</span>
                      </motion.div>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="bg-midnight-elevated border border-achievement-30 text-text-primary text-xs">
                      Nível da Guilda
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <motion.div 
                        whileHover={{ y: -2 }}
                        className="flex items-center text-text-tertiary bg-midnight-elevated px-2 py-1 rounded-full border border-divider/20 hover:border-valor-30 transition-all duration-200"
                      >
                        <Shield className="w-3.5 h-3.5 mr-1 text-arcane" />
                        <span className="font-space tracking-wide">{guild.questCount} missões</span>
                      </motion.div>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="bg-midnight-elevated border border-arcane-30 text-text-primary text-xs">
                      Missões Ativas
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </div>
          
          <div className="mt-3 flex justify-end">
            {isUserMember ? (
              <Button 
                onClick={handleGuildClick} 
                className="text-sm bg-midnight-elevated hover:bg-arcane-15 text-text-primary border border-arcane-30 shadow-glow-subtle transition-all duration-300 hover:shadow-glow-purple group hover:-translate-y-1"
                size="sm"
              >
                Visitar 
                <motion.div
                  initial={{ x: 0 }}
                  whileHover={{ x: 2 }}
                  className="inline-block ml-1"
                >
                  <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                </motion.div>
              </Button>
            ) : (
              <Button 
                className="text-sm bg-arcane hover:bg-arcane-60 text-text-primary shadow-glow-subtle transition-all duration-300 hover:shadow-glow-purple hover:-translate-y-1 group"
                size="sm"
              >
                Juntar-se
                <motion.div
                  initial={{ x: 0 }}
                  whileHover={{ x: 2 }}
                  className="inline-block ml-1"
                >
                  <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                </motion.div>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default GuildCard;
