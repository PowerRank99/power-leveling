
import React from 'react';
import { motion } from 'framer-motion';
import { Star, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const ClassInstructionCard = () => {
  // Animation for the title
  const titleVariants = {
    initial: { opacity: 0, y: -10 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 }
    }
  };
  
  // Animation for the glowing effect
  const glowVariants = {
    initial: { opacity: 0.5 },
    animate: { 
      opacity: [0.5, 0.8, 0.5],
      scale: [1, 1.05, 1],
      transition: { 
        duration: 3,
        repeat: Infinity,
        repeatType: "reverse" as const
      }
    }
  };
  
  // Animation for the XP text
  const xpTextVariants = {
    initial: { scale: 1 },
    animate: { 
      scale: [1, 1.05, 1],
      transition: { 
        duration: 2,
        repeat: Infinity,
        repeatType: "reverse" as const
      }
    }
  };
  
  return (
    <Card className="mb-6 bg-midnight-deep/60 backdrop-blur-md overflow-hidden border border-white/10 shadow-lg relative">
      <CardContent className="p-5">
        <div className="relative z-10">
          <motion.div 
            className="absolute -z-10 inset-0 bg-gradient-to-r from-arcane/20 to-valor/20 rounded-xl opacity-50 blur-xl"
            variants={glowVariants}
            initial="initial"
            animate="animate"
          />
          
          <motion.h2 
            className="text-2xl font-bold font-orbitron mb-2 text-white tracking-wide relative"
            variants={titleVariants}
            initial="initial"
            animate="animate"
          >
            Escolha sua Classe
            <motion.span
              className="absolute -inset-3 bg-gradient-to-r from-arcane/10 to-valor/10 rounded-xl blur-xl -z-10"
              variants={glowVariants}
              initial="initial"
              animate="animate"
            />
          </motion.h2>
          
          <p className="mb-4 text-base text-text-secondary relative z-10">
            Cada classe fornece diferentes 
            <motion.span 
              className="mx-1 text-achievement font-bold" 
              variants={xpTextVariants}
              initial="initial"
              animate="animate"
            >
              bônus de XP
            </motion.span> 
            para tipos específicos de exercícios:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-5">
            <div className="flex items-start bg-black/20 backdrop-blur-sm p-3 rounded-lg border border-white/10">
              <Star className="flex-shrink-0 mr-2 mt-0.5 text-achievement w-5 h-5" />
              <div>
                <h3 className="font-semibold text-white">Bônus Passivos</h3>
                <p className="text-sm text-text-secondary mt-1">
                  Ganhe XP adicional baseado na sua especialização
                </p>
              </div>
            </div>
            
            <div className="flex items-start bg-black/20 backdrop-blur-sm p-3 rounded-lg border border-white/10">
              <TrendingUp className="flex-shrink-0 mr-2 mt-0.5 text-valor w-5 h-5" />
              <div>
                <h3 className="font-semibold text-white">Progresso Específico</h3>
                <p className="text-sm text-text-secondary mt-1">
                  Nivele mais rápido com exercícios da sua classe
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ClassInstructionCard;
