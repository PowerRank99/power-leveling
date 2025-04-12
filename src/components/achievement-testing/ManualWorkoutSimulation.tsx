
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { XPService } from '@/services/rpg/XPService';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { ImagePlus, Upload, Dumbbell, Camera } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import TestingExerciseSelector from './common/TestingExerciseSelector';
import ClassPassivesToggle from './common/ClassPassivesToggle';

interface ManualWorkoutSimulationProps {
  userId: string;
  addLogEntry: (action: string, details: string) => void;
}

const POWER_DAY_BONUS_XP = 50;

const ManualWorkoutSimulation: React.FC<ManualWorkoutSimulationProps> = ({ userId, addLogEntry }) => {
  const [activityType, setActivityType] = useState('gym');
  const [description, setDescription] = useState('');
  const [selectedExerciseId, setSelectedExerciseId] = useState('');
  const [duration, setDuration] = useState(45);
  const [isPowerDay, setIsPowerDay] = useState(false);
  const [photoUrl, setPhotoUrl] = useState('https://frzgnszosqvcgycjtntz.supabase.co/storage/v1/object/public/workout-photos/default.jpg');
  const [isLoading, setIsLoading] = useState(false);
  const [useClassPassives, setUseClassPassives] = useState(false);
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [totalXP, setTotalXP] = useState(0);
  
  // Update XP calculation when inputs change
  useEffect(() => {
    setTotalXP(calculateXP());
  }, [isPowerDay, useClassPassives, selectedClass]);
  
  const calculateXP = () => {
    // Base XP for manual workouts
    let baseXP = XPService.MANUAL_WORKOUT_BASE_XP;
    
    // Add bonus for power day if selected
    if (isPowerDay) {
      baseXP += POWER_DAY_BONUS_XP;
    }
    
    // Apply class bonuses if enabled
    if (useClassPassives && selectedClass) {
      // Simple simulation of class bonuses for manual workouts
      if (activityType === 'gym' && selectedClass === 'Guerreiro') {
        // Guerreiro gets bonus for gym workouts
        baseXP = Math.round(baseXP * 1.1);
      } else if (activityType === 'run' && selectedClass === 'Ninja') {
        // Ninja gets bonus for cardio
        baseXP = Math.round(baseXP * 1.2);
      } else if (activityType === 'yoga' && selectedClass === 'Bruxo') {
        // Bruxo gets bonus for yoga
        baseXP = Math.round(baseXP * 1.2);
      } else if ((activityType === 'sport' || activityType === 'swim') && selectedClass === 'Paladino') {
        // Paladino gets bonus for sports
        baseXP = Math.round(baseXP * 1.15);
      }
    }
    
    return baseXP;
  };
  
  const submitManualWorkout = async () => {
    if (!userId || !selectedExerciseId) {
      toast.error('Error', {
        description: 'Please select a user and exercise',
      });
      return;
    }
    
    setIsLoading(true);
    try {
      // Calculate XP (uses state that's already been calculated)
      const xpAwarded = totalXP;
      
      // Create a unique filename
      const fileName = `test-manual-workout-${Date.now()}`;
      
      // Record manual workout in the database
      const { error } = await supabase.rpc('create_manual_workout', {
        p_user_id: userId,
        p_description: description,
        p_activity_type: activityType,
        p_exercise_id: selectedExerciseId,
        p_photo_url: photoUrl,
        p_xp_awarded: xpAwarded,
        p_workout_date: new Date().toISOString(),
        p_is_power_day: isPowerDay
      });
      
      if (error) throw error;
      
      // Get exercise name for the log
      const { data: exerciseData } = await supabase
        .from('exercises')
        .select('name')
        .eq('id', selectedExerciseId)
        .single();
      
      const exerciseName = exerciseData?.name || 'Unknown exercise';
      
      // Award XP
      await XPService.awardXP(userId, xpAwarded, 'manual_workout', {
        activityType,
        exerciseId: selectedExerciseId,
        exerciseName,
        isPowerDay,
        ...(useClassPassives ? { class: selectedClass } : {})
      });
      
      // Record successful simulation
      const classInfo = useClassPassives ? `, Class: ${selectedClass}` : '';
      addLogEntry(
        'Manual Workout Submitted', 
        `Type: ${activityType}, Exercise: ${exerciseName}, XP: ${xpAwarded}${isPowerDay ? ' (Power Day)' : ''}${classInfo}`
      );
      
      toast.success('Manual Workout Submitted!', {
        description: `${xpAwarded} XP has been awarded.`,
      });
      
      // Reset form
      setDescription('');
      
    } catch (error) {
      console.error('Error submitting manual workout:', error);
      toast.error('Error', {
        description: 'Failed to submit manual workout',
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
          Manual Workout Simulation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="activityType">Activity Type</Label>
              <Select value={activityType} onValueChange={setActivityType}>
                <SelectTrigger id="activityType" className="bg-midnight-elevated border-divider">
                  <SelectValue placeholder="Select activity type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gym">Gym Workout</SelectItem>
                  <SelectItem value="run">Running</SelectItem>
                  <SelectItem value="cycle">Cycling</SelectItem>
                  <SelectItem value="swim">Swimming</SelectItem>
                  <SelectItem value="yoga">Yoga</SelectItem>
                  <SelectItem value="sport">Sports</SelectItem>
                  <SelectItem value="other">Other Activity</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <TestingExerciseSelector
              selectedExerciseId={selectedExerciseId}
              onSelect={setSelectedExerciseId}
              label="Select Exercise"
            />
            
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                min={5}
                max={180}
                className="bg-midnight-elevated border-divider"
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value) || 0)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                className="bg-midnight-elevated border-divider min-h-[120px]"
                placeholder="Describe your workout..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            
            <div className="flex items-center space-x-2 pt-2">
              <Switch
                id="powerDay"
                checked={isPowerDay}
                onCheckedChange={setIsPowerDay}
              />
              <Label htmlFor="powerDay">Activate Power Day (+{POWER_DAY_BONUS_XP} XP)</Label>
            </div>
            
            <ClassPassivesToggle
              enabled={useClassPassives}
              onEnabledChange={setUseClassPassives}
              selectedClass={selectedClass}
              onClassChange={setSelectedClass}
            />
          </div>
          
          <div className="space-y-4 flex flex-col">
            <div className="bg-midnight-card rounded-lg p-4 border border-divider/30 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-midnight-base/80 to-transparent z-10 pointer-events-none"></div>
              
              <div className="aspect-video bg-midnight-elevated rounded-md border border-divider flex items-center justify-center relative mb-3">
                <Camera className="h-12 w-12 text-text-tertiary absolute" />
                <div className="absolute inset-0 bg-midnight-base/50 flex items-center justify-center">
                  <p className="text-text-secondary font-sora">Test Photo (Simulated)</p>
                </div>
              </div>
              
              <Button variant="outline" className="w-full bg-midnight-elevated mb-4" disabled>
                <ImagePlus className="mr-2 h-4 w-4" />
                Upload Photo (Simulated)
              </Button>
              
              <div className="space-y-3 z-20 relative">
                <div className="flex justify-between items-center">
                  <span className="text-text-secondary">Base XP:</span>
                  <span className="font-space text-arcane">{XPService.MANUAL_WORKOUT_BASE_XP} XP</span>
                </div>
                
                {isPowerDay && (
                  <div className="flex justify-between items-center">
                    <span className="text-text-secondary">Power Day Bonus:</span>
                    <span className="font-space text-achievement">+{POWER_DAY_BONUS_XP} XP</span>
                  </div>
                )}
                
                {useClassPassives && totalXP !== (XPService.MANUAL_WORKOUT_BASE_XP + (isPowerDay ? POWER_DAY_BONUS_XP : 0)) && (
                  <div className="flex justify-between items-center">
                    <span className="text-text-secondary">Class Bonus:</span>
                    <span className="font-space text-arcane-60">
                      +{totalXP - (XPService.MANUAL_WORKOUT_BASE_XP + (isPowerDay ? POWER_DAY_BONUS_XP : 0))} XP
                    </span>
                  </div>
                )}
                
                <div className="flex justify-between items-center border-t border-divider/20 pt-3 mt-1">
                  <span className="text-text-secondary font-semibold">Total XP:</span>
                  <motion.span 
                    className="font-space text-lg text-arcane font-bold"
                    key={totalXP}
                    initial={{ scale: 1 }}
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 0.5 }}
                  >
                    {totalXP} XP
                  </motion.span>
                </div>
                
                <div className="text-xs text-text-tertiary mt-2">
                  <p>Manual workouts require a photo in real usage.</p>
                  {isPowerDay && <p className="text-achievement-60">Power Day increases XP cap to 500.</p>}
                  {useClassPassives && selectedClass && (
                    <p className="text-arcane-60">
                      {selectedClass} passive affects manual workouts based on activity type.
                    </p>
                  )}
                </div>
              </div>
            </div>
            
            <Button 
              onClick={submitManualWorkout} 
              disabled={isLoading || !userId || !selectedExerciseId}
              className="w-full mt-auto bg-arcane-60 hover:bg-arcane transition-colors"
            >
              {isLoading ? (
                <span className="flex items-center">
                  <span className="animate-spin mr-2 h-4 w-4 border-t-2 border-b-2 border-current rounded-full" />
                  Submitting...
                </span>
              ) : (
                <span className="flex items-center">
                  <Upload className="mr-2 h-4 w-4" />
                  Submit Manual Workout
                </span>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ManualWorkoutSimulation;
