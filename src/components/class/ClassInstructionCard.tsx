
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { InfoIcon, Calendar } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const ClassInstructionCard: React.FC = () => {
  return (
    <Card className="bg-midnight-elevated border-arcane-30/30 shadow-md mb-6">
      <CardContent className="p-5">
        <div className="flex items-center mb-3">
          <InfoIcon className="h-5 w-5 text-arcane mr-2" />
          <h2 className="text-xl font-bold text-text-primary tracking-wide orbitron-text">Escolha sua Classe</h2>
        </div>
        
        <Separator className="mb-3 bg-divider opacity-50" />
        
        <p className="text-sm text-text-primary mb-3 leading-relaxed">
          Cada classe oferece <span className="text-arcane font-medium">bônus de XP</span> para diferentes tipos de exercícios.
          Escolha a que melhor se adapta ao seu estilo de treino.
        </p>
        
        <div className="flex items-start mt-3 bg-arcane-15 p-3 rounded-lg border border-arcane-30/50">
          <Calendar className="h-5 w-5 text-arcane mt-0.5 mr-2 flex-shrink-0" />
          <p className="text-xs text-text-secondary leading-relaxed">
            Após escolher uma classe, você precisará esperar <span className="text-arcane font-medium">15 dias</span> para poder trocar novamente. 
            Escolha com sabedoria!
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ClassInstructionCard;
