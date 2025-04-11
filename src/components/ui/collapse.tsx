
import React, { useState, useEffect, useRef } from 'react';
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
  // Use a ref to store the content element
  const contentRef = useRef<HTMLDivElement>(null);
  
  // Animation variants to improve performance
  const variants = {
    hidden: { height: 0, opacity: 0, overflow: 'hidden' },
    visible: { 
      height: 'auto', 
      opacity: 1,
      overflow: 'hidden',
      transition: { 
        height: { duration: 0.3, ease: [0.33, 1, 0.68, 1] },
        opacity: { duration: 0.25, ease: [0.33, 1, 0.68, 1] }
      } 
    },
    exit: { 
      height: 0, 
      opacity: 0,
      overflow: 'hidden',
      transition: { 
        height: { duration: 0.3, ease: [0.33, 1, 0.68, 1] },
        opacity: { duration: 0.2, ease: [0.33, 1, 0.68, 1] }
      } 
    }
  };

  return (
    <AnimatePresence initial={false}>
      {open && (
        <motion.div
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={variants}
          className={className}
        >
          <div ref={contentRef}>
            {children}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
