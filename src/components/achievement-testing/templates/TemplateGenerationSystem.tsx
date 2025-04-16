
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
        Template Generation Information
      </AlertTitle>
      <AlertDescription className="text-amber-400/90 text-sm">
        Template generation is an experimental feature. Generated templates will need review.
      </AlertDescription>
    </Alert>
  );
};

export default TemplateGenerationSystem;
