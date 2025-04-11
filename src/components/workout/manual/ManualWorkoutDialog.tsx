
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import ManualWorkoutForm from './ManualWorkoutForm';

type ManualWorkoutDialogProps = {
  onSuccess?: () => void;
};

const ManualWorkoutDialog: React.FC<ManualWorkoutDialogProps> = ({ onSuccess }) => {
  const [open, setOpen] = React.useState(false);
  
  const handleSuccess = () => {
    setOpen(false);
    if (onSuccess) {
      onSuccess();
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          className="w-full bg-midnight-elevated border border-arcane/30 text-arcane hover:bg-arcane hover:text-white transition-colors"
          variant="outline"
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Registrar Treino Manualmente
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] bg-midnight-card border-arcane/30">
        <ManualWorkoutForm
          onSuccess={handleSuccess}
          onCancel={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
};

export default ManualWorkoutDialog;
