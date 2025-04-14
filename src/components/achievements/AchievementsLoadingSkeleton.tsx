
import React from 'react';
import { motion } from 'framer-motion';

const AchievementsLoadingSkeleton: React.FC = () => {
  return (
    <motion.div 
      className="premium-card p-8 text-center bg-midnight-card"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="animate-pulse flex flex-col items-center">
        <div className="rounded-full bg-midnight-elevated h-12 w-12 mb-4"></div>
        <div className="h-4 bg-midnight-elevated rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-midnight-elevated rounded w-1/2"></div>
      </div>
    </motion.div>
  );
};

export default AchievementsLoadingSkeleton;
