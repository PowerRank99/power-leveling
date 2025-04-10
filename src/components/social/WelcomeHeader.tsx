
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
    <Card className="mb-4 overflow-hidden border-none shadow-md">
      <div className="bg-gradient-to-r from-fitblue-600 to-fitblue-700 p-4 text-white">
        <h2 className="text-xl font-bold">
          {greeting}{user ? `, ${user.user_metadata?.name || 'Atleta'}` : ''}!
        </h2>
        <p className="text-blue-100 text-sm mt-1">Vamos treinar hoje?</p>
      </div>
      
      <CardContent className="p-4 bg-white">
        <div className="flex justify-between">
          <div className="flex items-center">
            <div className="p-2 rounded-full bg-orange-100 mr-2">
              <Flame className="h-5 w-5 text-orange-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Streak</p>
              <p className="font-semibold">5 dias</p>
            </div>
          </div>
          
          <div className="flex items-center">
            <div className="p-2 rounded-full bg-purple-100 mr-2">
              <Award className="h-5 w-5 text-purple-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500">XP</p>
              <p className="font-semibold">450 pontos</p>
            </div>
          </div>
          
          <div className="flex items-center">
            <div className="p-2 rounded-full bg-fitblue-100 mr-2">
              <Dumbbell className="h-5 w-5 text-fitblue-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Treinos</p>
              <p className="font-semibold">12 completos</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WelcomeHeader;
