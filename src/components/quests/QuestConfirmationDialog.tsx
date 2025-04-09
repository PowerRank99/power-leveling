
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
          <DialogTitle>Confirm Quest Creation</DialogTitle>
          <DialogDescription>
            You are about to create the quest "{selectedQuest.title}" for your guild.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <h3 className="font-semibold mb-2">Quest Details:</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center">
              <CheckCircle2 className="w-4 h-4 mr-2 text-gray-500" />
              <span>{selectedQuest.daysRequired} days required of {selectedQuest.totalDays} total days</span>
            </div>
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-2 text-gray-500" />
              <span>Duration of {selectedQuest.totalDays} days</span>
            </div>
            <div className="flex items-center">
              <Award className="w-4 h-4 mr-2 text-yellow-500" />
              <span className="font-medium">{selectedQuest.xpReward} XP reward</span>
            </div>
          </div>
        </div>

        <DialogFooter className="flex space-x-2 sm:space-x-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onConfirm} disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create Quest'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default QuestConfirmationDialog;
