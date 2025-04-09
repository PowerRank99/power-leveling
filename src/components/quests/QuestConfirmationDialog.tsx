
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar, Award, CheckCircle2 } from 'lucide-react';
import { QuestTemplateProps } from './QuestTemplate';

interface QuestConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedQuest: QuestTemplateProps | null;
  onConfirm: () => void;
  isSubmitting: boolean;
}

const QuestConfirmationDialog: React.FC<QuestConfirmationDialogProps> = ({
  open,
  onOpenChange,
  selectedQuest,
  onConfirm,
  isSubmitting
}) => {
  if (!selectedQuest) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Confirmar Criação da Quest</DialogTitle>
          <DialogDescription>
            Você está prestes a criar a quest "{selectedQuest.title}" para sua guilda.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <h3 className="font-semibold mb-2">Detalhes da Quest:</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center">
              <CheckCircle2 className="w-4 h-4 mr-2 text-gray-500" />
              <span>{selectedQuest.daysRequired} dias necessários de {selectedQuest.totalDays} dias totais</span>
            </div>
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-2 text-gray-500" />
              <span>Duração de {selectedQuest.totalDays} dias</span>
            </div>
            <div className="flex items-center">
              <Award className="w-4 h-4 mr-2 text-yellow-500" />
              <span className="font-medium">{selectedQuest.xpReward} XP de recompensa</span>
            </div>
          </div>
        </div>

        <DialogFooter className="flex space-x-2 sm:space-x-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={onConfirm} disabled={isSubmitting}>
            {isSubmitting ? 'Criando...' : 'Criar Quest'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default QuestConfirmationDialog;
