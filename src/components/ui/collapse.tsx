
import React from 'react';
import { motion } from 'framer-motion';

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
  // Simplified animation with fixed height for better performance
  const variants = {
    hidden: { 
      height: 0, 
      opacity: 0,
      overflow: 'hidden',
      transitionEnd: {
        display: 'none',
      }
    },
    visible: { 
      height: 'auto', 
      opacity: 1,
      display: 'block',
      overflow: 'hidden',
      transition: { 
        height: {
          duration: 0.15,
          ease: "easeOut"
        },
        opacity: {
          duration: 0.1,
          ease: "easeOut"
        }
      } 
    }
  };

  // Use a single conditional render approach
  return (
    <motion.div
      initial={open ? "visible" : "hidden"}
      animate={open ? "visible" : "hidden"}
      variants={variants}
      className={className}
    >
      {children}
    </motion.div>
  );
};
