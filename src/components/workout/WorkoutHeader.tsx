
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
    if (isFinishing) return; // Prevent opening dialog if already finishing
    setShowDiscardDialog(true);
  };

  const handleConfirmDiscard = () => {
    setShowDiscardDialog(false);
    onDiscard();
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
            disabled={isFinishing}
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
            title="Descartar treino"
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
            disabled={isFinishing}
          >
            <Clock className="w-6 h-6" />
          </Button>
          
          <Button
            className="bg-blue-500 hover:bg-blue-600 text-white px-6"
            onClick={onFinish}
            disabled={isFinishing}
          >
            {isFinishing ? (
              <div className="flex items-center">
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                <span>Finalizando...</span>
              </div>
            ) : (
              "Finalizar"
            )}
          </Button>
        </div>
      </div>

      <Dialog open={showDiscardDialog} onOpenChange={(open) => {
        // Prevent closing the dialog if currently submitting
        if (isFinishing && open === false) return;
        setShowDiscardDialog(open);
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Descartar treino</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja descartar este treino? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-between sm:justify-between">
            <Button 
              variant="outline" 
              onClick={() => setShowDiscardDialog(false)}
              disabled={isFinishing}
            >
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleConfirmDiscard}
              disabled={isFinishing}
            >
              {isFinishing ? (
                <div className="flex items-center">
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  <span>Processando...</span>
                </div>
              ) : (
                "Descartar"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WorkoutHeader;
