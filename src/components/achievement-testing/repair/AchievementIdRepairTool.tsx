
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Wrench, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { AchievementIdRepairService } from '@/services/testing/AchievementIdRepairService';
import { AchievementIdMappingService } from '@/services/common/AchievementIdMappingService';
import { toast } from 'sonner';

interface AchievementIdRepairToolProps {
  userId: string;
  onRepairComplete?: () => void;
}

const AchievementIdRepairTool: React.FC<AchievementIdRepairToolProps> = ({ 
  userId,
  onRepairComplete
}) => {
  const [isRepairing, setIsRepairing] = useState(false);
  const [repairResult, setRepairResult] = useState<{
    success: boolean;
    message: string;
    details?: any;
  } | null>(null);
  const [validationState, setValidationState] = useState<{
    unmapped: string[];
    missingDatabaseEntries: string[];
  } | null>(null);
  
  const checkMappings = async () => {
    try {
      // Initialize mapping service if not already initialized
      await AchievementIdMappingService.initialize();
      
      // Validate mappings
      const validation = AchievementIdMappingService.validateMappings();
      setValidationState(validation);
      
      if (validation.unmapped.length === 0 && validation.missingDatabaseEntries.length === 0) {
        toast.success('All achievement IDs are properly mapped');
      } else {
        toast.error(`Found ${validation.unmapped.length} unmapped achievements`);
      }
    } catch (error) {
      console.error('Error checking achievement mappings:', error);
      toast.error('Failed to check achievement mappings');
    }
  };
  
  const repairMappings = async () => {
    setIsRepairing(true);
    setRepairResult(null);
    
    try {
      const result = await AchievementIdRepairService.fixAllAchievementIdIssues();
      
      setRepairResult(result);
      
      if (result.success) {
        toast.success('Achievement ID mappings repaired successfully', {
          description: result.message
        });
      } else {
        toast.error('Some issues could not be fixed', {
          description: result.message
        });
      }
      
      // Refresh validation state
      const validation = AchievementIdMappingService.validateMappings();
      setValidationState(validation);
      
      // Notify parent component
      if (onRepairComplete) {
        onRepairComplete();
      }
    } catch (error) {
      console.error('Error repairing achievement mappings:', error);
      setRepairResult({
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error'
      });
      toast.error('Failed to repair achievement mappings');
    } finally {
      setIsRepairing(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Wrench className="mr-2 h-5 w-5 text-arcane" />
          Achievement ID Repair
        </CardTitle>
        <CardDescription>
          Fix missing or broken achievement ID mappings that can cause test failures
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {validationState && (
          <Alert variant={validationState.unmapped.length > 0 ? "destructive" : "success"}>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Validation Results</AlertTitle>
            <AlertDescription>
              {validationState.unmapped.length === 0 ? (
                <span>All achievements have proper ID mappings</span>
              ) : (
                <span>Found {validationState.unmapped.length} unmapped achievements</span>
              )}
            </AlertDescription>
          </Alert>
        )}
        
        {repairResult && (
          <Alert variant={repairResult.success ? "success" : "warning"}>
            <CheckCircle className="h-4 w-4" />
            <AlertTitle>Repair Results</AlertTitle>
            <AlertDescription>
              {repairResult.message}
              {repairResult.details && (
                <div className="mt-2 text-xs">
                  <p>Mappings fixed: {repairResult.details.mappingsFixed}</p>
                  <p>Entries created: {repairResult.details.entriesCreated}</p>
                  {repairResult.details.mappingErrors.length > 0 && (
                    <p>Mapping errors: {repairResult.details.mappingErrors.length}</p>
                  )}
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}
        
        <div className="flex space-x-2">
          <Button 
            onClick={checkMappings} 
            variant="outline"
            className="flex-1"
          >
            Check Mappings
          </Button>
          
          <Button 
            onClick={repairMappings}
            disabled={isRepairing}
            variant="arcane"
            className="flex-1"
          >
            {isRepairing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Repairing...
              </>
            ) : (
              <>
                <Wrench className="mr-2 h-4 w-4" />
                Repair Mappings
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AchievementIdRepairTool;
