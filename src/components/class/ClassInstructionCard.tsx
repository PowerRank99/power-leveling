
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

const ClassInstructionCard: React.FC = () => {
  return (
    <Card className="bg-white dark:bg-gray-800 border-none shadow-sm mb-6">
      <CardContent className="p-4">
        <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-2">Escolha sua Classe</h2>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
          Cada classe oferece bônus de XP para diferentes tipos de exercícios.
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Após escolher uma classe, você precisará esperar 15 dias para poder trocar novamente.
        </p>
      </CardContent>
    </Card>
  );
};

export default ClassInstructionCard;
