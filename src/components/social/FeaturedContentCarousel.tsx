
import React from 'react';
import { Card } from '@/components/ui/card';
import { ChevronRight, Dumbbell, Trophy } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const FeaturedContentCarousel = () => {
  const featuredItems = [
    {
      title: "Desafio Semanal",
      description: "5 treinos em 7 dias",
      image: "/lovable-uploads/38b244e2-15ad-44b7-8d2d-48eb9e4227a8.png",
      gradient: "from-arcane-30 to-valor-30",
      progress: 40, // 40% complete
      icon: <Dumbbell className="h-4 w-4 mr-1.5 text-arcane-60" />,
      tooltip: "Complete 5 treinos esta semana para ganhar 300 XP"
    },
    {
      title: "Nova Guilda",
      description: "Junte-se aos Paladinos",
      image: "/lovable-uploads/71073810-f05a-4adc-a860-636599324c62.png",
      gradient: "from-arcane-30 to-achievement-30",
      icon: <Trophy className="h-4 w-4 mr-1.5 text-achievement-60" />,
      tooltip: "Participe de raids e ganhe recompensas exclusivas"
    }
  ];
  
  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-orbitron font-semibold text-text-primary tracking-wide">Destaque</h3>
        <motion.button 
          className="text-arcane text-sm font-sora flex items-center hover:text-arcane-60 transition-colors"
          whileHover={{ 
            x: 2,
            transition: { duration: 0.2 }
          }}
        >
          Ver tudo 
          <ChevronRight className="h-4 w-4 ml-1" />
        </motion.button>
      </div>
      
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none">
        {featuredItems.map((item, index) => (
          <TooltipProvider key={index}>
            <Tooltip>
              <TooltipTrigger asChild>
                <motion.div 
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ 
                    duration: 0.4,
                    delay: index * 0.1,
                    ease: [0.16, 1, 0.3, 1]
                  }}
                >
                  <Card 
                    className="flex-none w-[280px] h-32 premium-card hover:premium-card-elevated cursor-pointer 
                             transition-all duration-300 hover:shadow-glow-purple"
                  >
                    <div 
                      className={`h-full rounded-xl p-4 flex items-center bg-gradient-to-br ${item.gradient} 
                               hover:shadow-glow-purple transition-all duration-300`}
                    >
                      <div className="flex-1">
                        <h4 className="font-orbitron font-bold text-text-primary flex items-center">
                          {item.icon}
                          {item.title}
                        </h4>
                        <p className="text-sm text-text-secondary font-sora">{item.description}</p>
                        
                        {item.progress !== undefined && (
                          <div className="mt-2">
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-text-secondary">Progresso</span>
                              <motion.span 
                                className="text-achievement font-space shadow-glow-gold"
                                animate={{ 
                                  scale: [1, 1.08, 1],
                                }}
                                transition={{ 
                                  duration: 2, 
                                  ease: "easeInOut",
                                  repeat: Infinity,
                                  repeatType: "reverse"
                                }}
                              >
                                {item.progress}%
                              </motion.span>
                            </div>
                            <div className="relative h-1.5 rounded-full overflow-hidden">
                              <div className="absolute inset-0 bg-divider rounded-full"></div>
                              <motion.div
                                initial={{ width: "0%" }}
                                animate={{ width: `${item.progress}%` }}
                                transition={{ 
                                  duration: 1.5, 
                                  ease: [0.16, 1, 0.3, 1]
                                }}
                                className="absolute inset-0 bg-gradient-to-r from-arcane to-valor h-full rounded-full shadow-glow-subtle"
                              ></motion.div>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="w-16 h-16 overflow-hidden rounded-full border-2 border-divider/30 shadow-glow-subtle">
                        <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                      </div>
                    </div>
                  </Card>
                </motion.div>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="bg-midnight-elevated border border-arcane-30 text-text-primary text-xs">
                {item.tooltip}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
      </div>
    </div>
  );
};

export default FeaturedContentCarousel;
