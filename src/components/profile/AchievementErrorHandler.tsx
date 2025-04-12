
import React from 'react';
import { ServiceErrorResponse, ErrorCategory } from '@/services/common/ErrorHandlingService';
import ErrorDisplay from '@/components/ui/ErrorDisplay';

interface AchievementErrorHandlerProps {
  error: ServiceErrorResponse | null;
  onRetry: () => void;
  className?: string;
}

/**
 * Component for handling and displaying achievement-related errors
 */
const AchievementErrorHandler: React.FC<AchievementErrorHandlerProps> = ({
  error,
  onRetry,
  className = ''
}) => {
  if (!error) return null;
  
  return (
    <ErrorDisplay
      title="Erro ao carregar conquistas"
      message={error.error.message}
      details={error.error.technical}
      category={error.error.category || ErrorCategory.UNKNOWN}
      code={error.error.code}
      onRetry={onRetry}
      className={className}
    />
  );
};

export default AchievementErrorHandler;
