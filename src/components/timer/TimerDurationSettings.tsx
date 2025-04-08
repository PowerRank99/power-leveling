
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface TimerDurationSettingsProps {
  defaultDuration: number;
  onShowDurationSelector: () => void;
}

const TimerDurationSettings: React.FC<TimerDurationSettingsProps> = ({
  defaultDuration,
  onShowDurationSelector
}) => {
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="p-5 mb-6">
      <h2 className="text-xl font-bold mb-4">Tempo de Descanso Padrão</h2>
      
      <div className="flex justify-between items-center mb-6">
        <span className="text-gray-600">Duração padrão</span>
        <Button
          onClick={onShowDurationSelector}
          variant="outline"
        >
          {formatDuration(defaultDuration)}
        </Button>
      </div>
      
      <div className="mb-8">
        <p className="text-sm text-gray-500 mb-2">
          Esta duração será usada como padrão para exercícios sem um tempo específico definido.
        </p>
      </div>
    </Card>
  );
};

export default TimerDurationSettings;
