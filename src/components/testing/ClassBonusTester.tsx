
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { XPCalculationService } from '@/services/rpg/XPCalculationService';
import { ExerciseType } from '@/components/workout/types/Exercise';

const ClassBonusTester = () => {
  // Test configuration
  const [className, setClassName] = useState('Guerreiro');
  const [exerciseType, setExerciseType] = useState<ExerciseType>('Musculação');
  const [exerciseCount, setExerciseCount] = useState(3);
  const [setsPerExercise, setSetsPerExercise] = useState(3);
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [hasPR, setHasPR] = useState(false);
  
  // Results
  const [results, setResults] = useState<any>(null);
  
  const runTest = () => {
    // Create a simulated workout with the specified exercise type
    const exercises = Array(exerciseCount).fill(0).map((_, i) => ({
      id: `test-ex-${i}`,
      name: `Test Exercise ${i+1}`,
      exerciseId: `ex-${i}`,
      type: exerciseType,
      sets: Array(setsPerExercise).fill(0).map((_, j) => ({
        id: `set-${i}-${j}`,
        weight: '20',
        reps: '10',
        completed: true
      }))
    }));
    
    // Calculate XP using our service
    const result = XPCalculationService.calculateWorkoutXP({
      workout: {
        id: 'test-workout',
        exercises,
        durationSeconds: durationMinutes * 60,
        hasPR
      },
      userClass: className,
      streak: 7,
      defaultDifficulty: 'intermediario'
    });
    
    setResults(result);
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Class Bonus Tester</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="class">Class</Label>
              <Select value={className} onValueChange={setClassName}>
                <SelectTrigger id="class">
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Guerreiro">Guerreiro</SelectItem>
                  <SelectItem value="Monge">Monge</SelectItem>
                  <SelectItem value="Ninja">Ninja</SelectItem>
                  <SelectItem value="Druida">Druida</SelectItem>
                  <SelectItem value="Bruxo">Bruxo</SelectItem>
                  <SelectItem value="Paladino">Paladino</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="exerciseType">Exercise Type</Label>
              <Select value={exerciseType} onValueChange={(v) => setExerciseType(v as ExerciseType)}>
                <SelectTrigger id="exerciseType">
                  <SelectValue placeholder="Select exercise type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Musculação">Musculação</SelectItem>
                  <SelectItem value="Calistenia">Calistenia</SelectItem>
                  <SelectItem value="Cardio">Cardio</SelectItem>
                  <SelectItem value="Esportes">Esportes</SelectItem>
                  <SelectItem value="Flexibilidade & Mobilidade">Flexibilidade & Mobilidade</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="exerciseCount">Exercise Count</Label>
              <Input 
                id="exerciseCount" 
                type="number" 
                value={exerciseCount} 
                onChange={(e) => setExerciseCount(parseInt(e.target.value) || 1)} 
                min={1}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="setsPerExercise">Sets Per Exercise</Label>
              <Input 
                id="setsPerExercise" 
                type="number" 
                value={setsPerExercise} 
                onChange={(e) => setSetsPerExercise(parseInt(e.target.value) || 1)} 
                min={1}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="durationMinutes">Duration (minutes)</Label>
              <Input 
                id="durationMinutes" 
                type="number" 
                value={durationMinutes} 
                onChange={(e) => setDurationMinutes(parseInt(e.target.value) || 1)} 
                min={1}
              />
            </div>
            
            <div className="flex items-center space-x-2 pt-6">
              <input 
                id="hasPR" 
                type="checkbox" 
                checked={hasPR} 
                onChange={(e) => setHasPR(e.target.checked)} 
                className="h-4 w-4"
              />
              <Label htmlFor="hasPR">Has Personal Record</Label>
            </div>
          </div>
          
          <Button onClick={runTest} className="w-full">Calculate XP</Button>
          
          {results && (
            <div className="mt-6 space-y-4">
              <div className="rounded-md bg-midnight-card p-4 border border-divider/20">
                <h3 className="font-semibold mb-2">XP Components:</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>Time XP:</div>
                  <div className="text-right">{results.components?.timeXP || 'N/A'}</div>
                  
                  <div>Exercise XP:</div>
                  <div className="text-right">{results.components?.exerciseXP || 'N/A'}</div>
                  
                  <div>Sets XP:</div>
                  <div className="text-right">{results.components?.setsXP || 'N/A'}</div>
                  
                  <div>PR Bonus:</div>
                  <div className="text-right">{results.components?.prBonus || 0}</div>
                  
                  <div className="font-semibold">Base XP:</div>
                  <div className="text-right font-semibold">{results.baseXP}</div>
                </div>
              </div>
              
              <div className="rounded-md bg-midnight-card p-4 border border-divider/20">
                <h3 className="font-semibold mb-2">Bonuses:</h3>
                {results.bonusBreakdown.length > 0 ? (
                  <div className="space-y-2">
                    {results.bonusBreakdown.map((bonus: any, index: number) => (
                      <div key={index} className="flex justify-between items-center text-sm">
                        <div className="flex-1">{bonus.description}</div>
                        <div className={bonus.amount > 0 ? 'text-arcane' : 'text-text-tertiary'}>
                          {bonus.amount > 0 ? `+${bonus.amount}` : '0'} XP
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-text-tertiary">No bonuses applied</div>
                )}
              </div>
              
              <div className="rounded-md bg-midnight-card p-4 border border-divider/20">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold">Total XP:</h3>
                  <div className="text-xl font-bold text-arcane">{results.totalXP} XP</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ClassBonusTester;
