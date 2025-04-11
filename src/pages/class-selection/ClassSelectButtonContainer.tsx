
import React from 'react';
import { motion } from 'framer-motion';
import ClassSelectButton from '@/components/class/ClassSelectButton';
import { itemVariants } from './animations';

interface ClassSelectButtonContainerProps {
  selectedClass: string | null;
  userClass: string | null;
  isSelecting: boolean;
  isOnCooldown: boolean;
  onSelectClass: () => Promise<void>;
}

const ClassSelectButtonContainer: React.FC<ClassSelectButtonContainerProps> = ({
  selectedClass,
  userClass,
  isSelecting,
  isOnCooldown,
  onSelectClass
}) => {
  return (
    <motion.div 
      className="px-4"
      variants={itemVariants}
    >
      <ClassSelectButton
        selectedClass={selectedClass}
        userClass={userClass}
        isSelecting={isSelecting}
        isOnCooldown={isOnCooldown}
        onClick={onSelectClass}
      />
    </motion.div>
  );
};

export default ClassSelectButtonContainer;
