
import React from 'react';
import { ServiceErrorResponse } from '@/services/common/ErrorHandlingService';
import ErrorDisplay from '@/components/ui/ErrorDisplay';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

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
      onRetry={onRetry}
      className={className}
    />
  );
};

export default AchievementErrorHandler;
