
import React from 'react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { InfoIcon } from 'lucide-react';

const TemplateGenerationSystem = () => {
  return (
    <Alert 
      variant="default" 
      className="my-4 bg-amber-50/5 border border-amber-500/20"
    >
      <AlertTitle className="text-amber-500 font-medium">
        <InfoIcon className="h-4 w-4 inline-block mr-2" /> 
        Achievement System Removed
      </AlertTitle>
      <AlertDescription className="text-amber-400/90 text-sm">
        The achievement system has been removed and will be rebuilt from scratch.
      </AlertDescription>
    </Alert>
  );
};

export default TemplateGenerationSystem;
