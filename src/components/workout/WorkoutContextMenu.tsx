
import React from 'react';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Trash2 } from 'lucide-react';

interface WorkoutContextMenuProps {
  children: React.ReactNode;
  workoutId: string;
  workoutName: string;
  onDeleteWorkout: (workoutId: string) => void;
}

const WorkoutContextMenu: React.FC<WorkoutContextMenuProps> = ({ 
  children, 
  workoutId,
  workoutName, 
  onDeleteWorkout 
}) => {
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);

  const handleDeleteClick = () => {
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = () => {
    onDeleteWorkout(workoutId);
    setShowDeleteDialog(false);
  };

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger className="w-full">
          {children}
        </ContextMenuTrigger>
        <ContextMenuContent className="w-48">
          <ContextMenuItem 
            onClick={handleDeleteClick}
            className="text-red-500 focus:text-red-500 cursor-pointer"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Excluir treino
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir treino</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o treino "{workoutName}"? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete}
              className="bg-red-500 hover:bg-red-600"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default WorkoutContextMenu;
