
import React from 'react';
import { ArrowLeft, Clock, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';

interface WorkoutHeaderProps {
  onFinish: () => void;
  onDiscard: () => void;
  isFinishing: boolean;
  elapsedTime: string;
}

const WorkoutHeader: React.FC<WorkoutHeaderProps> = ({ 
  onFinish, 
  onDiscard,
  isFinishing, 
  elapsedTime 
}) => {
  const [showDiscardDialog, setShowDiscardDialog] = React.useState(false);

  const handleDiscardClick = () => {
    setShowDiscardDialog(true);
  };

  const handleConfirmDiscard = () => {
    setShowDiscardDialog(false);
    onDiscard();
  };

  return (
    <div className="bg-midnight-base border-b border-divider">
      <div className="flex justify-between items-center p-4">
        <div className="flex items-center">
          <Button
            variant="ghost" 
            size="icon"
            className="mr-2 text-text-secondary hover:text-arcane"
            title="Back"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <div className="text-text-secondary font-space">{elapsedTime}</div>
        </div>
        
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            className="mr-2 text-valor hover:text-valor/90 hover:bg-valor-15"
            title="Descartar treino"
            onClick={handleDiscardClick}
          >
            <Trash2 className="w-6 h-6" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="mr-2 text-text-secondary hover:text-arcane hover:bg-arcane-15"
            title="Timer"
          >
            <Clock className="w-6 h-6" />
          </Button>
          
          <Button
            className="bg-arcane hover:bg-arcane-60 text-text-primary px-6 shadow-glow-subtle"
            onClick={onFinish}
            disabled={isFinishing}
          >
            {isFinishing ? "Finalizando..." : "Finalizar"}
          </Button>
        </div>
      </div>

      <Dialog open={showDiscardDialog} onOpenChange={setShowDiscardDialog}>
        <DialogContent className="sm:max-w-md bg-midnight-card border-divider text-text-primary">
          <DialogHeader>
            <DialogTitle className="font-orbitron text-text-primary">Descartar treino</DialogTitle>
            <DialogDescription className="text-text-secondary font-sora">
              Tem certeza que deseja descartar este treino? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-between sm:justify-between">
            <Button 
              variant="outline" 
              onClick={() => setShowDiscardDialog(false)}
              className="bg-midnight-elevated border-divider text-text-secondary hover:bg-midnight-base hover:text-text-primary"
            >
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleConfirmDiscard}
              className="bg-valor hover:bg-valor-60 text-text-primary"
            >
              Descartar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WorkoutHeader;
