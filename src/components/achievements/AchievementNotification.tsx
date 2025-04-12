
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Award, Star, Sparkles } from 'lucide-react';
import { AchievementRank } from '@/types/achievementTypes';
import '../../styles/timer-animations.css';

interface AchievementNotificationProps {
  title: string;
  description: string;
  xpReward: number;
  rank: AchievementRank;
  bonusText?: string;
  points: number;
  isVisible: boolean;
  onClose: () => void;
}

const getRankColor = (rank: string) => {
  switch(rank) {
    case 'S': return 'from-achievement to-achievement-60';
    case 'A': return 'from-achievement-60 to-achievement-30';
    case 'B': return 'from-valor to-valor-60';
    case 'C': return 'from-arcane-60 to-arcane-30';
    case 'D': return 'from-arcane-30 to-arcane-15';
    case 'E': 
    default: return 'from-arcane-15 to-text-secondary';
  }
};

const getRankGlow = (rank: string) => {
  switch(rank) {
    case 'S': return 'shadow-glow-gold';
    case 'A': return 'shadow-glow-gold';
    case 'B': return 'shadow-glow-valor';
    case 'C': return 'shadow-glow-purple';
    case 'D': return 'shadow-glow-purple';
    case 'E': 
    default: return 'shadow-glow-subtle';
  }
};

const getAchievementIcon = (rank: string) => {
  switch(rank) {
    case 'S': return <Trophy className="h-14 w-14 text-achievement" strokeWidth={1.5} />;
    case 'A': return <Trophy className="h-14 w-14 text-achievement" strokeWidth={1.5} />;
    case 'B': return <Star className="h-14 w-14 text-valor" strokeWidth={1.5} />;
    case 'C': 
    case 'D':
    case 'E':
    default: return <Award className="h-14 w-14 text-arcane" strokeWidth={1.5} />;
  }
};

const AchievementNotification: React.FC<AchievementNotificationProps> = ({
  title, 
  description, 
  xpReward, 
  rank, 
  bonusText,
  points,
  isVisible,
  onClose
}) => {
  const [showText, setShowText] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showReward, setShowReward] = useState(false);
  const [xpCount, setXpCount] = useState(0);
  
  useEffect(() => {
    if (isVisible) {
      // Trigger vibration if available
      if (navigator.vibrate) {
        navigator.vibrate(200);
      }
      
      // Play sound effect based on rank
      playRankSound(rank as AchievementRank);
      
      // Sequence animations
      const textTimer = setTimeout(() => setShowText(true), 300);
      const detailsTimer = setTimeout(() => setShowDetails(true), 1000);
      const rewardTimer = setTimeout(() => setShowReward(true), 1800);
      
      return () => {
        clearTimeout(textTimer);
        clearTimeout(detailsTimer);
        clearTimeout(rewardTimer);
      };
    } else {
      setShowText(false);
      setShowDetails(false);
      setShowReward(false);
      setXpCount(0);
    }
  }, [isVisible, rank]);
  
  useEffect(() => {
    if (showReward && xpCount < xpReward) {
      const interval = setInterval(() => {
        setXpCount(prev => {
          const increment = Math.max(1, Math.floor(xpReward / 20));
          const newValue = Math.min(prev + increment, xpReward);
          if (newValue === xpReward) clearInterval(interval);
          return newValue;
        });
      }, 50);
      
      return () => clearInterval(interval);
    }
  }, [showReward, xpReward, xpCount]);
  
  const playRankSound = (rank: AchievementRank) => {
    // This would be implemented with actual sound effects
    console.log(`Playing ${rank} rank achievement sound`);
    // const audio = new Audio(`/sounds/achievement-${rank.toLowerCase()}.mp3`);
    // audio.play().catch(err => console.error("Error playing sound", err));
  };
  
  if (!isVisible) return null;
  
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm bg-black/70"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div 
          className={`relative bg-midnight-card rounded-xl border-2 border-${rank === 'S' ? 'achievement' : rank === 'B' ? 'valor' : 'arcane'}-30 p-8 m-4 max-w-sm w-full ${getRankGlow(rank)} overflow-hidden`}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.5, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Particle/Energy effects */}
          <div className="absolute inset-0 overflow-hidden opacity-30">
            <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-arcane-15 to-transparent"></div>
            <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-arcane-15 to-transparent"></div>
            <div className="absolute top-0 bottom-0 left-0 w-20 bg-gradient-to-r from-arcane-15 to-transparent"></div>
            <div className="absolute top-0 bottom-0 right-0 w-20 bg-gradient-to-l from-arcane-15 to-transparent"></div>
          </div>
          
          {/* System Notice */}
          <motion.div 
            className="text-center mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: showText ? 1 : 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-lg font-space text-text-secondary font-mono tracking-wider">
              {'[CONQUISTA REVELADA]'}
            </h2>
          </motion.div>
          
          {/* Icon */}
          <div className="flex justify-center mb-4">
            <motion.div 
              className={`p-6 rounded-full bg-gradient-to-br ${getRankColor(rank)} ${getRankGlow(rank)} relative`}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ type: 'spring', damping: 20, stiffness: 200 }}
            >
              {getAchievementIcon(rank)}
              
              {/* Sparkles effect for S and A rank */}
              {(rank === 'S' || rank === 'A') && (
                <motion.div 
                  className="absolute -top-2 -right-2"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles className="h-6 w-6 text-achievement" />
                </motion.div>
              )}
            </motion.div>
          </div>
          
          {/* Title and Description */}
          <AnimatePresence>
            {showDetails && (
              <motion.div 
                className="text-center mb-6"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h3 className={`text-xl font-orbitron font-bold mb-2 ${
                  rank === 'S' || rank === 'A' ? 'text-achievement' : 
                  rank === 'B' ? 'text-valor' : 'text-arcane'
                }`}>
                  {title}
                </h3>
                <p className="text-text-secondary font-sora">
                  {description}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* XP Reward */}
          <AnimatePresence>
            {showReward && (
              <motion.div 
                className="mt-4 space-y-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <motion.div 
                  className="bg-achievement-15 rounded-lg border border-achievement-30 p-3 flex items-center justify-center"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <span className="text-2xl font-space font-bold text-achievement">+{xpCount} XP</span>
                </motion.div>
                
                {bonusText && (
                  <motion.div 
                    className="bg-valor-15 rounded-lg border border-valor-30 p-3"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    <p className="text-center text-sm text-valor">{bonusText}</p>
                  </motion.div>
                )}
                
                <motion.div 
                  className="mt-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                >
                  <button 
                    className="w-full py-3 px-4 bg-gradient-to-r from-arcane to-arcane-60 rounded-lg text-midnight-deep font-orbitron font-bold shadow-glow-subtle hover:shadow-glow-purple transition-all"
                    onClick={onClose}
                  >
                    CONTINUAR
                  </button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AchievementNotification;
