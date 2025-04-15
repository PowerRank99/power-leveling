
import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AchievementValidationService } from '@/services/testing/AchievementValidationService';
import { AchievementIdMappingService } from '@/services/common/AchievementIdMappingService';

export function AchievementIdDebugger() {
  const [validationResults, setValidationResults] = useState<{
    valid: string[];
    invalid: string[];
    missing: string[];
  }>({ valid: [], invalid: [], missing: [] });
  const [isValidating, setIsValidating] = useState(false);
  
  const runValidation = async () => {
    setIsValidating(true);
    try {
      await AchievementIdMappingService.initialize();
      const results = await AchievementValidationService.validateAll();
      setValidationResults(results);
    } catch (error) {
      console.error('Validation failed:', error);
    } finally {
      setIsValidating(false);
    }
  };
  
  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Achievement ID Validation</h3>
        <Button 
          onClick={runValidation} 
          disabled={isValidating}
        >
          {isValidating ? 'Validating...' : 'Run Validation'}
        </Button>
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4">
          <h4 className="font-medium mb-2 flex items-center gap-2">
            Valid IDs
            <Badge variant="success" className="ml-2">
              {validationResults.valid.length}
            </Badge>
          </h4>
          <ScrollArea className="h-[200px]">
            <div className="space-y-1">
              {validationResults.valid.map(id => (
                <div key={id} className="text-sm text-success p-1">
                  {id}
                </div>
              ))}
            </div>
          </ScrollArea>
        </Card>
        
        <Card className="p-4">
          <h4 className="font-medium mb-2 flex items-center gap-2">
            Invalid IDs
            <Badge variant="destructive" className="ml-2">
              {validationResults.invalid.length}
            </Badge>
          </h4>
          <ScrollArea className="h-[200px]">
            <div className="space-y-1">
              {validationResults.invalid.map(id => (
                <div key={id} className="text-sm text-destructive p-1">
                  {id}
                </div>
              ))}
            </div>
          </ScrollArea>
        </Card>
        
        <Card className="p-4">
          <h4 className="font-medium mb-2 flex items-center gap-2">
            Missing Mappings
            <Badge variant="arcane" className="ml-2">
              {validationResults.missing.length}
            </Badge>
          </h4>
          <ScrollArea className="h-[200px]">
            <div className="space-y-1">
              {validationResults.missing.map(id => (
                <div key={id} className="text-sm text-text-secondary p-1">
                  {id}
                </div>
              ))}
            </div>
          </ScrollArea>
        </Card>
      </div>
      
      {(validationResults.invalid.length > 0 || validationResults.missing.length > 0) && (
        <Alert variant="destructive">
          <AlertTitle>Validation Issues Found</AlertTitle>
          <AlertDescription>
            There are mismatches between your code constants and database achievements.
            Please review the invalid and missing IDs above and update your constants accordingly.
          </AlertDescription>
        </Alert>
      )}
    </Card>
  );
}
