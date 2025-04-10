
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { TrendingUp, ChevronDown, ChevronUp, Users, Shield, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface GuildStatsProps {
  weeklyExp: number;
  totalExp: number;
  activeMemberCount: number;
  memberCount: number;
  activeQuests: number;
}

const GuildStats: React.FC<GuildStatsProps> = ({
  weeklyExp,
  totalExp,
  activeMemberCount,
  memberCount,
  activeQuests
}) => {
  const [showStats, setShowStats] = useState(true);
  
  const toggleStats = () => {
    setShowStats(!showStats);
  };
  
  const statsVariants = {
    hidden: { 
      height: 0, 
      opacity: 0,
      transition: { 
        duration: 0.3,
        ease: [0.16, 1, 0.3, 1]
      }
    },
    visible: { 
      height: 'auto', 
      opacity: 1,
      transition: {
        duration: 0.3,
        ease: [0.16, 1, 0.3, 1],
        staggerChildren: 0.1
      }
    }
  };
  
  const statItemVariants = {
    hidden: { y: 10, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { 
        duration: 0.3,
        ease: [0.16, 1, 0.3, 1]
      }
    }
  };
  
  return (
    <div className="bg-midnight-card border border-divider overflow-hidden transition-all duration-300 rounded-lg shadow-subtle hover:shadow-elevated">
      <div 
        className="p-3 flex justify-between items-center cursor-pointer border-b border-divider"
        onClick={toggleStats}
      >
        <h3 className="text-sm font-orbitron text-text-primary flex items-center tracking-wider">
          <TrendingUp className="w-4 h-4 mr-1.5 text-arcane" />
          Estatísticas da Guilda
        </h3>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-7 w-7 p-0 text-text-secondary hover:text-text-primary hover:bg-midnight-elevated transition-colors"
        >
          <motion.div
            animate={{ rotate: showStats ? 180 : 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <ChevronDown className="h-4 w-4" />
          </motion.div>
        </Button>
      </div>
      
      <AnimatePresence>
        {showStats && (
          <motion.div 
            className="overflow-hidden"
            variants={statsVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            <div className="p-4 grid grid-cols-2 gap-3">
              <motion.div 
                className="bg-midnight-elevated rounded-lg p-3 border border-arcane-15 hover:border-arcane-30 transition-all duration-300 hover:shadow-glow-subtle"
                variants={statItemVariants}
                whileHover={{ y: -2, transition: { duration: 0.2 } }}
              >
                <div className="text-xs text-text-secondary mb-1 font-sora">EXP Semanal</div>
                <div className="text-xl font-bold text-arcane flex items-center font-space tracking-wide">
                  {weeklyExp} <TrendingUp className="w-4 h-4 ml-1 text-arcane-60" />
                </div>
              </motion.div>
              
              <motion.div 
                className="bg-midnight-elevated rounded-lg p-3 border border-arcane-15 hover:border-arcane-30 transition-all duration-300 hover:shadow-glow-subtle"
                variants={statItemVariants}
                whileHover={{ y: -2, transition: { duration: 0.2 } }}
              >
                <div className="text-xs text-text-secondary mb-1 font-sora">EXP Total</div>
                <div className="text-xl font-bold text-arcane flex items-center font-space tracking-wide">
                  {totalExp}
                </div>
              </motion.div>
              
              <motion.div 
                className="bg-midnight-elevated rounded-lg p-3 border border-arcane-15 hover:border-arcane-30 transition-all duration-300 hover:shadow-glow-subtle"
                variants={statItemVariants}
                whileHover={{ y: -2, transition: { duration: 0.2 } }}
              >
                <div className="text-xs text-text-secondary mb-1 font-sora">Membros Ativos</div>
                <div className="text-xl font-bold text-text-primary flex items-center font-space tracking-wide">
                  <Users className="w-4 h-4 mr-1 text-arcane-60" />
                  <span>{activeMemberCount}</span>
                  <span className="text-sm text-text-secondary ml-1 font-normal">/{memberCount}</span>
                </div>
              </motion.div>
              
              <motion.div 
                className="bg-midnight-elevated rounded-lg p-3 border border-arcane-15 hover:border-arcane-30 transition-all duration-300 hover:shadow-glow-subtle"
                variants={statItemVariants}
                whileHover={{ y: -2, transition: { duration: 0.2 } }}
              >
                <div className="text-xs text-text-secondary mb-1 font-sora">Missões Ativas</div>
                <div className="text-xl font-bold text-achievement flex items-center font-space tracking-wide">
                  <Shield className="w-4 h-4 mr-1 text-achievement-60" />
                  {activeQuests}
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GuildStats;
