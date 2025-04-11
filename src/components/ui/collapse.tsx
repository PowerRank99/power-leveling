
import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CollapseProps {
  open: boolean;
  children: React.ReactNode;
  className?: string;
}

export const Collapse: React.FC<CollapseProps> = ({
  open,
  children,
  className = '',
}) => {
  // Minimal animation setup to prevent performance issues
  const variants = {
    hidden: { 
      height: 0, 
      opacity: 0,
      overflow: 'hidden'
    },
    visible: { 
      height: 'auto', 
      opacity: 1,
      overflow: 'hidden',
      transition: { 
        duration: 0.15, // Shorter duration
        ease: "easeOut" 
      } 
    },
    exit: { 
      height: 0, 
      opacity: 0,
      overflow: 'hidden',
      transition: { 
        duration: 0.15, // Shorter duration
        ease: "easeOut" 
      } 
    }
  };

  // Use simpler rendering approach
  if (!open) return null;
  
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={variants}
      className={className}
    >
      {children}
    </motion.div>
  );
};
