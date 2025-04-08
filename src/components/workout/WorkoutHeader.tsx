
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

  const handleConfirmDiscard = async () => {
    setShowDiscardDialog(false);
    // Call the discard function without wrapping it in another timeout
    await onDiscard();
  };

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="flex justify-between items-center p-4">
        <div className="flex items-center">
          <Button
            variant="ghost" 
            size="icon"
            className="mr-2"
            title="Back"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <div className="text-gray-500">{elapsedTime}</div>
        </div>
        
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            className="mr-2 text-red-500"
            title="Discard workout"
            onClick={handleDiscardClick}
            disabled={isFinishing}
          >
            <Trash2 className="w-6 h-6" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="mr-2"
            title="Timer"
          >
            <Clock className="w-6 h-6" />
          </Button>
          
          <Button
            className="bg-blue-500 hover:bg-blue-600 text-white px-6"
            onClick={onFinish}
            disabled={isFinishing}
          >
            {isFinishing ? "Finalizando..." : "Finalizar"}
          </Button>
        </div>
      </div>

      <Dialog open={showDiscardDialog} onOpenChange={setShowDiscardDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Descartar treino</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja descartar este treino? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-between sm:justify-between">
            <Button variant="outline" onClick={() => setShowDiscardDialog(false)}>
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleConfirmDiscard}
              disabled={isFinishing}
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
