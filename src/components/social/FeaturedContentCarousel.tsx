
import React from 'react';
import { Card } from '@/components/ui/card';
import { ChevronRight, Dumbbell, Trophy } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

const FeaturedContentCarousel = () => {
  const featuredItems = [
    {
      title: "Desafio Semanal",
      description: "5 treinos em 7 dias",
      image: "/lovable-uploads/38b244e2-15ad-44b7-8d2d-48eb9e4227a8.png",
      gradient: "from-arcane-30 to-valor-30",
      progress: 40, // 40% complete
      icon: <Dumbbell className="h-4 w-4 mr-1.5 text-arcane-60" />
    },
    {
      title: "Nova Guilda",
      description: "Junte-se aos Paladinos",
      image: "/lovable-uploads/71073810-f05a-4adc-a860-636599324c62.png",
      gradient: "from-arcane-30 to-achievement-30",
      icon: <Trophy className="h-4 w-4 mr-1.5 text-achievement-60" />
    }
  ];
  
  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-orbitron font-semibold text-text-primary">Destaque</h3>
        <button className="text-arcane text-sm font-sora flex items-center hover:text-arcane-60 transition-colors">
          Ver tudo <ChevronRight className="h-4 w-4 ml-1" />
        </button>
      </div>
      
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none">
        {featuredItems.map((item, index) => (
          <Card 
            key={index} 
            className="flex-none w-[280px] h-32 premium-card hover:premium-card-elevated cursor-pointer 
                       transition-all duration-300 hover:shadow-glow-purple transform hover:scale-[1.02]"
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
                      <span className="text-arcane font-space">{item.progress}%</span>
                    </div>
                    <Progress value={item.progress} className="h-1.5" />
                  </div>
                )}
              </div>
              <div className="w-16 h-16 overflow-hidden rounded-full border-2 border-divider/30 shadow-glow-subtle">
                <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default FeaturedContentCarousel;
