
import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

interface WorkoutErrorAlertProps {
  error: string;
  onRetry: () => void;
}

const WorkoutErrorAlert: React.FC<WorkoutErrorAlertProps> = ({ error, onRetry }) => {
  if (!error) return null;
  
  return (
    <Alert variant="destructive" className="mb-4 bg-valor-15 border-valor-30 text-valor shadow-subtle">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle className="font-orbitron">Erro ao carregar dados</AlertTitle>
      <AlertDescription className="font-sora">
        {error}
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
      </AlertDescription>
    </Alert>
  );
};

export default WorkoutErrorAlert;
