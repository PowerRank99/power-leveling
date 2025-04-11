
import React from 'react';
import { Button } from '@/components/ui/button';

interface FormActionsProps {
  isSubmitting: boolean;
  isSubmitDisabled: boolean;
  onCancel: () => void;
}

const FormActions: React.FC<FormActionsProps> = ({ 
  isSubmitting, 
  isSubmitDisabled, 
  onCancel 
}) => {
  return (
    <div className="flex space-x-2 justify-end mt-4">
      <Button
        type="button"
        variant="secondary"
        onClick={onCancel}
        disabled={isSubmitting}
        className="bg-midnight-elevated border-arcane/30 text-text-primary hover:bg-arcane/10"
      >
        Cancelar
      </Button>
      <Button
        type="submit"
        disabled={isSubmitting || isSubmitDisabled}
        className="bg-arcane hover:bg-arcane/80 text-text-primary"
      >
        {isSubmitting ? (
          <>
            <div className="mr-2 h-4 w-4 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
            Registrando...
          </>
        ) : (
          'Registrar Treino'
        )}
      </Button>
    </div>
  );
};

export default FormActions;
