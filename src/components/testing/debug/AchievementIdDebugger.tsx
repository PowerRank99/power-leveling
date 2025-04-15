import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AchievementStandardizationService } from '@/services/common/AchievementStandardizationService';
import { AchievementIdMappingService } from '@/services/common/AchievementIdMappingService';
import { toast } from 'react-toastify';

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
  const [mappings, setMappings] = useState<{[key: string]: string}>({});
  
  const runValidation = async () => {
    setIsValidating(true);
    try {
      await AchievementIdMappingService.initialize();
      
      const currentMappings: {[key: string]: string} = {};
      AchievementIdMappingService.getAllMappings().forEach((value, key) => {
        currentMappings[key] = value;
      });
      setMappings(currentMappings);
      
      const validationResults = await AchievementStandardizationService.validateAndStandardize();
      setResults(validationResults);
    } catch (error) {
      console.error('Validation failed:', error);
    } finally {
      setIsValidating(false);
    }
  };

  const handleMigrate = async () => {
    setIsValidating(true);
    try {
      const count = await AchievementStandardizationService.migrateUnmappedAchievements();
      toast.success(`Migrated ${count} achievement mappings`);
      await runValidation();
    } catch (error) {
      console.error('Migration failed:', error);
      toast.error('Failed to migrate achievements');
    } finally {
      setIsValidating(false);
    }
  };

  useEffect(() => {
    runValidation();
  }, []);

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Achievement ID Validation</h3>
        <div className="flex gap-2">
          <Button 
            onClick={handleMigrate}
            disabled={isValidating || results.suggestions.length === 0}
            variant="outline"
          >
            Run Migration
          </Button>
          <Button 
            onClick={runValidation} 
            disabled={isValidating}
          >
            {isValidating ? 'Validating...' : 'Re-run Validation'}
          </Button>
        </div>
      </div>
      
      <Card className="p-4">
        <h4 className="font-medium mb-2">Current Mappings</h4>
        <ScrollArea className="h-[200px]">
          <div className="space-y-1">
            {Object.entries(mappings).map(([stringId, uuid]) => (
              <div key={stringId} className="text-sm p-1 border-b last:border-0">
                <span className="font-mono">{stringId}</span>: 
                <span className="ml-2 text-text-secondary">{uuid}</span>
              </div>
            ))}
          </div>
        </ScrollArea>
      </Card>
      
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
          <h4 className="font-medium mb-2">Migration Actions</h4>
          <ScrollArea className="h-[200px]">
            <div className="space-y-2">
              {results.suggestions.map((suggestion, index) => (
                <Alert 
                  key={index} 
                  variant={suggestion.issue.includes('Automatic match') ? 'success' : 'default'}
                  className="text-sm"
                >
                  <AlertTitle>{suggestion.id}</AlertTitle>
                  <AlertDescription>
                    <strong>Issue:</strong> {suggestion.issue}<br />
                    <strong>Action:</strong> {suggestion.suggestion}
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
