
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { 
  Play, Pause, SkipForward, AlertTriangle, Check, 
  X, Clock, RotateCcw, Award, Trophy, ListChecks
} from 'lucide-react';
import { useTestingDashboard } from '@/contexts/TestingDashboardContext';
import { toast } from 'sonner';

interface TestStep {
  id: string;
  type: 'achievement' | 'workout' | 'manual_workout' | 'pr' | 'guild' | 'class' | 'pause';
  config: Record<string, any>;
  description: string;
}

interface TestSequence {
  id: string;
  name: string;
  description: string;
  steps: TestStep[];
  createdAt: Date;
  lastRun?: Date;
}

interface SequenceRunnerProps {
  sequence: TestSequence;
  userId: string;
  onComplete: () => void;
  onCancel: () => void;
}

interface StepResult {
  stepId: string;
  success: boolean;
  message: string;
  details?: string;
}

const SequenceRunner: React.FC<SequenceRunnerProps> = ({
  sequence,
  userId,
  onComplete,
  onCancel
}) => {
  const { allAchievements, simulateAchievement, logAction } = useTestingDashboard();
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [results, setResults] = useState<StepResult[]>([]);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  
  // Effect to update elapsed time
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (isRunning && !isPaused && startTime) {
      timer = setInterval(() => {
        const now = new Date();
        setElapsedTime(Math.floor((now.getTime() - startTime.getTime()) / 1000));
      }, 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRunning, isPaused, startTime]);
  
  // Start the sequence run
  const startSequence = () => {
    setIsRunning(true);
    setCurrentStepIndex(-1);
    setResults([]);
    setStartTime(new Date());
    setEndTime(null);
    
    // Log action
    logAction('Sequence Started', `Running sequence: ${sequence.name}`);
    
    // Run the first step after a short delay
    setTimeout(() => {
      runNextStep();
    }, 500);
  };
  
  // Pause/resume the sequence
  const togglePause = () => {
    setIsPaused(!isPaused);
  };
  
  // Skip to the next step
  const skipStep = () => {
    if (currentStepIndex >= 0 && currentStepIndex < sequence.steps.length) {
      const step = sequence.steps[currentStepIndex];
      
      // Add a skipped result
      setResults(prev => [...prev, {
        stepId: step.id,
        success: false,
        message: 'Skipped',
        details: 'User skipped this step'
      }]);
      
      // Log action
      logAction('Step Skipped', `Skipped step: ${step.description}`);
      
      // Move to next step
      runNextStep();
    }
  };
  
  // Run the next step in the sequence
  const runNextStep = () => {
    // If paused, don't proceed
    if (isPaused) return;
    
    const nextIndex = currentStepIndex + 1;
    
    // Check if we've reached the end
    if (nextIndex >= sequence.steps.length) {
      completeSequence();
      return;
    }
    
    // Update current step
    setCurrentStepIndex(nextIndex);
    
    // Get the step to run
    const step = sequence.steps[nextIndex];
    
    // Log action
    logAction('Running Step', `Step ${nextIndex + 1}/${sequence.steps.length}: ${step.description}`);
    
    // Execute the step
    executeStep(step, nextIndex)
      .then(result => {
        // Add result
        setResults(prev => [...prev, result]);
        
        // If it's a pause step, wait for the specified duration
        if (step.type === 'pause') {
          const pauseDuration = step.config.durationMs || 1000;
          setTimeout(() => {
            runNextStep();
          }, pauseDuration);
        } else {
          // Go to next step after a small delay
          setTimeout(() => {
            runNextStep();
          }, 500);
        }
      })
      .catch(error => {
        // Handle error
        const errorResult: StepResult = {
          stepId: step.id,
          success: false,
          message: 'Error',
          details: error instanceof Error ? error.message : 'Unknown error'
        };
        
        setResults(prev => [...prev, errorResult]);
        
        // Log error
        logAction('Step Error', `Error in step ${nextIndex + 1}: ${errorResult.details}`);
        
        // Continue to next step after a delay
        setTimeout(() => {
          runNextStep();
        }, 1000);
      });
  };
  
  // Execute a specific step
  const executeStep = async (step: TestStep, index: number): Promise<StepResult> => {
    // In a real implementation, this would perform actual operations
    // For this example, we'll simulate the actions
    
    try {
      // Simulate a short delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      switch (step.type) {
        case 'achievement': {
          const achievementId = step.config.achievementId;
          if (!achievementId) {
            return {
              stepId: step.id,
              success: false,
              message: 'Failed',
              details: 'Missing achievement ID'
            };
          }
          
          // Get the achievement
          const achievement = allAchievements.find(a => a.id === achievementId);
          if (achievement) {
            // Simulate the achievement
            simulateAchievement(achievementId);
            
            return {
              stepId: step.id,
              success: true,
              message: 'Achievement Simulated',
              details: `Simulated achievement: ${achievement.name}`
            };
          } else {
            return {
              stepId: step.id,
              success: false,
              message: 'Failed',
              details: `Achievement not found: ${achievementId}`
            };
          }
        }
          
        case 'workout': {
          // Simulate a workout
          const { exerciseCount, setCount, durationMinutes } = step.config;
          
          return {
            stepId: step.id,
            success: true,
            message: 'Workout Simulated',
            details: `Created workout with ${exerciseCount} exercises, ${setCount} sets, ${durationMinutes} minutes`
          };
        }
          
        case 'manual_workout': {
          // Simulate a manual workout
          const { description, activityType, xpAwarded } = step.config;
          
          return {
            stepId: step.id,
            success: true,
            message: 'Manual Workout Simulated',
            details: `Created manual workout: ${description} (${activityType}), ${xpAwarded} XP`
          };
        }
          
        case 'pr': {
          // Simulate a personal record
          const { exerciseId, weight, previousWeight } = step.config;
          
          return {
            stepId: step.id,
            success: true,
            message: 'PR Simulated',
            details: `Created personal record: ${previousWeight} -> ${weight}`
          };
        }
          
        case 'guild': {
          // Simulate a guild action
          const { action, guildId } = step.config;
          
          return {
            stepId: step.id,
            success: true,
            message: 'Guild Action Simulated',
            details: `${action === 'join' ? 'Joined' : action === 'create' ? 'Created' : 'Left'} guild`
          };
        }
          
        case 'class': {
          // Simulate class change
          const { className } = step.config;
          
          return {
            stepId: step.id,
            success: true,
            message: 'Class Changed',
            details: `Changed class to ${className}`
          };
        }
          
        case 'pause': {
          // Just a pause, no actual operation
          const { durationMs } = step.config;
          
          return {
            stepId: step.id,
            success: true,
            message: 'Paused',
            details: `Paused for ${durationMs / 1000} seconds`
          };
        }
          
        default:
          return {
            stepId: step.id,
            success: false,
            message: 'Unknown Step Type',
            details: `Unknown step type: ${step.type}`
          };
      }
    } catch (error) {
      return {
        stepId: step.id,
        success: false,
        message: 'Error',
        details: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  };
  
  // Complete the sequence
  const completeSequence = () => {
    setIsRunning(false);
    setIsPaused(false);
    setEndTime(new Date());
    
    // Update the sequence with last run date
    const updatedSequence = {
      ...sequence,
      lastRun: new Date()
    };
    
    // Get success rate
    const successCount = results.filter(r => r.success).length;
    const totalSteps = sequence.steps.length;
    const successRate = totalSteps > 0 ? (successCount / totalSteps) * 100 : 0;
    
    // Log completion
    logAction('Sequence Completed', `Completed with ${successCount}/${totalSteps} steps successful (${successRate.toFixed(1)}%)`);
    
    // Notify user
    toast.success('Test sequence completed', {
      description: `Completed with ${successCount}/${totalSteps} steps successful (${successRate.toFixed(1)}%)`
    });
    
    // Notify parent component
    onComplete();
  };
  
  // Cancel the sequence
  const cancelSequence = () => {
    setIsRunning(false);
    setIsPaused(false);
    
    // Log cancellation
    logAction('Sequence Cancelled', `Cancelled after ${currentStepIndex + 1}/${sequence.steps.length} steps`);
    
    // Notify parent component
    onCancel();
  };
  
  // Format elapsed time
  const formatElapsedTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Calculate progress percentage
  const progressPercentage = sequence.steps.length > 0
    ? ((currentStepIndex + 1) / sequence.steps.length) * 100
    : 0;
    
  // Get results summary
  const successCount = results.filter(r => r.success).length;
  const failureCount = results.filter(r => !r.success).length;
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center text-lg">
          <ListChecks className="mr-2 h-5 w-5 text-arcane" />
          Sequence Runner: {sequence.name}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Progress information */}
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <div className="flex items-center">
              <Badge 
                variant={isRunning ? (isPaused ? 'outline' : 'arcane') : 'outline'}
                className="mr-2"
              >
                {!isRunning ? 'Ready' : isPaused ? 'Paused' : 'Running'}
              </Badge>
              
              {isRunning && (
                <div className="flex items-center text-text-secondary">
                  <Clock className="h-3 w-3 mr-1" />
                  {formatElapsedTime(elapsedTime)}
                </div>
              )}
            </div>
            
            <div className="flex items-center">
              Step {currentStepIndex + 1} of {sequence.steps.length}
            </div>
          </div>
          
          <Progress value={progressPercentage} className="h-1.5" />
          
          {results.length > 0 && (
            <div className="flex justify-between text-xs text-text-secondary">
              <div>
                <span className="text-success">{successCount} succeeded</span>
                {failureCount > 0 && (
                  <span className="ml-2 text-valor">{failureCount} failed</span>
                )}
              </div>
              <div>
                {((successCount / results.length) * 100).toFixed(0)}% success rate
              </div>
            </div>
          )}
        </div>
        
        {/* Current step */}
        {isRunning && currentStepIndex >= 0 && currentStepIndex < sequence.steps.length && (
          <div className="border border-arcane-30 rounded-md p-3 bg-arcane-15">
            <div className="font-medium mb-1">Current Step</div>
            <div className="flex justify-between">
              <div>
                <Badge className="capitalize mb-1">
                  {sequence.steps[currentStepIndex].type.replace('_', ' ')}
                </Badge>
                <div className="text-sm">
                  {sequence.steps[currentStepIndex].description}
                </div>
              </div>
              
              {isRunning && (
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 px-2"
                    onClick={togglePause}
                  >
                    {isPaused ? (
                      <Play className="h-4 w-4" />
                    ) : (
                      <Pause className="h-4 w-4" />
                    )}
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 px-2"
                    onClick={skipStep}
                    disabled={isPaused}
                  >
                    <SkipForward className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Results */}
        {results.length > 0 && (
          <div className="border border-divider/30 rounded-md overflow-hidden">
            <div className="max-h-[200px] overflow-y-auto">
              {results.map((result, index) => {
                const step = sequence.steps.find(s => s.id === result.stepId);
                
                return (
                  <div 
                    key={index}
                    className={`p-2 border-b border-divider/30 ${
                      index % 2 === 0 ? 'bg-midnight-elevated/30' : ''
                    }`}
                  >
                    <div className="flex justify-between">
                      <div className="flex items-center">
                        {result.success ? (
                          <Check className="h-4 w-4 text-success mr-2" />
                        ) : (
                          <X className="h-4 w-4 text-valor mr-2" />
                        )}
                        <div className="text-sm font-medium">
                          Step {index + 1}: {step?.description || 'Unknown Step'}
                        </div>
                      </div>
                      <Badge 
                        variant={result.success ? 'outline' : 'destructive'}
                        className="text-xs"
                      >
                        {result.message}
                      </Badge>
                    </div>
                    
                    {result.details && (
                      <div className="text-xs text-text-secondary ml-6 mt-1">
                        {result.details}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
        
        {/* Controls */}
        <div className="flex justify-between">
          {!isRunning ? (
            <Button onClick={startSequence}>
              <Play className="h-4 w-4 mr-2" />
              Start Sequence
            </Button>
          ) : (
            <Button 
              variant="destructive"
              onClick={cancelSequence}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SequenceRunner;
