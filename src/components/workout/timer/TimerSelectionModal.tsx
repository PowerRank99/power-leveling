
import React, { useState } from 'react';
import { 
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { MinusCircle, PlusCircle, Clock } from 'lucide-react';

interface TimerSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectDuration: (durationSeconds: number) => void;
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
  const [duration, setDuration] = useState(currentDuration);
  
  const presetDurations = [30, 60, 90, 120, 180];
  
  const handleIncrease = () => {
    setDuration(prev => prev + 15);
  };
  
  const handleDecrease = () => {
    setDuration(prev => Math.max(15, prev - 15));
  };
  
  const handlePresetSelect = (seconds: number) => {
    setDuration(seconds);
  };
  
  const handleSave = () => {
    onSelectDuration(duration);
    onClose();
  };
  
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (secs === 0) return `${mins}:00`;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-midnight-card border-divider text-text-primary">
        <DialogHeader>
          <DialogTitle className="font-orbitron text-text-primary flex items-center">
            <Clock className="w-5 h-5 mr-2 text-arcane" />
            Tempo de descanso
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          {exerciseName && (
            <p className="mb-4 text-text-secondary font-sora">
              Defina o tempo de descanso para <span className="text-arcane">{exerciseName}</span>
            </p>
          )}
          
          <div className="flex justify-center items-center gap-4 mb-6">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={handleDecrease}
              className="rounded-full h-10 w-10 border-divider bg-midnight-elevated hover:bg-arcane-15 hover:border-arcane-30 text-arcane"
            >
              <MinusCircle className="h-5 w-5" />
            </Button>
            
            <div className="text-4xl font-space tracking-wider text-text-primary w-32 text-center">
              {formatDuration(duration)}
            </div>
            
            <Button 
              variant="outline" 
              size="icon" 
              onClick={handleIncrease}
              className="rounded-full h-10 w-10 border-divider bg-midnight-elevated hover:bg-arcane-15 hover:border-arcane-30 text-arcane"
            >
              <PlusCircle className="h-5 w-5" />
            </Button>
          </div>
          
          <div className="grid grid-cols-5 gap-2 mb-4">
            {presetDurations.map(seconds => (
              <Button
                key={seconds}
                variant="outline"
                className={`
                  ${duration === seconds 
                    ? 'bg-arcane-15 border-arcane-30 text-arcane' 
                    : 'bg-midnight-elevated border-divider text-text-secondary'
                  } 
                  font-space
                `}
                onClick={() => handlePresetSelect(seconds)}
              >
                {formatDuration(seconds)}
              </Button>
            ))}
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={onClose}
            className="bg-midnight-elevated border-divider text-text-secondary hover:bg-midnight-base hover:text-text-primary"
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleSave}
            className="bg-arcane hover:bg-arcane-60 text-text-primary"
          >
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TimerSelectionModal;
