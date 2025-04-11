
import React, { useState, useEffect } from 'react';
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
  const [height, setHeight] = useState<number | undefined>(open ? undefined : 0);
  const [ref, setRef] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!ref) return;
    
    if (open) {
      setHeight(ref.getBoundingClientRect().height);
    } else {
      setHeight(0);
    }
  }, [open, ref, children]);

  return (
    <AnimatePresence initial={false}>
      {open && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.33, 1, 0.68, 1] }}
          className={`overflow-hidden ${className}`}
        >
          <div ref={setRef}>
            {children}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
