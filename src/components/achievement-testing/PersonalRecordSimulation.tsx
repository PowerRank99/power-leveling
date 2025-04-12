
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { PersonalRecordService } from '@/services/rpg/PersonalRecordService';
import { XPService } from '@/services/rpg/XPService';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Weight, Trophy, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import TestingExerciseSelector from './common/TestingExerciseSelector';
import ClassPassivesToggle from './common/ClassPassivesToggle';

interface PersonalRecordSimulationProps {
  userId: string;
  addLogEntry: (action: string, details: string) => void;
}

const PersonalRecordSimulation: React.FC<PersonalRecordSimulationProps> = ({ userId, addLogEntry }) => {
  const [exercises, setExercises] = useState<any[]>([]);
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>('');
  const [currentWeight, setCurrentWeight] = useState<number>(100);
  const [previousWeight, setPreviousWeight] = useState<number>(80);
  const [isLoading, setIsLoading] = useState(false);
  const [useClassPassives, setUseClassPassives] = useState(false);
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [potentialXp, setPotentialXp] = useState(XPService.PR_BONUS_XP);
  
  // Fetch the selected exercise name whenever it changes
  useEffect(() => {
    if (selectedExerciseId) {
      fetchExerciseName();
    }
  }, [selectedExerciseId]);
  
  // Update XP calculation when class settings change
  useEffect(() => {
    calculatePotentialXp();
  }, [useClassPassives, selectedClass]);
  
  const fetchExerciseName = async () => {
    try {
      const { data, error } = await supabase
        .from('exercises')
        .select('name')
        .eq('id', selectedExerciseId)
        .single();
      
      if (error) throw error;
      
      if (data) {
        setExercises([{ id: selectedExerciseId, name: data.name }]);
      }
    } catch (error) {
      console.error('Error fetching exercise name:', error);
    }
  };
  
  const calculateImprovement = () => {
    if (previousWeight <= 0) return 0;
    return ((currentWeight - previousWeight) / previousWeight) * 100;
  };
  
  const calculatePotentialXp = () => {
    let xp = XPService.PR_BONUS_XP;
    
    // Apply class bonuses if enabled
    if (useClassPassives && selectedClass) {
      // Simple class bonus simulation
      if (selectedClass === 'Guerreiro') {
        // Guerreiro gets bonus for strength exercises
        xp = Math.round(xp * 1.2);
      }
    }
    
    setPotentialXp(xp);
    return xp;
  };
  
  const simulatePersonalRecord = async () => {
    if (!userId || !selectedExerciseId) {
      toast.error('Error', {
        description: 'Please select a user and exercise',
      });
      return;
    }
    
    setIsLoading(true);
    try {
      // Record personal record in the database
      await PersonalRecordService.recordPersonalRecord(
        userId,
        selectedExerciseId,
        currentWeight,
        previousWeight
      );
      
      // Calculate XP with class bonuses if enabled
      const xpToAward = calculatePotentialXp();
      
      // Award XP for PR
      await XPService.awardXP(userId, xpToAward, 'personal_record', {
        exerciseId: selectedExerciseId,
        weight: currentWeight,
        previousWeight: previousWeight,
        improvementPercent: calculateImprovement().toFixed(1),
        ...(useClassPassives ? { class: selectedClass } : {})
      });
      
      // Find exercise name for log
      const exerciseName = exercises.find(ex => ex.id === selectedExerciseId)?.name || 'Unknown exercise';
      
      // Record successful simulation
      const classInfo = useClassPassives ? `, Class: ${selectedClass}` : '';
      addLogEntry(
        'Personal Record Logged', 
        `Exercise: ${exerciseName}, Weight: ${currentWeight}kg (previous: ${previousWeight}kg), Improvement: ${calculateImprovement().toFixed(1)}%, XP: ${xpToAward}${classInfo}`
      );
      
      toast.success('Personal Record Logged!', {
        description: `${xpToAward} XP has been awarded for this PR.`,
      });
    } catch (error) {
      console.error('Error simulating personal record:', error);
      toast.error('Error', {
        description: 'Failed to record personal record',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const improvementPercent = calculateImprovement();
  
  return (
    <Card className="premium-card border-arcane-30 shadow-glow-subtle">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-orbitron flex items-center">
          <Weight className="mr-2 h-5 w-5 text-valor" />
          Personal Record Simulation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-4">
            <TestingExerciseSelector
              selectedExerciseId={selectedExerciseId}
              onSelect={setSelectedExerciseId}
              label="Select Exercise"
            />
            
            <div className="space-y-2">
              <Label htmlFor="currentWeight">Current Weight (kg)</Label>
              <Input
                id="currentWeight"
                type="number"
                min={0}
                className="bg-midnight-elevated border-divider"
                value={currentWeight}
                onChange={(e) => setCurrentWeight(parseFloat(e.target.value) || 0)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="previousWeight">Previous Best Weight (kg)</Label>
              <Input
                id="previousWeight"
                type="number"
                min={0}
                className="bg-midnight-elevated border-divider"
                value={previousWeight}
                onChange={(e) => setPreviousWeight(parseFloat(e.target.value) || 0)}
              />
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
              <h3 className="text-md font-orbitron mb-3 text-text-primary">PR Preview</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-text-secondary">Improvement:</span>
                  <motion.span 
                    className={`font-space ${improvementPercent >= 20 ? 'text-achievement' : improvementPercent >= 10 ? 'text-valor' : 'text-arcane'}`}
                    key={improvementPercent.toFixed(1)}
                    initial={{ scale: 1 }}
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 0.5 }}
                  >
                    {improvementPercent.toFixed(1)}%
                  </motion.span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-text-secondary">Base XP Reward:</span>
                  <span className="font-space text-arcane">+{XPService.PR_BONUS_XP} XP</span>
                </div>
                
                {useClassPassives && potentialXp !== XPService.PR_BONUS_XP && (
                  <div className="flex justify-between items-center">
                    <span className="text-text-secondary">Class Bonus:</span>
                    <span className="font-space text-achievement">
                      +{potentialXp - XPService.PR_BONUS_XP} XP
                    </span>
                  </div>
                )}
                
                <div className="flex justify-between items-center border-t border-divider/20 pt-3 mt-1">
                  <span className="text-text-secondary font-semibold">Total XP:</span>
                  <motion.span 
                    className="font-space text-lg text-arcane font-bold"
                    key={potentialXp}
                    initial={{ scale: 1 }}
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 0.5 }}
                  >
                    {potentialXp} XP
                  </motion.span>
                </div>
                
                <div className="border-t border-divider/20 my-3 pt-3">
                  <h4 className="text-sm font-sora mb-2 text-arcane-60">Potential Achievements</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center text-text-secondary">
                      <Trophy className="h-4 w-4 mr-2 text-achievement-60" />
                      First Personal Record
                    </li>
                    <li className="flex items-center text-text-secondary">
                      <TrendingUp className="h-4 w-4 mr-2 text-valor-60" />
                      {improvementPercent >= 20 
                        ? "20%+ Weight Increase (Impressive Progress)" 
                        : improvementPercent >= 10 
                          ? "10%+ Weight Increase (Good Progress)"
                          : "Weight Increase"}
                    </li>
                    <li className="flex items-center text-text-secondary">
                      <Trophy className="h-4 w-4 mr-2 text-achievement-60" />
                      PR Count Milestones (5, 10, 25, 50)
                    </li>
                  </ul>
                </div>
                
                <div className="text-xs text-text-tertiary mt-2">
                  <p>Note: Only one PR bonus is awarded per exercise per week.</p>
                </div>
              </div>
            </div>
            
            <Button 
              onClick={simulatePersonalRecord} 
              disabled={isLoading || !userId || !selectedExerciseId}
              className="w-full mt-auto bg-valor-60 hover:bg-valor transition-colors"
            >
              {isLoading ? (
                <span className="flex items-center">
                  <span className="animate-spin mr-2 h-4 w-4 border-t-2 border-b-2 border-current rounded-full" />
                  Processing...
                </span>
              ) : (
                <span className="flex items-center">
                  <Trophy className="mr-2 h-4 w-4" />
                  Log Personal Record
                </span>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PersonalRecordSimulation;
