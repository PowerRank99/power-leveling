
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTestingDashboard } from '@/contexts/TestingDashboardContext';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  PlayCircle, FastForward, Clock, SkipForward, Activity, 
  Dumbbell, Calendar, Pause, Award, RotateCcw, Hourglass
} from 'lucide-react';
import { toast } from 'sonner';

const StepByStepSimulation: React.FC = () => {
  const { allAchievements, simulateAchievement } = useTestingDashboard();
  const [isRunning, setIsRunning] = useState(false);
  const [timeSpeed, setTimeSpeed] = useState(1);
  const [currentScenario, setCurrentScenario] = useState('workout-streak');
  const [currentStep, setCurrentStep] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  
  // Define test scenarios
  const scenarios = {
    'workout-streak': {
      name: 'Workout Streak',
      description: 'Simulate a user completing a 7-day workout streak',
      steps: [
        { type: 'workout', description: 'Day 1: Complete first workout', simulateAchievement: 'primeiro-treino' },
        { type: 'workout', description: 'Day 2: Complete second workout' },
        { type: 'workout', description: 'Day 3: Complete third workout', simulateAchievement: 'trinca-poderosa' },
        { type: 'workout', description: 'Day 4: Complete fourth workout' },
        { type: 'workout', description: 'Day 5: Complete fifth workout', simulateAchievement: 'embalo-fitness' },
        { type: 'workout', description: 'Day 6: Complete sixth workout' },
        { type: 'workout', description: 'Day 7: Complete seventh workout', simulateAchievement: 'semana-impecavel' }
      ]
    },
    'pr-progression': {
      name: 'Personal Record Progression',
      description: 'Simulate a user setting multiple personal records',
      steps: [
        { type: 'pr', description: 'Set first personal record', simulateAchievement: 'pr-first' },
        { type: 'pr', description: 'Set second personal record' },
        { type: 'pr', description: 'Set third personal record' },
        { type: 'pr', description: 'Set fourth personal record' },
        { type: 'pr', description: 'Set fifth personal record', simulateAchievement: 'recordista-experiente' }
      ]
    },
    'mixed-workouts': {
      name: 'Mixed Workout Types',
      description: 'Simulate completing different types of workouts',
      steps: [
        { type: 'workout', description: 'Complete strength workout' },
        { type: 'manual', description: 'Complete cardio workout', simulateAchievement: 'diario-do-suor' },
        { type: 'workout', description: 'Complete mobility workout' },
        { type: 'manual', description: 'Complete sports activity', simulateAchievement: 'esporte-de-primeira' },
        { type: 'workout', description: 'Complete calisthenics workout', simulateAchievement: 'aventuras-fitness' }
      ]
    }
  };
  
  const selectedScenario = scenarios[currentScenario as keyof typeof scenarios];
  const currentStepData = selectedScenario.steps[currentStep];
  
  // Start simulation
  const startSimulation = () => {
    setIsRunning(true);
    setCurrentStep(0);
    setElapsedTime(0);
    toast.info('Simulation started', {
      description: `Running "${selectedScenario.name}" step by step`
    });
    runStep(0);
  };
  
  // Run a specific step
  const runStep = (stepIndex: number) => {
    if (stepIndex >= selectedScenario.steps.length) {
      // Simulation complete
      setIsRunning(false);
      toast.success('Simulation complete', {
        description: `Completed "${selectedScenario.name}" simulation`
      });
      return;
    }
    
    setCurrentStep(stepIndex);
    
    // Get the step data
    const step = selectedScenario.steps[stepIndex];
    
    // If the step should trigger an achievement, simulate it
    if (step.simulateAchievement) {
      const achievement = allAchievements.find(a => a.id === step.simulateAchievement);
      if (achievement) {
        setTimeout(() => {
          simulateAchievement(step.simulateAchievement as string);
        }, 1000 / timeSpeed);
      }
    }
    
    // Show toast for the step
    toast.info(`Step ${stepIndex + 1}: ${step.type.toUpperCase()}`, {
      description: step.description
    });
  };
  
  // Go to next step
  const nextStep = () => {
    if (currentStep < selectedScenario.steps.length - 1) {
      runStep(currentStep + 1);
    } else {
      setIsRunning(false);
      toast.success('Simulation complete', {
        description: `Completed "${selectedScenario.name}" simulation`
      });
    }
  };
  
  // Stop simulation
  const stopSimulation = () => {
    setIsRunning(false);
    toast.info('Simulation stopped');
  };
  
  // Reset simulation
  const resetSimulation = () => {
    setIsRunning(false);
    setCurrentStep(0);
    setElapsedTime(0);
    toast.info('Simulation reset');
  };
  
  // Get step icon based on type
  const getStepIcon = (type: string) => {
    switch (type) {
      case 'workout':
        return <Dumbbell className="h-4 w-4" />;
      case 'pr':
        return <Activity className="h-4 w-4" />;
      case 'manual':
        return <Calendar className="h-4 w-4" />;
      default:
        return <Award className="h-4 w-4" />;
    }
  };
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center text-lg">
          <Hourglass className="mr-2 h-5 w-5 text-arcane" />
          Step-by-Step Simulation
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Select Scenario</label>
          <Select 
            value={currentScenario} 
            onValueChange={setCurrentScenario}
            disabled={isRunning}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a scenario" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(scenarios).map(([key, scenario]) => (
                <SelectItem key={key} value={key}>
                  {scenario.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Alert className="mt-2 bg-midnight-elevated border-divider/30">
            <AlertTitle>{selectedScenario.name}</AlertTitle>
            <AlertDescription>
              {selectedScenario.description}
            </AlertDescription>
          </Alert>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium">Simulation Speed</label>
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              <span className="text-sm">{timeSpeed}x</span>
            </div>
          </div>
          <Slider
            value={[timeSpeed]}
            min={0.5}
            max={5}
            step={0.5}
            onValueChange={value => setTimeSpeed(value[0])}
            disabled={isRunning}
          />
        </div>
        
        <div className="border border-divider/30 rounded-md bg-midnight-card p-3">
          <div className="flex justify-between items-center mb-3">
            <div className="font-medium">Current Progress</div>
            <Badge variant={isRunning ? 'arcane' : 'outline'}>
              {isRunning ? 'Running' : 'Ready'}
            </Badge>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-text-secondary">
              <span>Step {currentStep + 1} of {selectedScenario.steps.length}</span>
              <span>{Math.round((currentStep / selectedScenario.steps.length) * 100)}% complete</span>
            </div>
            
            <div className="w-full bg-midnight-elevated rounded-full h-2">
              <div 
                className="bg-arcane rounded-full h-2"
                style={{ width: `${(currentStep / selectedScenario.steps.length) * 100}%` }}
              ></div>
            </div>
          </div>
          
          {currentStepData && (
            <div className="mt-4 p-3 border border-arcane-30 bg-arcane-15 rounded-md">
              <div className="flex items-center">
                {getStepIcon(currentStepData.type)}
                <span className="ml-2 font-medium capitalize">{currentStepData.type}</span>
                {currentStepData.simulateAchievement && (
                  <Badge className="ml-auto">Achievement</Badge>
                )}
              </div>
              <p className="mt-1 text-sm">{currentStepData.description}</p>
            </div>
          )}
          
          <div className="flex justify-between mt-4">
            <div className="space-x-2">
              {isRunning ? (
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={stopSimulation}
                >
                  <Pause className="h-4 w-4 mr-1" />
                  Pause
                </Button>
              ) : (
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={resetSimulation}
                >
                  <RotateCcw className="h-4 w-4 mr-1" />
                  Reset
                </Button>
              )}
            </div>
            
            <div className="space-x-2">
              {isRunning ? (
                <Button 
                  size="sm"
                  onClick={nextStep}
                >
                  <SkipForward className="h-4 w-4 mr-1" />
                  Next Step
                </Button>
              ) : (
                <Button 
                  size="sm"
                  onClick={startSimulation}
                >
                  <PlayCircle className="h-4 w-4 mr-1" />
                  Start Simulation
                </Button>
              )}
              
              <Button 
                variant="arcane"
                size="sm"
                onClick={() => {
                  setIsRunning(true);
                  // Run all steps with a delay between them
                  for (let i = 0; i < selectedScenario.steps.length; i++) {
                    setTimeout(() => {
                      runStep(i);
                      
                      // Check if last step
                      if (i === selectedScenario.steps.length - 1) {
                        setIsRunning(false);
                      }
                    }, (1500 / timeSpeed) * i);
                  }
                }}
                disabled={isRunning}
              >
                <FastForward className="h-4 w-4 mr-1" />
                Run All
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StepByStepSimulation;
