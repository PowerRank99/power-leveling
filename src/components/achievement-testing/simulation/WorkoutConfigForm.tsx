
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { XPService } from '@/services/rpg/XPService';
import StreakSlider from '../common/StreakSlider';
import ClassPassivesToggle from '../common/ClassPassivesToggle';

interface WorkoutConfigFormProps {
  workoutType: string;
  setWorkoutType: (value: string) => void;
  difficultyLevel: string;
  setDifficultyLevel: (value: string) => void;
  duration: number;
  setDuration: (value: number) => void;
  exerciseCount: number;
  setExerciseCount: (value: number) => void;
  streak: number;
  setStreak: (value: number) => void;
  includePersonalRecord: boolean;
  setIncludePersonalRecord: (value: boolean) => void;
  useClassPassives: boolean;
  setUseClassPassives: (value: boolean) => void;
  selectedClass: string | null;
  setSelectedClass: (value: string | null) => void;
}

const WorkoutConfigForm: React.FC<WorkoutConfigFormProps> = ({
  workoutType,
  setWorkoutType,
  difficultyLevel,
  setDifficultyLevel,
  duration,
  setDuration,
  exerciseCount,
  setExerciseCount,
  streak,
  setStreak,
  includePersonalRecord,
  setIncludePersonalRecord,
  useClassPassives,
  setUseClassPassives,
  selectedClass,
  setSelectedClass
}) => {
  return (
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
  );
};

export default WorkoutConfigForm;
