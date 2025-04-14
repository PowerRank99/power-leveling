
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface WorkoutSimulationProps {
  userId: string;
  addLogEntry: (action: string, details: string) => void;
}

const WorkoutSimulation: React.FC<WorkoutSimulationProps> = ({ userId, addLogEntry }) => {
  const [exerciseType, setExerciseType] = useState('strength');
  const [duration, setDuration] = useState(30);
  const [hasPR, setHasPR] = useState(false);

  const exerciseTypes = [
    { id: 'strength', name: 'Strength Training' },
    { id: 'bodyweight', name: 'Bodyweight/Calisthenics' },
    { id: 'cardio', name: 'Cardio' },
    { id: 'sports', name: 'Sports' },
    { id: 'flexibility', name: 'Flexibility & Mobility' }
  ];

  const simulateWorkout = () => {
    addLogEntry('Workout Simulated', 
      `Type: ${exerciseType}, Duration: ${duration}min, PR: ${hasPR ? 'Yes' : 'No'}`
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Workout Simulation</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="exerciseType">Exercise Type</Label>
          <Select value={exerciseType} onValueChange={setExerciseType}>
            <SelectTrigger id="exerciseType">
              <SelectValue placeholder="Select exercise type" />
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
          <Label htmlFor="duration">Duration (minutes)</Label>
          <Input
            id="duration"
            type="number"
            value={duration}
            onChange={(e) => setDuration(parseInt(e.target.value) || 0)}
            min={1}
          />
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="hasPR"
            checked={hasPR}
            onChange={(e) => setHasPR(e.target.checked)}
            className="h-4 w-4"
          />
          <Label htmlFor="hasPR">Include Personal Record</Label>
        </div>

        <Button onClick={simulateWorkout} className="w-full">
          Simulate Workout
        </Button>

        <div className="mt-4 p-4 bg-midnight-card rounded-lg border border-divider/20">
          <h3 className="font-semibold mb-2">Class Bonus Guide:</h3>
          <ul className="space-y-2 text-sm text-text-secondary">
            <li>• Strength Training: Guerreiro (+20%)</li>
            <li>• Bodyweight: Monge (+20%)</li>
            <li>• Cardio: Ninja (+20%)</li>
            <li>• Sports: Paladino (+40%)</li>
            <li>• Flexibility: Druida (+40%)</li>
            <li>• PR Bonus: Guerreiro (+10%)</li>
            <li>• Under 45min: Ninja (+40%)</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default WorkoutSimulation;
