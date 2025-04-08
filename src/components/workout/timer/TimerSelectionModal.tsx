
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface TimerPreset {
  seconds: number;
  label: string;
}

const TIMER_PRESETS: TimerPreset[] = [
  { seconds: 30, label: "30s" },
  { seconds: 60, label: "1:00" },
  { seconds: 90, label: "1:30" },
  { seconds: 120, label: "2:00" },
  { seconds: 180, label: "3:00" },
  { seconds: 240, label: "4:00" },
  { seconds: 300, label: "5:00" }
];

interface TimerSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectDuration: (seconds: number) => void;
  currentDuration: number;
  exerciseName?: string;
}

const TimerSelectionModal: React.FC<TimerSelectionModalProps> = ({
  isOpen,
  onClose,
  onSelectDuration,
  currentDuration,
  exerciseName
}) => {
  const handleSelectDuration = (seconds: number) => {
    onSelectDuration(seconds);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {exerciseName 
              ? `Definir tempo de descanso para ${exerciseName}` 
              : "Definir tempo de descanso"}
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-3 gap-3 py-4">
          {TIMER_PRESETS.map((preset) => (
            <Button
              key={preset.seconds}
              variant={currentDuration === preset.seconds ? "default" : "outline"}
              className={`h-14 text-lg ${currentDuration === preset.seconds ? 'bg-blue-600' : ''}`}
              onClick={() => handleSelectDuration(preset.seconds)}
            >
              {preset.label}
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TimerSelectionModal;
