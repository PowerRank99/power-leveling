
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp, ChevronDown, Calendar, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Achievement } from '@/types/achievementTypes';
import RankBadge from '@/components/achievements/RankBadge';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { getRankColorClass, getIconBgClass, getAnimationSettings } from '@/utils/achievementUtils';

interface AchievementRankSectionProps {
  rank: string;
  achievements: Achievement[];
  isExpanded: boolean;
  onToggle: () => void;
}

const AchievementRankSection: React.FC<AchievementRankSectionProps> = ({
  rank,
  achievements,
  isExpanded,
  onToggle
}) => {
  const renderAchievementIcon = (iconName: string, rank: string) => {
    return (
      <Star className={`h-6 w-6 ${rank === 'S' || rank === 'A' ? 'text-achievement' : 
        rank === 'B' ? 'text-valor' : 'text-arcane'}`} />
    );
  };

  return (
    <motion.div 
      key={rank}
      className="premium-card mb-4 bg-midnight-card border border-divider/30 overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: ['S', 'A', 'B', 'C', 'D', 'E'].indexOf(rank) * 0.1 }}
    >
      <motion.div 
        className={`p-4 flex justify-between items-center cursor-pointer ${getRankColorClass(rank)}`}
        onClick={onToggle}
        whileHover={{ backgroundColor: "rgba(255,255,255,0.05)" }}
        whileTap={{ backgroundColor: "rgba(255,255,255,0.1)" }}
      >
        <div className="flex items-center">
          <RankBadge rank={rank as any} size="lg" />
          <h3 className="ml-3 font-orbitron font-bold text-lg">
            {rank === 'S' ? 'Conquistas Lendárias' :
             rank === 'A' ? 'Conquistas Raras' :
             rank === 'B' ? 'Conquistas Notáveis' :
             rank === 'C' ? 'Conquistas Importantes' :
             rank === 'D' ? 'Conquistas Significativas' :
             'Conquistas Iniciais'}
          </h3>
        </div>
        {isExpanded ? 
          <ChevronUp className="h-5 w-5" /> : 
          <ChevronDown className="h-5 w-5" />
        }
      </motion.div>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-4 space-y-4">
              {achievements.map((achievement, index) => (
                <motion.div
                  key={achievement.id}
                  className={`p-4 border ${
                    rank === 'S' || rank === 'A' ? 'border-achievement-30' : 
                    rank === 'B' ? 'border-valor-30' : 'border-arcane-30'
                  } rounded-lg bg-midnight-elevated overflow-hidden`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ 
                    delay: index * getAnimationSettings(rank).delay,
                    duration: getAnimationSettings(rank).duration,
                    type: getAnimationSettings(rank).type as any,
                    stiffness: getAnimationSettings(rank).stiffness
                  }}
                >
                  <div className="flex items-start">
                    <div className={`${getIconBgClass(rank)} rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0`}>
                      {renderAchievementIcon(achievement.iconName, rank)}
                    </div>
                    
                    <div className="ml-4 flex-1">
                      <h4 className="font-orbitron font-bold text-text-primary">{achievement.name}</h4>
                      <p className="text-sm text-text-secondary mt-1 font-sora">{achievement.description}</p>
                      
                      {achievement.achievedAt && (
                        <div className="flex items-center mt-2 text-xs text-text-tertiary">
                          <Calendar className="h-3 w-3 mr-1" />
                          <span>Revelado em {format(parseISO(achievement.achievedAt), "dd 'de' MMMM", { locale: ptBR })}</span>
                        </div>
                      )}
                      
                      <div className="flex justify-between items-center mt-3">
                        <Badge 
                          className={rank === 'S' || rank === 'A' 
                            ? 'bg-achievement-15 text-achievement border-achievement-30' 
                            : rank === 'B' 
                              ? 'bg-valor-15 text-valor border-valor-30'
                              : 'bg-arcane-15 text-arcane border-arcane-30'
                          }
                        >
                          +{achievement.xpReward} XP
                        </Badge>
                        
                        <div className="flex items-center">
                          <span className={`text-sm font-medium ${
                            rank === 'S' || rank === 'A' ? 'text-achievement' : 
                            rank === 'B' ? 'text-valor' : 'text-arcane'
                          }`}>
                            {achievement.points}
                          </span>
                          <Star className={`h-3 w-3 ml-1 ${
                            rank === 'S' || rank === 'A' ? 'text-achievement' : 
                            rank === 'B' ? 'text-valor' : 'text-arcane'
                          }`} />
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AchievementRankSection;
