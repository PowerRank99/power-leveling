import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Dumbbell } from 'lucide-react';
import { XPCalculationService } from '@/services/rpg/XPCalculationService';

interface WorkoutSimulationProps {
  userId: string;
  addLogEntry: (action: string, details: string) => void;
}

const WorkoutSimulation: React.FC<WorkoutSimulationProps> = ({ userId, addLogEntry }) => {
  const [workoutType, setWorkoutType] = useState('strength');
  const [duration, setDuration] = useState(45);
  const [exerciseCount, setExerciseCount] = useState(5);
  const [includePersonalRecord, setIncludePersonalRecord] = useState(false);
  const [streak, setStreak] = useState(0);
  const [useClassPassives, setUseClassPassives] = useState(false);
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [totalXP, setTotalXP] = useState(0);
  const [loading, setLoading] = useState(false);
  const [xpBreakdown, setXpBreakdown] = useState({
    timeXP: 0,
    exerciseXP: 0,
    setXP: 0,
    streakMultiplier: 1,
    prBonus: 0,
    baseXP: 0
  });
  const [bonusBreakdown, setBonusBreakdown] = useState<Array<{skill: string, amount: number, description: string}>>([]);

  const exerciseTypes = [
    { id: 'strength', name: 'Strength Training' },
    { id: 'bodyweight', name: 'Bodyweight/Calisthenics' },
    { id: 'cardio', name: 'Cardio' },
    { id: 'sports', name: 'Sports' },
    { id: 'flexibility', name: 'Flexibility & Mobility' },
    { id: 'hiit', name: 'HIIT Training' }
  ];

  const classes = ['Guerreiro', 'Monge', 'Ninja', 'Bruxo', 'Paladino', 'Druida'];

  const getExerciseNameForType = (type: string): string => {
    switch (type) {
      case 'strength':
        return 'Bench Press';
      case 'bodyweight':
        return 'Pull-up';
      case 'cardio':
        return 'Running';
      case 'sports':
        return 'Basketball';
      case 'flexibility':
        return 'Yoga Flow';
      default:
        return 'Basic Exercise';
    }
  };

  useEffect(() => {
    calculatePotentialXP();
  }, [workoutType, duration, exerciseCount, includePersonalRecord, streak, useClassPassives, selectedClass]);

  const calculatePotentialXP = () => {
    const durationSeconds = duration * 60;
    
    const mockWorkout = {
      id: 'simulation',
      exercises: Array(exerciseCount).fill({}).map((_, i) => ({
        id: `mock-ex-${i}`,
        name: getExerciseNameForType(workoutType),
        category: workoutType,
        exerciseId: `mock-exercise-id-${i}`,
        sets: Array(3).fill({
          id: 'mock-set',
          completed: true
        })
      })),
      durationSeconds,
      hasPR: includePersonalRecord
    };
    
    const result = XPCalculationService.calculateWorkoutXP({
      workout: mockWorkout,
      userClass: useClassPassives ? selectedClass : null,
      streak,
      defaultDifficulty: 'intermediario',
      userId: userId
    });
    
    const timeXP = result.components?.timeXP || 0;
    const exerciseXP = result.components?.exerciseXP || 0;
    const setXP = result.components?.setsXP || 0;
    const prBonus = includePersonalRecord ? XPCalculationService.PR_BONUS_XP : 0;
    const baseXP = timeXP + exerciseXP + setXP + prBonus;
    const streakMultiplier = XPCalculationService.getStreakMultiplier(streak);
    
    setTotalXP(result.totalXP);
    setXpBreakdown({
      timeXP,
      exerciseXP,
      setXP,
      streakMultiplier,
      prBonus,
      baseXP
    });
    setBonusBreakdown(result.bonusBreakdown || []);
  };

  const simulateWorkout = async () => {
    setLoading(true);
    try {
      const classBonus = useClassPassives ? `Class: ${selectedClass}` : 'No class bonus';
      const workoutDetails = `Type: ${workoutType}, Duration: ${duration}min, Exercises: ${exerciseCount}, PR: ${includePersonalRecord ? 'Yes' : 'No'}, Streak: ${streak}, ${classBonus}`;
      
      addLogEntry('Workout Simulated', workoutDetails);
      addLogEntry('XP Awarded', `${totalXP} XP`);
      
      if (bonusBreakdown.length > 0) {
        bonusBreakdown.forEach(bonus => {
          addLogEntry('Bonus Applied', `${bonus.skill}: +${bonus.amount} XP (${bonus.description})`);
        });
      }
      
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error('Simulation error:', error);
      addLogEntry('Simulation Error', String(error));
    } finally {
      setLoading(false);
    }
  };

  const getClassSpecificDescription = () => {
    if (!useClassPassives || !selectedClass) return "No class selected";
    
    const relevantBonuses = bonusBreakdown
      .filter(bonus => bonus.skill.includes(selectedClass))
      .map(bonus => `${bonus.skill}: ${bonus.description} (+${bonus.amount} XP)`);
    
    return relevantBonuses.join(', ') || "No applicable bonuses for this workout";
  };

  return (
    <Card className="premium-card border-arcane-30 shadow-glow-subtle">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-orbitron flex items-center">
          <Dumbbell className="mr-2 h-5 w-5 text-arcane" />
          Workout Simulation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="workoutType">Workout Type</Label>
              <Select value={workoutType} onValueChange={setWorkoutType}>
                <SelectTrigger id="workoutType" className="bg-midnight-elevated border-divider">
                  <SelectValue placeholder="Select workout type" />
                </SelectTrigger>
                <SelectContent>
                  {exerciseTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes): {duration}</Label>
              <Slider
                id="duration"
                min={10}
                max={120}
                step={5}
                value={[duration]}
                onValueChange={(values) => setDuration(values[0])}
                className="py-4"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="exerciseCount">Exercise Count: {exerciseCount}</Label>
              <Slider
                id="exerciseCount"
                min={1}
                max={15}
                step={1}
                value={[exerciseCount]}
                onValueChange={(values) => setExerciseCount(values[0])}
                className="py-4"
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="streakSlider">
                  Streak: {streak} day{streak !== 1 ? 's' : ''}
                </Label>
                <span className="text-sm font-space text-arcane">
                  ({(xpBreakdown.streakMultiplier).toFixed(2)}x multiplier)
                </span>
              </div>
              <Slider
                id="streakSlider"
                min={0}
                max={14}
                step={1}
                value={[streak]}
                onValueChange={(values) => setStreak(values[0])}
                className="py-4"
              />
            </div>
            
            <div className="flex items-center space-x-2 pt-2">
              <Switch
                id="includePersonalRecord"
                checked={includePersonalRecord}
                onCheckedChange={setIncludePersonalRecord}
              />
              <Label htmlFor="includePersonalRecord">Include Personal Record (+{XPCalculationService.PR_BONUS_XP} XP)</Label>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Switch
                  id="enableClassPassives"
                  checked={useClassPassives}
                  onCheckedChange={setUseClassPassives}
                />
                <Label htmlFor="enableClassPassives">Enable Class Passives</Label>
              </div>
              
              {useClassPassives && (
                <div className="pl-6 border-l-2 border-arcane-30">
                  <Label htmlFor="classSelect">Selected Class</Label>
                  <Select 
                    value={selectedClass || ''} 
                    onValueChange={setSelectedClass}
                  >
                    <SelectTrigger id="classSelect" className="bg-midnight-elevated border-divider mt-1">
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                    <SelectContent>
                      {classes.map((className) => (
                        <SelectItem key={className} value={className}>
                          {className}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>
          
          <div className="space-y-4 flex flex-col">
            <div className="bg-midnight-card border border-divider/30 rounded-lg p-4 space-y-4 flex-grow">
              <h3 className="font-orbitron text-text-primary">XP Calculation</h3>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-text-secondary">Time XP:</span>
                  <span className="font-space">{xpBreakdown.timeXP}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Exercise XP ({exerciseCount} × {XPCalculationService.BASE_EXERCISE_XP}):</span>
                  <span className="font-space">{xpBreakdown.exerciseXP}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Set XP:</span>
                  <span className="font-space">{xpBreakdown.setXP}</span>
                </div>
                {includePersonalRecord && (
                  <div className="flex justify-between">
                    <span className="text-text-secondary">PR Bonus:</span>
                    <span className="font-space">{xpBreakdown.prBonus}</span>
                  </div>
                )}
                <div className="border-t border-divider pt-2 mt-2">
                  <div className="flex justify-between font-bold">
                    <span className="text-text-primary">Base XP:</span>
                    <span className="font-space">{xpBreakdown.baseXP}</span>
                  </div>
                </div>
                
                {streak > 0 && (
                  <div className="flex justify-between text-arcane">
                    <span>Streak Multiplier ({streak} days):</span>
                    <span className="font-space">×{xpBreakdown.streakMultiplier.toFixed(2)}</span>
                  </div>
                )}
                
                {bonusBreakdown.length > 0 && (
                  <div className="space-y-1 mt-2">
                    <h4 className="text-xs text-text-tertiary uppercase">Class Bonuses:</h4>
                    {bonusBreakdown.map((bonus, i) => (
                      <div key={i} className="flex justify-between text-success">
                        <span className="text-sm">{bonus.skill}:</span>
                        <span className="font-space">+{bonus.amount}</span>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="border-t border-divider pt-2 mt-2">
                  <div className="flex justify-between text-lg font-bold">
                    <span className="text-text-primary">Total XP:</span>
                    <span className="font-space text-arcane">{totalXP}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <Button 
              onClick={simulateWorkout} 
              className="w-full h-12 text-base" 
              disabled={loading || !userId}
              variant="arcane"
            >
              {loading ? 'Simulating...' : 'Simulate Workout'}
            </Button>
          </div>
        </div>
        
        <div className="mt-4 p-4 bg-midnight-card rounded-lg border border-divider/20">
          <h3 className="font-semibold mb-2">Class Bonus Guide:</h3>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-text-secondary">
            <li>• Guerreiro: +20% XP from strength training, +15% XP for PR</li>
            <li>• Monge: +20% XP from bodyweight, +10% streak bonus</li>
            <li>• Ninja: +20% XP from cardio, +40% XP for workouts under 45min</li>
            <li>• Bruxo: Reduced streak loss, +50% achievement points</li>
            <li>• Paladino: +40% XP from sports, +10% guild contribution</li>
            <li>• Druida: +40% XP from flexibility, +50% XP after rest day</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default WorkoutSimulation;
