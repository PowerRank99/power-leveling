
import React from 'react';
import { ServiceResponse, ErrorCategory } from '@/services/common/ErrorHandlingService';
import ErrorDisplay from '@/components/ui/ErrorDisplay';

interface AchievementErrorHandlerProps {
  error: ServiceResponse<any> | null;
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
  
  const errorMessage = error.message || 'Erro desconhecido';
  const technicalDetails = error.error && typeof error.error === 'object' && 'technical' in error.error 
    ? (error.error as any).technical 
    : error.error instanceof Error 
      ? error.error.message 
      : 'Detalhes técnicos não disponíveis';
      
  const errorCategory = error.error && typeof error.error === 'object' && 'category' in error.error
    ? (error.error as any).category
    : ErrorCategory.UNKNOWN;
    
  const errorCode = error.error && typeof error.error === 'object' && 'code' in error.error
    ? (error.error as any).code
    : undefined;
  
  return (
    <ErrorDisplay
      title="Erro ao carregar conquistas"
      message={errorMessage}
      details={technicalDetails}
      category={errorCategory}
      code={errorCode}
      onRetry={onRetry}
      className={className}
    />
  );
};

export default AchievementErrorHandler;
