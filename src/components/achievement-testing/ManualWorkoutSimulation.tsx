
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
import { ImagePlus, Upload, Barbell, Camera } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ManualWorkoutSimulationProps {
  userId: string;
  addLogEntry: (action: string, details: string) => void;
}

interface Exercise {
  id: string;
  name: string;
  muscle_group?: string;
}

const ManualWorkoutSimulation: React.FC<ManualWorkoutSimulationProps> = ({ userId, addLogEntry }) => {
  const [activityType, setActivityType] = useState('gym');
  const [description, setDescription] = useState('');
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedExerciseId, setSelectedExerciseId] = useState('');
  const [duration, setDuration] = useState(45);
  const [isPowerDay, setIsPowerDay] = useState(false);
  const [photoUrl, setPhotoUrl] = useState('https://frzgnszosqvcgycjtntz.supabase.co/storage/v1/object/public/workout-photos/default.jpg');
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    if (userId) {
      fetchExercises();
    }
  }, [userId]);
  
  const fetchExercises = async () => {
    try {
      const { data, error } = await supabase
        .from('exercises')
        .select('id, name, muscle_group')
        .order('name')
        .limit(100);
      
      if (error) throw error;
      
      setExercises(data || []);
      if (data && data.length > 0) {
        setSelectedExerciseId(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching exercises:', error);
    }
  };
  
  const calculateXP = () => {
    // Base XP for manual workouts
    let baseXP = XPService.MANUAL_WORKOUT_BASE_XP;
    
    // Add bonus for power day if selected
    if (isPowerDay) {
      baseXP += XPService.POWER_DAY_BONUS_XP;
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
      const selectedExercise = exercises.find(ex => ex.id === selectedExerciseId);
      if (!selectedExercise) throw new Error('Exercise not found');
      
      // Calculate XP
      const xpAwarded = calculateXP();
      
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
      
      // Award XP
      await XPService.awardXP(userId, xpAwarded, 'manual_workout', {
        activityType,
        exerciseId: selectedExerciseId,
        exerciseName: selectedExercise.name,
        isPowerDay
      });
      
      // Record successful simulation
      addLogEntry(
        'Manual Workout Submitted', 
        `Type: ${activityType}, Exercise: ${selectedExercise.name}, XP: ${xpAwarded}${isPowerDay ? ' (Power Day)' : ''}`
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
  
  const xpAwarded = calculateXP();
  const selectedExercise = exercises.find(ex => ex.id === selectedExerciseId);
  
  return (
    <Card className="premium-card border-arcane-30 shadow-glow-subtle">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-orbitron flex items-center">
          <Barbell className="mr-2 h-5 w-5 text-arcane" />
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
            
            <div className="space-y-2">
              <Label htmlFor="exerciseSelect">Exercise</Label>
              <Select value={selectedExerciseId} onValueChange={setSelectedExerciseId}>
                <SelectTrigger id="exerciseSelect" className="bg-midnight-elevated border-divider">
                  <SelectValue placeholder="Select an exercise" />
                </SelectTrigger>
                <SelectContent>
                  {exercises.map((exercise) => (
                    <SelectItem key={exercise.id} value={exercise.id}>
                      {exercise.name} {exercise.muscle_group ? `(${exercise.muscle_group})` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
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
              <Label htmlFor="powerDay">Activate Power Day (+{XPService.POWER_DAY_BONUS_XP} XP)</Label>
            </div>
          </div>
          
          <div className="space-y-4 flex flex-col">
            {/* Photo upload mock */}
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
                    <span className="font-space text-achievement">+{XPService.POWER_DAY_BONUS_XP} XP</span>
                  </div>
                )}
                
                <div className="flex justify-between items-center">
                  <span className="text-text-secondary">Total XP:</span>
                  <motion.span 
                    className="font-space text-lg text-arcane"
                    key={xpAwarded}
                    initial={{ scale: 1 }}
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 0.5 }}
                  >
                    {xpAwarded} XP
                  </motion.span>
                </div>
                
                <div className="text-xs text-text-tertiary mt-2">
                  <p>Selected Exercise: {selectedExercise?.name || 'None'}</p>
                  <p>Manual workouts require a photo in real usage.</p>
                  {isPowerDay && <p className="text-achievement-60">Power Day increases XP cap to 500.</p>}
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
