
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AchievementMigrationService } from '@/services/rpg/achievements/migration/AchievementMigrationService';
import { AchievementIdentifierService } from '@/services/rpg/achievements/AchievementIdentifierService';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle, CheckCircle, RefreshCw, Shield } from 'lucide-react';

interface ValidationResult {
  success: boolean;
  total: number;
  valid: number;
  invalid: number;
  missingStringId: number;
  duplicateStringId: number;
  message: string;
  invalidItems?: any[];
}

interface MigrationResult {
  success: boolean;
  added: number;
  total: number;
  missingAfter: number;
  message: string;
}

const AchievementMigrationManager: React.FC = () => {
  const { toast } = useToast();
  const [isValidating, setIsValidating] = useState(false);
  const [isMigrating, setIsMigrating] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [migrationResult, setMigrationResult] = useState<MigrationResult | null>(null);
  
  const handleValidate = async () => {
    setIsValidating(true);
    try {
      const result = await AchievementMigrationService.validateAchievementConsistency();
      setValidationResult(result);
      
      toast({
        title: result.success ? 'Validation Complete' : 'Validation Failed',
        description: result.message,
        variant: result.success ? 'default' : 'destructive'
      });
    } catch (error) {
      toast({
        title: 'Validation Error',
        description: `An unexpected error occurred: ${error instanceof Error ? error.message : String(error)}`,
        variant: 'destructive'
      });
    } finally {
      setIsValidating(false);
    }
  };
  
  const handleMigrate = async () => {
    setIsMigrating(true);
    try {
      const result = await AchievementMigrationService.migrateStringIds();
      setMigrationResult(result);
      
      toast({
        title: result.success ? 'Migration Complete' : 'Migration Failed',
        description: result.message,
        variant: result.success ? 'default' : 'destructive'
      });
      
      // Clear identifier cache to ensure fresh data
      AchievementIdentifierService.clearCache();
      
      // Run validation again
      await handleValidate();
    } catch (error) {
      toast({
        title: 'Migration Error',
        description: `An unexpected error occurred: ${error instanceof Error ? error.message : String(error)}`,
        variant: 'destructive'
      });
    } finally {
      setIsMigrating(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Achievement Migration Manager
          </CardTitle>
          <CardDescription>
            Validate and repair achievement data to ensure consistency between string IDs and UUIDs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 mb-4">
            <div className="flex gap-2 items-center justify-between">
              <div>
                <h3 className="text-md font-semibold">Achievement Data Validation</h3>
                <p className="text-sm text-muted-foreground">
                  Check achievement data for consistency and completeness
                </p>
              </div>
              <Button 
                onClick={handleValidate} 
                disabled={isValidating}
                variant="outline" 
                className="whitespace-nowrap"
              >
                {isValidating ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Validating...
                  </>
                ) : (
                  'Validate Achievements'
                )}
              </Button>
            </div>
            
            {validationResult && (
              <div className="rounded-md border p-4">
                <div className="flex items-center gap-4 mb-2">
                  {validationResult.success ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  )}
                  <span className="font-medium">{validationResult.message}</span>
                </div>
                
                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge variant="outline">
                    Total: {validationResult.total}
                  </Badge>
                  <Badge variant={validationResult.valid === validationResult.total ? 'success' : 'outline'}>
                    Valid: {validationResult.valid}
                  </Badge>
                  <Badge variant={validationResult.invalid > 0 ? 'destructive' : 'outline'}>
                    Invalid: {validationResult.invalid}
                  </Badge>
                  <Badge variant={validationResult.missingStringId > 0 ? 'destructive' : 'outline'}>
                    Missing String ID: {validationResult.missingStringId}
                  </Badge>
                  <Badge variant={validationResult.duplicateStringId > 0 ? 'destructive' : 'outline'}>
                    Duplicate String ID: {validationResult.duplicateStringId}
                  </Badge>
                </div>
                
                {validationResult.invalidItems && validationResult.invalidItems.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-semibold mb-2">Issues Found:</h4>
                    <div className="max-h-40 overflow-y-auto text-xs">
                      {validationResult.invalidItems.map((item, index) => (
                        <div key={index} className="mb-2 p-2 rounded bg-muted">
                          <div>ID: {item.id}</div>
                          <div>Name: {item.name || 'Missing'}</div>
                          <div>Issues: {item.issues?.join(', ') || 'Unknown'}</div>
                          {item.duplicates && (
                            <div>
                              Duplicates: {item.duplicates.map((d: any) => d.name).join(', ')}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <Separator className="my-4" />
          
          <div className="grid gap-4">
            <div className="flex gap-2 items-center justify-between">
              <div>
                <h3 className="text-md font-semibold">Achievement Migration</h3>
                <p className="text-sm text-muted-foreground">
                  Generate missing string IDs and ensure database consistency
                </p>
              </div>
              <Button 
                onClick={handleMigrate} 
                disabled={isMigrating}
                variant="default" 
                className="whitespace-nowrap"
              >
                {isMigrating ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Migrating...
                  </>
                ) : (
                  'Run Migration'
                )}
              </Button>
            </div>
            
            {migrationResult && (
              <div className="rounded-md border p-4">
                <div className="flex items-center gap-4 mb-2">
                  {migrationResult.success ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  )}
                  <span className="font-medium">{migrationResult.message}</span>
                </div>
                
                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge variant="outline">
                    Total: {migrationResult.total}
                  </Badge>
                  <Badge variant="outline">
                    Added: {migrationResult.added}
                  </Badge>
                  <Badge variant={migrationResult.missingAfter > 0 ? 'destructive' : 'outline'}>
                    Still Missing: {migrationResult.missingAfter}
                  </Badge>
                </div>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <p className="text-xs text-muted-foreground">
            After running migrations, validation will automatically run again to confirm success
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AchievementMigrationManager;
