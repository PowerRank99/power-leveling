
import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface ParticleBackgroundProps {
  color: string;
  active?: boolean;
  particleCount?: number;
}

const ParticleBackground: React.FC<ParticleBackgroundProps> = ({ 
  color = '#8b5cf6', 
  active = false,
  particleCount = 20 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const renderParticles = () => {
    return Array.from({ length: particleCount }).map((_, index) => {
      // Random positions and sizes
      const size = Math.random() * 4 + 2;
      const x = Math.random() * 100;
      const y = Math.random() * 100;
      const delay = Math.random() * 8;
      
      return (
        <motion.div
          key={index}
          className="absolute rounded-full"
          style={{
            backgroundColor: color,
            width: size,
            height: size,
            left: `${x}%`,
            top: `${y}%`,
            opacity: active ? 0.6 : 0.3,
          }}
          animate={active ? {
            y: [0, -10, 0],
            opacity: [0.3, 0.7, 0.3],
            scale: [1, 1.2, 1],
          } : {}}
          transition={{
            duration: 3,
            ease: "easeInOut",
            repeat: Infinity,
            delay: delay,
          }}
        />
      );
    });
  };
  
  return (
    <div 
      ref={containerRef}
      className="absolute inset-0 overflow-hidden"
    >
      {renderParticles()}
    </div>
  );
};

export default ParticleBackground;
