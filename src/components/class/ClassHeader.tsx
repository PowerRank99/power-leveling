
import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import ClassIconSelector from '@/components/profile/ClassIconSelector';

interface ClassHeaderProps {
  className: string;
  isSelected: boolean;
  isCurrentClass: boolean;
  accentColor: string;
}

const ClassHeader: React.FC<ClassHeaderProps> = ({ 
  className,
  isSelected,
  isCurrentClass,
  accentColor
}) => {
  const iconVariants = {
    initial: { scale: 1, rotate: 0 },
    hover: { scale: 1.1, rotate: 5, transition: { type: "spring", stiffness: 300 } }
  };

  return (
    <div className="flex items-center">
      <motion.div 
        variants={iconVariants}
        className={`mr-4 ${accentColor} p-3 rounded-xl border border-white/20 flex items-center justify-center`}
      >
        <ClassIconSelector className={className} size="lg" />
      </motion.div>
      <div>
        <h3 className={`text-2xl font-bold orbitron-text text-white mb-1 tracking-wide`}>
          {className}
          {isSelected && !isCurrentClass && (
            <motion.span 
              className="inline-block ml-2 text-white"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Check className="w-5 h-5" />
            </motion.span>
          )}
        </h3>
      </div>
    </div>
  );
};

export default ClassHeader;
