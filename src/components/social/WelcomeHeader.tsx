
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Flame, Award, Dumbbell, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const WelcomeHeader = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Default greeting based on time of day
  const currentHour = new Date().getHours();
  let greeting = "Olá";
  
  if (currentHour < 12) greeting = "Bom dia";
  else if (currentHour < 18) greeting = "Boa tarde";
  else greeting = "Boa noite";
  
  const handleTrainNowClick = () => {
    navigate('/treino');
  };
  
  return (
    <Card className="mb-4 premium-card premium-card-elevated overflow-hidden border-none shadow-elevated">
      <div className="bg-gradient-to-r from-arcane/90 to-valor/90 p-4 text-text-primary relative">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-orbitron font-bold text-text-primary drop-shadow-sm">
              {greeting}{user ? `, ${user.user_metadata?.name || 'Atleta'}` : ''}!
            </h2>
            <p className="text-text-secondary text-sm mt-1 font-sora flex items-center">
              Vamos treinar hoje? <Dumbbell className="h-4 w-4 ml-1.5 text-text-primary animate-pulse-subtle" />
            </p>
          </div>
          
          <Button 
            onClick={handleTrainNowClick}
            className="bg-midnight-card hover:bg-midnight-elevated text-arcane border border-arcane-30 
                     flex items-center px-4 py-2 rounded-full shadow-glow-subtle transition-all 
                     hover:shadow-glow-purple text-sm"
          >
            Treinar Agora <ArrowRight className="h-4 w-4 ml-1.5" />
          </Button>
        </div>
      </div>
      
      <CardContent className="p-4 bg-midnight-card">
        <div className="flex justify-between">
          <div className="flex items-center bg-midnight-elevated p-2 rounded-lg border border-valor-30/40 shadow-subtle">
            <div className="p-2 rounded-full bg-valor-15 mr-2 border border-valor-30">
              <Flame className="h-5 w-5 text-valor" />
            </div>
            <div>
              <p className="text-xs text-text-tertiary font-sora">Streak</p>
              <p className="font-space font-semibold text-text-primary text-lg">5 dias</p>
            </div>
          </div>
          
          <div className="flex items-center bg-midnight-elevated p-2 rounded-lg border border-arcane-30/40 shadow-subtle">
            <div className="p-2 rounded-full bg-arcane-15 mr-2 border border-arcane-30">
              <Award className="h-5 w-5 text-arcane" />
            </div>
            <div>
              <p className="text-xs text-text-tertiary font-sora">XP</p>
              <p className="font-space font-semibold text-text-primary text-lg">450 pontos</p>
            </div>
          </div>
          
          <div className="flex items-center bg-midnight-elevated p-2 rounded-lg border border-achievement-30/40 shadow-subtle">
            <div className="p-2 rounded-full bg-achievement-15 mr-2 border border-achievement-30">
              <Dumbbell className="h-5 w-5 text-achievement" />
            </div>
            <div>
              <p className="text-xs text-text-tertiary font-sora">Treinos</p>
              <p className="font-space font-semibold text-text-primary text-lg">12 completos</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WelcomeHeader;
