
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sword, Footprints, Sparkles, Heart, Shield } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useRPGClass } from '@/hooks/rpg/useRPGClass';
import { RPGClassName } from '@/types/rpgTypes';
import AuthRequiredRoute from '@/components/AuthRequiredRoute';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

const ClassSelectionPage = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { currentClass, selectClass, getAllClasses, isLoading } = useRPGClass();
  const [selectedClass, setSelectedClass] = useState<RPGClassName | null>(currentClass);

  const classIcons = {
    warrior: <Sword className="h-10 w-10 text-red-500" />,
    rogue: <Footprints className="h-10 w-10 text-indigo-500" />,
    mage: <Sparkles className="h-10 w-10 text-purple-500" />,
    ranger: <Heart className="h-10 w-10 text-green-500" />,
    cleric: <Shield className="h-10 w-10 text-blue-500" />,
  };

  const classes = getAllClasses();
  
  const handleSelectClass = async () => {
    if (!selectedClass) {
      toast.error("Selecione uma classe");
      return;
    }
    
    if (await selectClass(selectedClass)) {
      navigate('/perfil');
    }
  };
  
  const isSelectionDisabled = profile?.class && !profile?.class_selected_at;
  
  return (
    <AuthRequiredRoute>
      <div className="min-h-screen bg-gray-50">
        <PageHeader title="Escolha uma Classe" showBackButton={true} />
        
        <div className="p-4">
          <div className="mb-6">
            <h2 className="text-xl font-bold mb-2">Selecione sua Especialização</h2>
            <p className="text-gray-600 text-sm">
              Cada classe oferece diferentes bônus que afetarão seu progresso.
              {profile?.class && (
                <span className="block mt-2 font-medium">
                  Você já escolheu a classe {profile.class}. Escolher uma nova classe substituirá a anterior.
                </span>
              )}
            </p>
          </div>
          
          <div className="grid gap-4">
            {classes.map((rpgClass) => (
              <Card 
                key={rpgClass.name}
                className={`p-4 cursor-pointer transition-all ${
                  selectedClass === rpgClass.name 
                    ? 'ring-2 ring-fitblue' 
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => setSelectedClass(rpgClass.name)}
              >
                <div className="flex items-start">
                  <div className="mr-3">
                    {classIcons[rpgClass.name]}
                  </div>
                  
                  <div className="flex-grow">
                    <h3 className="font-bold text-lg">{rpgClass.title}</h3>
                    <p className="text-gray-600 text-sm mb-2">{rpgClass.description}</p>
                    
                    <div className="text-sm">
                      <div className="text-fitblue font-medium">{rpgClass.primaryBonus}</div>
                      <div className="text-gray-500">{rpgClass.secondaryBonus}</div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
          
          <div className="mt-8">
            <Button
              onClick={handleSelectClass}
              disabled={!selectedClass || isLoading || isSelectionDisabled}
              className="w-full py-6 text-lg"
            >
              {isLoading ? 'Processando...' : 'Confirmar Escolha'}
            </Button>
          </div>
          
          {isSelectionDisabled && (
            <p className="mt-4 text-sm text-center text-amber-600">
              Você só pode mudar de classe uma vez a cada 7 dias.
            </p>
          )}
        </div>
      </div>
    </AuthRequiredRoute>
  );
};

export default ClassSelectionPage;
