
import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AchievementStandardizationService } from '@/services/common/AchievementStandardizationService';

interface StandardizationResult {
  valid: string[];
  invalid: string[];
  missing: string[];
  suggestions: Array<{
    id: string;
    issue: string;
    suggestion: string;
  }>;
}

export function AchievementIdDebugger() {
  const [results, setResults] = useState<StandardizationResult>({
    valid: [],
    invalid: [],
    missing: [],
    suggestions: []
  });
  const [isValidating, setIsValidating] = useState(false);
  
  const runValidation = async () => {
    setIsValidating(true);
    try {
      const validationResults = await AchievementStandardizationService.validateAndStandardize();
      setResults(validationResults);
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
              {results.valid.length}
            </Badge>
          </h4>
          <ScrollArea className="h-[200px]">
            <div className="space-y-1">
              {results.valid.map(id => (
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
              {results.invalid.length}
            </Badge>
          </h4>
          <ScrollArea className="h-[200px]">
            <div className="space-y-1">
              {results.invalid.map(id => (
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
              {results.missing.length}
            </Badge>
          </h4>
          <ScrollArea className="h-[200px]">
            <div className="space-y-1">
              {results.missing.map(id => (
                <div key={id} className="text-sm text-text-secondary p-1">
                  {id}
                </div>
              ))}
            </div>
          </ScrollArea>
        </Card>
      </div>
      
      {results.suggestions.length > 0 && (
        <Card className="p-4">
          <h4 className="font-medium mb-2">Suggestions</h4>
          <ScrollArea className="h-[200px]">
            <div className="space-y-2">
              {results.suggestions.map((suggestion, index) => (
                <Alert 
                  key={index} 
                  variant="default"  // Changed from "info" to "default"
                  className="text-sm"
                >
                  <AlertTitle>{suggestion.id}</AlertTitle>
                  <AlertDescription>
                    <strong>Issue:</strong> {suggestion.issue}<br />
                    <strong>Suggestion:</strong> {suggestion.suggestion}
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </ScrollArea>
        </Card>
      )}
    </Card>
  );
}
