
import React from 'react';
import { motion } from 'framer-motion';
import { Award } from 'lucide-react';

interface AchievementsEmptyStateProps {
  onHintClick: () => void;
}

const AchievementsEmptyState: React.FC<AchievementsEmptyStateProps> = ({ onHintClick }) => {
  return (
    <motion.div 
      className="premium-card p-8 text-center bg-midnight-card border border-divider/30"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Award className="h-16 w-16 text-text-tertiary mx-auto mb-4 opacity-50" />
      <h3 className="text-xl font-semibold text-text-primary font-orbitron mb-2">Mistérios Não Revelados</h3>
      <p className="text-text-secondary mt-1 font-sora max-w-sm mx-auto">
        "Conquistas serão reveladas conforme sua jornada avança. Continue seu caminho para descobrir seu potencial oculto."
      </p>
      <motion.button 
        className="mt-6 px-4 py-2 bg-midnight-elevated rounded-full text-text-secondary font-sora text-sm"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onHintClick}
      >
        Receber uma dica misteriosa
      </motion.button>
    </motion.div>
  );
};

export default AchievementsEmptyState;
