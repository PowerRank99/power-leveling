
import React from 'react';
import { ScrollText, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const ClassInstructionCard: React.FC = () => {
  return (
    <Card className="rpg-panel mb-6 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-arcane/5 to-xpgold/5 opacity-20"></div>
      <CardContent className="p-4 relative">
        <div className="flex items-start gap-3">
          <div className="bg-arcane/20 rounded-full p-2 mt-1">
            <ScrollText className="h-5 w-5 text-arcane-400" />
          </div>
          <div>
            <h2 className="text-xl font-display text-arcane-400 tracking-wide mb-2">Escolha sua Classe</h2>
            <p className="text-sm text-ghost-300 mb-1">
              Cada classe oferece bônus de XP para diferentes tipos de exercícios.
            </p>
            <p className="text-xs flex items-center text-ghost-500 mt-2">
              <Sparkles className="h-3 w-3 mr-1 text-xpgold" /> 
              Após escolher uma classe, você precisará esperar 15 dias para poder trocar novamente.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ClassInstructionCard;
