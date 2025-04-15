
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Database, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { AchievementMigrationService } from '@/services/migrations/AchievementMigrationService';
import { AchievementUtils } from '@/constants/achievements/AchievementUtils';
import { toast } from 'sonner';

interface AchievementMigrationToolProps {
  userId: string;
  onMigrationComplete?: () => void;
}

const AchievementMigrationTool: React.FC<AchievementMigrationToolProps> = ({ 
  userId,
  onMigrationComplete
}) => {
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationResult, setMigrationResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  
  const performMigration = async () => {
    setIsMigrating(true);
    setMigrationResult(null);
    
    try {
      const result = await AchievementMigrationService.migrateFromMappingsToDatabase();
      
      setMigrationResult(result);
      
      if (result.success) {
        toast.success('Migration completed successfully', {
          description: result.message
        });
        
        // Clear achievement cache to force refresh
        AchievementUtils.clearCache();
        
        // Notify parent component
        if (onMigrationComplete) {
          onMigrationComplete();
        }
      } else {
        toast.error('Migration failed', {
          description: result.message
        });
      }
    } catch (error) {
      console.error('Error during migration:', error);
      setMigrationResult({
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error'
      });
      toast.error('Migration failed');
    } finally {
      setIsMigrating(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Database className="mr-2 h-5 w-5 text-arcane" />
          Achievement Database Migration
        </CardTitle>
        <CardDescription>
          Migrate achievement system to use the database as the source of truth
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <Alert variant="warning">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Important</AlertTitle>
          <AlertDescription>
            This will migrate the achievement system to use the database as the source of truth.
            Make sure all achievements have string IDs in the database before proceeding.
          </AlertDescription>
        </Alert>
        
        {migrationResult && (
          <Alert variant={migrationResult.success ? "default" : "destructive"} className={migrationResult.success ? "border-green-600 text-green-600" : ""}>
            <CheckCircle className="h-4 w-4" />
            <AlertTitle>Migration Results</AlertTitle>
            <AlertDescription>
              {migrationResult.message}
            </AlertDescription>
          </Alert>
        )}
        
        <Button 
          onClick={performMigration}
          disabled={isMigrating}
          variant="arcane"
          className="w-full"
        >
          {isMigrating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Migrating...
            </>
          ) : (
            <>
              <Database className="mr-2 h-4 w-4" />
              Perform Migration
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default AchievementMigrationTool;
