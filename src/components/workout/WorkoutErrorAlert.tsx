
import React from 'react';
import ErrorDisplay from '@/components/ui/ErrorDisplay';
import { ErrorCategory } from '@/services/common/ErrorHandlingService';

interface WorkoutErrorAlertProps {
  error: string;
  onRetry: () => void;
  category?: ErrorCategory;
}

/**
 * Standardized error display for workout-related errors
 */
const WorkoutErrorAlert: React.FC<WorkoutErrorAlertProps> = ({ 
  error, 
  onRetry,
  category = ErrorCategory.UNKNOWN 
}) => {
  if (!error) return null;
  
  return (
    <ErrorDisplay
      title="Erro ao carregar dados"
      message={error}
      category={category}
      onRetry={onRetry}
    />
  );
};

export default WorkoutErrorAlert;
