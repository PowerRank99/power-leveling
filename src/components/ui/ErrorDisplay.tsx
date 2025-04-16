
import React from 'react';
import { AlertCircle, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ErrorCategory } from '@/services/common/ErrorHandlingService';

interface ErrorDisplayProps {
  title?: string;
  message: string;
  details?: string;
  category?: ErrorCategory;
  onRetry?: () => void;
  className?: string;
  showDetails?: boolean;
  code?: string;
}

/**
 * Standardized component for displaying errors throughout the application
 */
const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  title = 'Ocorreu um erro',
  message,
  details,
  category = ErrorCategory.UNKNOWN_ERROR,
  onRetry,
  className = '',
  showDetails = true,
  code
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  
  // Get background color classes based on error category
  const getColorsByCategory = () => {
    switch (category) {
      case ErrorCategory.AUTHENTICATION:
      case ErrorCategory.AUTHORIZATION:
        return 'bg-valor-15 border-valor-30 text-valor';
      case ErrorCategory.VALIDATION:
        return 'bg-amber-50/15 border-amber-300/30 text-amber-500';
      case ErrorCategory.DATABASE:
      case ErrorCategory.NETWORK:
        return 'bg-valor-15 border-valor-30 text-valor';
      case ErrorCategory.BUSINESS_LOGIC:
        return 'bg-arcane-15 border-arcane-30 text-arcane';
      default:
        return 'bg-valor-15 border-valor-30 text-valor';
    }
  };
  
  return (
    <Alert 
      variant="destructive" 
      className={`mb-4 ${getColorsByCategory()} shadow-subtle ${className}`}
    >
      <div className="flex items-start">
        <AlertCircle className="h-4 w-4 mt-0.5" />
        <div className="ml-2 flex-1">
          <AlertTitle className="font-orbitron">{title}</AlertTitle>
          <AlertDescription className="font-sora">
            {message}
            
            {details && showDetails && (
              <Collapsible open={isOpen} onOpenChange={setIsOpen} className="mt-2">
                <div className="flex items-center">
                  <CollapsibleTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="p-0 h-6 text-xs text-valor hover:bg-transparent hover:text-valor hover:opacity-80"
                    >
                      {isOpen ? (
                        <><ChevronUp className="h-3 w-3 mr-1" /> Ocultar detalhes técnicos</>
                      ) : (
                        <><ChevronDown className="h-3 w-3 mr-1" /> Mostrar detalhes técnicos</>
                      )}
                    </Button>
                  </CollapsibleTrigger>
                </div>
                <CollapsibleContent className="mt-2">
                  <div className="text-xs bg-midnight-card p-2 rounded border border-valor-15 text-text-secondary font-mono whitespace-pre-wrap">
                    {code && <div className="mb-1 text-valor-60">Code: {code}</div>}
                    {details}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            )}
            
            {onRetry && (
              <div className="mt-2">
                <Button 
                  variant="outline" 
                  onClick={onRetry}
                  className="w-full bg-midnight-elevated border-valor-30 text-text-primary hover:bg-valor-15"
                  size="sm"
                >
                  <RefreshCw className="w-4 h-4 mr-2" /> Tentar novamente
                </Button>
              </div>
            )}
          </AlertDescription>
        </div>
      </div>
    </Alert>
  );
};

export default ErrorDisplay;
