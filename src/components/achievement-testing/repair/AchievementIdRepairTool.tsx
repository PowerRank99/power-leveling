
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Wrench, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { AchievementIdRepairService } from '@/services/testing/AchievementIdRepairService';
import { AchievementUtils } from '@/constants/achievements/AchievementUtils';
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
    valid: number;
    invalid: number;
    errors: string[];
  } | null>(null);
  
  const checkStringIds = async () => {
    try {
      // Validate string IDs
      const validation = await AchievementIdRepairService.validateAchievementStringIds();
      setValidationState(validation);
      
      if (validation.invalid === 0) {
        toast.success('All achievements have valid string IDs');
      } else {
        toast.error(`Found ${validation.invalid} achievements without string IDs`);
      }
    } catch (error) {
      console.error('Error checking achievement string IDs:', error);
      toast.error('Failed to check achievement string IDs');
    }
  };
  
  const repairStringIds = async () => {
    setIsRepairing(true);
    setRepairResult(null);
    
    try {
      const result = await AchievementIdRepairService.fixAllAchievementIdIssues();
      
      setRepairResult(result);
      
      if (result.success) {
        toast.success('Achievement string IDs repaired successfully', {
          description: result.message
        });
      } else {
        toast.error('Some issues could not be fixed', {
          description: result.message
        });
      }
      
      // Refresh validation state
      const validation = await AchievementIdRepairService.validateAchievementStringIds();
      setValidationState(validation);
      
      // Clear achievement cache to force refresh
      AchievementUtils.clearCache();
      
      // Notify parent component
      if (onRepairComplete) {
        onRepairComplete();
      }
    } catch (error) {
      console.error('Error repairing achievement string IDs:', error);
      setRepairResult({
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error'
      });
      toast.error('Failed to repair achievement string IDs');
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
          Fix missing or invalid achievement string IDs in the database
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {validationState && (
          <Alert variant={validationState.invalid > 0 ? "destructive" : "default"} className={validationState.invalid === 0 ? "border-green-600 text-green-600" : ""}>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Validation Results</AlertTitle>
            <AlertDescription>
              {validationState.invalid === 0 ? (
                <span>All {validationState.valid} achievements have valid string IDs</span>
              ) : (
                <span>Found {validationState.invalid} achievements without string IDs</span>
              )}
            </AlertDescription>
          </Alert>
        )}
        
        {repairResult && (
          <Alert variant={repairResult.success ? "default" : "destructive"} className={repairResult.success ? "border-green-600 text-green-600" : ""}>
            <CheckCircle className="h-4 w-4" />
            <AlertTitle>Repair Results</AlertTitle>
            <AlertDescription>
              {repairResult.message}
              {repairResult.details && (
                <div className="mt-2 text-xs">
                  <p>Validated: {repairResult.details.validated}</p>
                  <p>Generated: {repairResult.details.generated}</p>
                  {repairResult.details.errors.length > 0 && (
                    <p>Errors: {repairResult.details.errors.length}</p>
                  )}
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}
        
        <div className="flex space-x-2">
          <Button 
            onClick={checkStringIds} 
            variant="outline"
            className="flex-1"
          >
            Check String IDs
          </Button>
          
          <Button 
            onClick={repairStringIds}
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
                Repair String IDs
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AchievementIdRepairTool;
