
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Flame, Award, Dumbbell } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const WelcomeHeader = () => {
  const { user } = useAuth();
  
  // Default greeting based on time of day
  const currentHour = new Date().getHours();
  let greeting = "Olá";
  
  if (currentHour < 12) greeting = "Bom dia";
  else if (currentHour < 18) greeting = "Boa tarde";
  else greeting = "Boa noite";
  
  return (
    <Card className="mb-4 premium-card premium-card-elevated overflow-hidden border-none shadow-elevated">
      <div className="bg-gradient-to-r from-arcane to-valor p-4 text-text-primary">
        <h2 className="text-xl font-orbitron font-bold">
          {greeting}{user ? `, ${user.user_metadata?.name || 'Atleta'}` : ''}!
        </h2>
        <p className="text-text-secondary text-sm mt-1 font-sora">Vamos treinar hoje?</p>
      </div>
      
      <CardContent className="p-4 bg-midnight-card">
        <div className="flex justify-between">
          <div className="flex items-center">
            <div className="p-2 rounded-full bg-valor-15 mr-2 border border-valor-30">
              <Flame className="h-5 w-5 text-valor" />
            </div>
            <div>
              <p className="text-sm text-text-tertiary font-sora">Streak</p>
              <p className="font-space font-semibold text-text-primary">5 dias</p>
            </div>
          </div>
          
          <div className="flex items-center">
            <div className="p-2 rounded-full bg-arcane-15 mr-2 border border-arcane-30">
              <Award className="h-5 w-5 text-arcane" />
            </div>
            <div>
              <p className="text-sm text-text-tertiary font-sora">XP</p>
              <p className="font-space font-semibold text-text-primary">450 pontos</p>
            </div>
          </div>
          
          <div className="flex items-center">
            <div className="p-2 rounded-full bg-achievement-15 mr-2 border border-achievement-30">
              <Dumbbell className="h-5 w-5 text-achievement" />
            </div>
            <div>
              <p className="text-sm text-text-tertiary font-sora">Treinos</p>
              <p className="font-space font-semibold text-text-primary">12 completos</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WelcomeHeader;
