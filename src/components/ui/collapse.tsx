
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
  const contentRef = useRef<HTMLDivElement>(null);
  
  // Simplified animation variants with better performance
  const variants = {
    hidden: { 
      height: 0, 
      opacity: 0,
      overflow: 'hidden',
      transitionEnd: { 
        display: 'none' 
      }
    },
    visible: { 
      height: 'auto', 
      opacity: 1,
      display: 'block',
      overflow: 'hidden',
      transition: { 
        height: { duration: 0.2, ease: "easeOut" },
        opacity: { duration: 0.15, ease: "easeOut" }
      } 
    },
    exit: { 
      height: 0, 
      opacity: 0,
      overflow: 'hidden',
      transition: { 
        height: { duration: 0.2, ease: "easeOut" },
        opacity: { duration: 0.1, ease: "easeOut" }
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
