import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { XPService } from '@/services/rpg/XPService';
import { XPCalculationService } from '@/services/rpg/XPCalculationService';
import { AchievementService } from '@/services/rpg/AchievementService';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Dumbbell, Check, Award } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import StreakSlider from './common/StreakSlider';
import ClassPassivesToggle from './common/ClassPassivesToggle';

interface WorkoutSimulationProps {
  userId: string;
  addLogEntry: (action: string, details: string) => void;
}

const WorkoutSimulation: React.FC<WorkoutSimulationProps> = ({ userId, addLogEntry }) => {
  const [workoutType, setWorkoutType] = useState('strength');
  const [duration, setDuration] = useState(45);
  const [exerciseCount, setExerciseCount] = useState(5);
  const [difficultyLevel, setDifficultyLevel] = useState('intermediario');
  const [includePersonalRecord, setIncludePersonalRecord] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [streak, setStreak] = useState(0);
  const [useClassPassives, setUseClassPassives] = useState(false);
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [totalXP, setTotalXP] = useState(0);
  const [xpBreakdown, setXpBreakdown] = useState({
    timeXP: 0,
    exerciseXP: 0,
    setXP: 0,
    difficultyMultiplier: 1,
    streakMultiplier: 1,
    prBonus: 0,
    baseXP: 0
  });
  const [bonusBreakdown, setBonusBreakdown] = useState<Array<{skill: string, amount: number, description: string}>>([]);
  
  useEffect(() => {
    calculatePotentialXP();
  }, [duration, exerciseCount, difficultyLevel, includePersonalRecord, streak, useClassPassives, selectedClass]);
  
  const calculatePotentialXP = () => {
    try {
      const workout = {
        id: 'simulation',
        exercises: Array(exerciseCount).fill({}).map((_, i) => ({
          id: `sim-ex-${i}`,
          name: `Simulated Exercise ${i + 1}`,
          exerciseId: `sim-ex-${i}`,
          sets: Array(3).fill({}).map(() => ({
            id: `sim-set-${Math.random()}`,
            weight: '20',
            reps: '10',
            completed: true
          }))
        })),
        durationSeconds: duration * 60,
        difficulty: difficultyLevel as any,
        hasPR: includePersonalRecord
      };
      
      const timeMinutes = Math.floor(workout.durationSeconds / 60);
      const timeXP = XPCalculationService.calculateTimeXP(timeMinutes);
      
      const exerciseXP = exerciseCount * XPService.BASE_EXERCISE_XP;
      const totalSets = exerciseCount * 3;
      const cappedSets = Math.min(totalSets, XPCalculationService.MAX_XP_CONTRIBUTING_SETS);
      const setXP = cappedSets * XPService.BASE_SET_XP;
      
      const difficultyMultiplier = XPCalculationService.DIFFICULTY_MULTIPLIERS[difficultyLevel as keyof typeof XPCalculationService.DIFFICULTY_MULTIPLIERS];
      const streakMultiplier = XPCalculationService.getStreakMultiplier(streak);
      
      const prBonus = includePersonalRecord ? XPService.PR_BONUS_XP : 0;
      
      const baseCalculatedXP = Math.round((timeXP + exerciseXP + setXP) * difficultyMultiplier);
      
      const result = XPCalculationService.calculateWorkoutXP(
        workout,
        useClassPassives ? selectedClass : null,
        streak,
        difficultyLevel as any
      );
      
      setXpBreakdown({
        timeXP,
        exerciseXP,
        setXP,
        difficultyMultiplier,
        streakMultiplier,
        prBonus,
        baseXP: baseCalculatedXP
      });
      
      setTotalXP(result.totalXP);
      setBonusBreakdown(result.bonusBreakdown);
      
      return result.totalXP;
    } catch (error) {
      console.error('Error calculating XP:', error);
      return 0;
    }
  };
  
  const simulateWorkout = async () => {
    if (!userId) {
      toast.error('Error', {
        description: 'Please select a test user',
      });
      return;
    }
    
    setIsLoading(true);
    try {
      const awardedXP = totalXP;
      
      const { data: workoutData, error: workoutError } = await supabase
        .from('workouts')
        .insert({
          user_id: userId,
          started_at: new Date(Date.now() - duration * 60 * 1000).toISOString(),
          completed_at: new Date().toISOString(),
          duration_seconds: duration * 60
        })
        .select('id')
        .single();
      
      if (workoutError) throw workoutError;
      
      const workoutId = workoutData.id;
      
      const exercisePromises = [];
      for (let i = 0; i < exerciseCount; i++) {
        const { data: exercises } = await supabase
          .from('exercises')
          .select('id')
          .limit(10);
        
        if (exercises && exercises.length > 0) {
          const randomExercise = exercises[Math.floor(Math.random() * exercises.length)];
          
          exercisePromises.push(
            supabase
              .from('workout_sets')
              .insert({
                workout_id: workoutId,
                exercise_id: randomExercise.id,
                set_order: i + 1,
                weight: 20 + Math.floor(Math.random() * 80),
                reps: 8 + Math.floor(Math.random() * 8),
                completed: true,
                completed_at: new Date().toISOString()
              })
          );
        }
      }
      
      await Promise.all(exercisePromises);
      
      const metadata = {
        workoutType,
        exerciseCount,
        difficultyLevel,
        includePersonalRecord,
        ...(useClassPassives ? { class: selectedClass } : {})
      };
      
      await XPService.awardXP(userId, awardedXP, 'workout', metadata);
      
      if (includePersonalRecord) {
        const { data: exercises } = await supabase
          .from('exercises')
          .select('id')
          .limit(1);
        
        if (exercises && exercises.length > 0) {
          await supabase
            .from('personal_records')
            .insert({
              user_id: userId,
              exercise_id: exercises[0].id,
              weight: 100,
              previous_weight: 80
            });
        }
      }
      
      await AchievementService.checkWorkoutAchievements(userId, workoutId);
      
      const classInfo = useClassPassives ? `, Class: ${selectedClass}` : '';
      addLogEntry(
        'Workout Simulated', 
        `Type: ${workoutType}, Duration: ${duration}min, Exercises: ${exerciseCount}, XP: ${awardedXP}, Streak: ${streak}${classInfo}`
      );
      
      toast.success('Workout Simulated!', {
        description: `${awardedXP} XP has been awarded to the user.`,
      });
      
    } catch (error) {
      console.error('Error simulating workout:', error);
      toast.error('Error', {
        description: 'Failed to simulate workout',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Card className="premium-card border-arcane-30 shadow-glow-subtle">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-orbitron flex items-center">
          <Dumbbell className="mr-2 h-5 w-5 text-arcane" />
          Workout Achievement Simulation
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
                  <SelectItem value="strength">Strength Training</SelectItem>
                  <SelectItem value="cardio">Cardio</SelectItem>
                  <SelectItem value="flexibility">Flexibility/Yoga</SelectItem>
                  <SelectItem value="hiit">HIIT</SelectItem>
                  <SelectItem value="sports">Sports Activity</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="difficulty">Difficulty Level</Label>
              <Select value={difficultyLevel} onValueChange={setDifficultyLevel}>
                <SelectTrigger id="difficulty" className="bg-midnight-elevated border-divider">
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="iniciante">Iniciante</SelectItem>
                  <SelectItem value="intermediario">Intermediário</SelectItem>
                  <SelectItem value="avancado">Avançado</SelectItem>
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
            
            <StreakSlider streak={streak} onChange={setStreak} />
            
            <div className="flex items-center space-x-2 pt-2">
              <Switch
                id="includePersonalRecord"
                checked={includePersonalRecord}
                onCheckedChange={setIncludePersonalRecord}
              />
              <Label htmlFor="includePersonalRecord">Include Personal Record (+{XPService.PR_BONUS_XP} XP)</Label>
            </div>
            
            <ClassPassivesToggle 
              enabled={useClassPassives}
              onEnabledChange={setUseClassPassives}
              selectedClass={selectedClass}
              onClassChange={setSelectedClass}
            />
          </div>
          
          <div className="space-y-4 flex flex-col">
            <div className="bg-midnight-card rounded-lg p-4 border border-divider/30 flex-grow">
              <h3 className="text-md font-orbitron mb-2 text-text-primary">XP Breakdown</h3>
              
              <div className="space-y-4">
                <div className="border-b border-divider/20 pb-2">
                  <p className="text-sm font-semibold text-text-secondary mb-2">Base Calculations:</p>
                  <div className="grid grid-cols-2 gap-1 text-sm">
                    <div className="text-text-secondary">Time XP:</div>
                    <div className="text-right font-space text-arcane">{xpBreakdown.timeXP} XP</div>
                    
                    <div className="text-text-secondary">Exercise XP:</div>
                    <div className="text-right font-space text-arcane">
                      {exerciseCount} × {XPService.BASE_EXERCISE_XP} = {xpBreakdown.exerciseXP} XP
                    </div>
                    
                    <div className="text-text-secondary">Set XP:</div>
                    <div className="text-right font-space text-arcane">
                      {Math.min(exerciseCount * 3, XPCalculationService.MAX_XP_CONTRIBUTING_SETS)} × {XPService.BASE_SET_XP} = {xpBreakdown.setXP} XP
                    </div>
                  </div>
                </div>
                
                <div className="border-b border-divider/20 pb-2">
                  <p className="text-sm font-semibold text-text-secondary mb-2">Multipliers:</p>
                  <div className="grid grid-cols-2 gap-1 text-sm">
                    <div className="text-text-secondary">Base Subtotal:</div>
                    <div className="text-right font-space text-arcane">
                      {xpBreakdown.timeXP + xpBreakdown.exerciseXP + xpBreakdown.setXP} XP
                    </div>
                    
                    <div className="text-text-secondary">Difficulty:</div>
                    <div className="text-right font-space text-arcane-60">
                      {xpBreakdown.difficultyMultiplier.toFixed(1)}×
                    </div>
                    
                    <div className="text-text-secondary">Base XP:</div>
                    <div className="text-right font-space text-arcane-60 font-bold">
                      {xpBreakdown.baseXP} XP
                    </div>
                    
                    <div className="text-text-secondary">Streak:</div>
                    <div className="text-right font-space text-arcane-60">
                      {xpBreakdown.streakMultiplier.toFixed(2)}×
                    </div>
                  </div>
                </div>
                
                {includePersonalRecord && (
                  <div className="border-b border-divider/20 pb-2">
                    <p className="text-sm font-semibold text-text-secondary mb-2">Bonuses:</p>
                    <div className="grid grid-cols-2 gap-1 text-sm">
                      <div className="text-text-secondary">Personal Record:</div>
                      <div className="text-right font-space text-achievement">+{xpBreakdown.prBonus} XP</div>
                    </div>
                  </div>
                )}
                
                {bonusBreakdown.length > 0 && (
                  <div className="border-b border-divider/20 pb-2">
                    <p className="text-sm font-semibold text-text-secondary mb-2">Class Bonuses:</p>
                    {bonusBreakdown.map((bonus, idx) => (
                      <div key={idx} className="grid grid-cols-2 gap-1 text-sm">
                        <div className="text-text-secondary">{bonus.description}:</div>
                        <div className={`text-right font-space ${bonus.amount >= 0 ? 'text-arcane' : 'text-red-500'}`}>
                          {bonus.amount >= 0 ? '+' : ''}{bonus.amount} XP
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="flex justify-between items-center pt-2">
                  <span className="text-text-secondary font-semibold">Total XP:</span>
                  <motion.span 
                    className="font-space text-lg text-arcane font-bold"
                    key={`total-${totalXP}`}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {totalXP} XP
                  </motion.span>
                </div>
                
                <div className="text-xs text-text-tertiary mt-4">
                  <p>Achievements will be unlocked based on:</p>
                  <ul className="list-disc pl-4 mt-1 space-y-1">
                    <li>First workout (if applicable)</li>
                    <li>Workout count milestones</li>
                    <li>Streak achievements</li>
                    {includePersonalRecord && <li>Personal record achievements</li>}
                    {duration >= 60 && <li>Long workout achievements</li>}
                  </ul>
                </div>
              </div>
            </div>
            
            <Button 
              onClick={simulateWorkout} 
              disabled={isLoading || !userId}
              className="w-full mt-auto bg-arcane-60 hover:bg-arcane transition-colors"
            >
              {isLoading ? (
                <span className="flex items-center">
                  <span className="animate-spin mr-2 h-4 w-4 border-t-2 border-b-2 border-current rounded-full" />
                  Simulating...
                </span>
              ) : (
                <span className="flex items-center">
                  <Award className="mr-2 h-4 w-4" />
                  Simulate Workout Completion
                </span>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WorkoutSimulation;
