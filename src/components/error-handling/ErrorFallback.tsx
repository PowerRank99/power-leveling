
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

interface ErrorFallbackProps {
  error: Error | null;
  resetErrorBoundary?: () => void;
}

/**
 * Fallback component displayed when an error is caught by an ErrorBoundary
 */
const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  resetErrorBoundary
}) => {
  return (
    <div className="p-4 bg-midnight-card rounded-lg border border-valor-30 shadow-md max-w-xl mx-auto my-4">
      <div className="flex flex-col items-center text-center">
        <div className="w-16 h-16 bg-valor-15 rounded-full flex items-center justify-center mb-4">
          <span className="text-3xl">⚠️</span>
        </div>
        
        <h2 className="text-xl font-orbitron text-white mb-2">
          Something went wrong
        </h2>
        
        <div className="text-text-secondary mb-4 font-sora">
          There was an error in this part of the application.
        </div>
        
        {error && (
          <div className="bg-midnight-elevated p-3 rounded w-full mb-4 overflow-auto max-h-32 text-left">
            <p className="text-valor-60 text-sm font-mono whitespace-pre-wrap">
              {error.message || 'Unknown error'}
            </p>
          </div>
        )}
        
        {resetErrorBoundary && (
          <Button
            onClick={resetErrorBoundary}
            className="bg-valor hover:bg-valor-60 text-white"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try again
          </Button>
        )}
      </div>
    </div>
  );
};

export default ErrorFallback;
