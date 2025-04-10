
import React from 'react';
import { Button } from '@/components/ui/button';
import { UsersIcon, Trophy, Compass, Shield, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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
  
  const handleManageClick = () => {
    navigate(`/guilds/${guildId}/manage`);
  };

  return (
    <div className="bg-gradient-to-r from-arcane to-valor p-4 border-b border-arcane-30 shadow-glow-subtle relative overflow-hidden">
      {/* Subtle texture overlay */}
      <div className="absolute inset-0 bg-midnight-deep opacity-10 mix-blend-overlay" 
           style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg xmlns=\"http://www.w3.org/2000/svg\" width=\"100\" height=\"100\" viewBox=\"0 0 100 100\"%3E%3Cpath d=\"M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z\" fill=\"%23ffffff\" fill-opacity=\"0.1\" fill-rule=\"evenodd\"/%3E%3C/svg%3E')" 
      }}></div>
      
      <div className="relative z-10">
        <div className="flex items-center">
          <motion.div 
            className="h-16 w-16 rounded-lg overflow-hidden mr-4 shadow-glow-purple border-2 border-arcane-30 transform hover:scale-105 transition-all duration-300"
            whileHover={{ 
              scale: 1.08,
              rotate: 2,
              transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] }
            }}
          >
            <img src={guildInfo.avatar} alt={guildInfo.name} className="h-full w-full object-cover" />
          </motion.div>
          <div className="flex-1">
            <h2 className="text-xl font-bold font-orbitron text-text-primary flex items-center tracking-wider" style={{ textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)' }}>
              {guildInfo.name}
            </h2>
            <div className="flex text-sm text-text-secondary mt-1 flex-wrap gap-x-4 font-sora">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <motion.div 
                      whileHover={{ y: -2 }}
                      className="flex items-center bg-midnight-elevated/30 backdrop-blur-sm px-2 py-1 rounded-full border border-white/10 hover:border-white/20 transition-all duration-200"
                    >
                      <UsersIcon className="w-4 h-4 mr-1" />
                      <span className="font-space tracking-wide">{guildInfo.memberCount} membros</span>
                    </motion.div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="bg-midnight-elevated border border-arcane-30 text-text-primary text-xs">
                    {guildInfo.activeMemberCount || Math.round(guildInfo.memberCount * 0.7)} membros ativos nessa semana
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <motion.div 
                      whileHover={{ y: -2 }}
                      className="flex items-center bg-midnight-elevated/30 backdrop-blur-sm px-2 py-1 rounded-full border border-white/10 hover:border-achievement-30 transition-all duration-200"
                    >
                      <Trophy className="w-4 h-4 mr-1 text-achievement" />
                      <span className="font-space tracking-wide">{guildInfo.completedQuests} quests completas</span>
                    </motion.div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="bg-midnight-elevated border border-achievement-30 text-text-primary text-xs">
                    Missões completadas pela guilda
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>
        
        <div className="flex mt-4 gap-2">
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Button 
              onClick={handleQuestsClick}
              className="flex-1 bg-midnight-elevated hover:bg-arcane-15 text-text-primary border border-arcane-30 rounded-md text-sm h-9 font-sora shadow-glow-subtle hover:shadow-glow-purple transition-all duration-300 group hover:-translate-y-1"
            >
              <Compass className="w-4 h-4 mr-1 group-hover:rotate-12 transition-transform duration-300" />
              Ver Quests
              <motion.div
                initial={{ x: 0, opacity: 0 }}
                whileHover={{ x: 2, opacity: 1 }}
                className="inline-block ml-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              >
                <ArrowRight className="w-3.5 h-3.5" />
              </motion.div>
            </Button>
          </motion.div>
          
          {guildInfo.isUserGuildMaster && (
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Button
                onClick={handleManageClick}
                variant="outline"
                className="flex-1 bg-midnight-elevated hover:bg-arcane-15 text-text-primary border border-arcane-30 rounded-md text-sm h-9 font-sora shadow-glow-subtle hover:shadow-glow-purple transition-all duration-300 group hover:-translate-y-1"
              >
                <Shield className="w-4 h-4 mr-1 group-hover:rotate-12 transition-transform duration-300" />
                Gerenciar Guilda
              </Button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GuildHeader;
