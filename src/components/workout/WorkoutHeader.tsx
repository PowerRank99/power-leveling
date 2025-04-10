
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
    <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
      <div className="flex justify-between items-center p-4">
        <div className="flex items-center">
          <Button
            variant="ghost" 
            size="icon"
            className="mr-2 dark:text-gray-300"
            title="Back"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <div className="text-gray-500 dark:text-gray-400">{elapsedTime}</div>
        </div>
        
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            className="mr-2 text-red-500 dark:text-red-400"
            title="Discard workout"
            onClick={handleDiscardClick}
          >
            <Trash2 className="w-6 h-6" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="mr-2 dark:text-gray-300"
            title="Timer"
          >
            <Clock className="w-6 h-6" />
          </Button>
          
          <Button
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 dark:bg-blue-600 dark:hover:bg-blue-700"
            onClick={onFinish}
            disabled={isFinishing}
          >
            {isFinishing ? "Finalizando..." : "Finish"}
          </Button>
        </div>
      </div>

      <Dialog open={showDiscardDialog} onOpenChange={setShowDiscardDialog}>
        <DialogContent className="sm:max-w-md dark:bg-gray-800">
          <DialogHeader>
            <DialogTitle className="dark:text-white">Descartar treino</DialogTitle>
            <DialogDescription className="dark:text-gray-300">
              Tem certeza que deseja descartar este treino? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-between sm:justify-between">
            <Button variant="outline" onClick={() => setShowDiscardDialog(false)}
                   className="dark:border-gray-600 dark:text-gray-300">
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleConfirmDiscard}>
              Descartar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WorkoutHeader;
