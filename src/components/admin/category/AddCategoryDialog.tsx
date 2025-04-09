
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger
} from '@/components/ui/dialog';

interface AddCategoryDialogProps {
  newCategoryValue: string;
  onNewCategoryValueChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onAddCategory: () => void;
}

const AddCategoryDialog: React.FC<AddCategoryDialogProps> = ({
  newCategoryValue,
  onNewCategoryValueChange,
  onAddCategory
}) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Nova Categoria
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar Nova Categoria</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <Input
            placeholder="Nome da categoria"
            value={newCategoryValue}
            onChange={onNewCategoryValueChange}
          />
          <p className="text-xs text-gray-500 mt-2">
            Nota: A categoria só será criada quando for atribuída a um exercício.
          </p>
        </div>
        <DialogFooter>
          <Button onClick={onAddCategory}>Adicionar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddCategoryDialog;
