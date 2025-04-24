
import React from 'react';
import { motion } from 'framer-motion';

interface GuildInfoProps {
  name: string;
  avatar: string;
  memberCount: number;
  activeMemberCount: number;
  totalExp: number;
  weeklyExp: number;
  completedQuests: number;
  activeQuests: number;
  isUserGuildMaster: boolean;
}

interface GuildHeaderProps {
  guildInfo: GuildInfoProps;
  guildId: string;
}

const GuildHeader: React.FC<GuildHeaderProps> = ({ guildInfo, guildId }) => {
  return (
    <div className="flex items-center gap-4">
      <motion.div 
        className="h-16 w-16 rounded-xl overflow-hidden border-2 border-arcane-30 shadow-glow-purple"
        whileHover={{ scale: 1.05 }}
        transition={{ type: "spring", stiffness: 400, damping: 10 }}
      >
        <img 
          src={guildInfo.avatar} 
          alt={guildInfo.name}
          className="h-full w-full object-cover"
        />
      </motion.div>
      
      <div className="flex-1">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="font-orbitron text-xl font-bold text-text-primary tracking-wide mb-1">
              {guildInfo.name}
            </h2>
            <div className="flex gap-3">
              <div className="flex flex-col">
                <span className="text-xs text-text-secondary font-sora">Total XP</span>
                <span className="text-lg font-space font-medium text-text-primary">
                  {guildInfo.totalExp.toLocaleString()}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-text-secondary font-sora">XP Semanal</span>
                <span className="text-lg font-space font-medium text-arcane">
                  +{guildInfo.weeklyExp.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
          
          {guildInfo.isUserGuildMaster && (
            <div className="text-xs bg-achievement-15 text-achievement px-2 py-0.5 rounded-full font-space border border-achievement-30 shadow-glow-gold">
              Mestre da Guilda
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GuildHeader;
