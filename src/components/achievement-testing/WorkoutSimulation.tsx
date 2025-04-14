
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dumbbell } from 'lucide-react';
import { useWorkoutSimulation } from './simulation/useWorkoutSimulation';
import WorkoutConfigForm from './simulation/WorkoutConfigForm';
import XPBreakdownDisplay from './simulation/XPBreakdownDisplay';
import SimulateButton from './simulation/SimulateButton';

interface WorkoutSimulationProps {
  userId: string;
  addLogEntry: (action: string, details: string) => void;
}

const WorkoutSimulation: React.FC<WorkoutSimulationProps> = ({ userId, addLogEntry }) => {
  const {
    state,
    setWorkoutType,
    setDuration,
    setExerciseCount,
    setIncludePersonalRecord,
    setStreak,
    setUseClassPassives,
    setSelectedClass,
    simulateWorkout
  } = useWorkoutSimulation({ userId, addLogEntry });

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
            <WorkoutConfigForm
              workoutType={state.workoutType}
              setWorkoutType={setWorkoutType}
              duration={state.duration}
              setDuration={setDuration}
              exerciseCount={state.exerciseCount}
              setExerciseCount={setExerciseCount}
              streak={state.streak}
              setStreak={setStreak}
              includePersonalRecord={state.includePersonalRecord}
              setIncludePersonalRecord={setIncludePersonalRecord}
              useClassPassives={state.useClassPassives}
              setUseClassPassives={setUseClassPassives}
              selectedClass={state.selectedClass}
              setSelectedClass={setSelectedClass}
            />
          </div>
          
          <div className="space-y-4 flex flex-col">
            <XPBreakdownDisplay
              xpBreakdown={state.xpBreakdown}
              bonusBreakdown={state.bonusBreakdown}
              totalXP={state.totalXP}
              exerciseCount={state.exerciseCount}
              includePersonalRecord={state.includePersonalRecord}
              duration={state.duration}
            />
            
            <SimulateButton
              onClick={simulateWorkout}
              isLoading={state.isLoading}
              disabled={!userId}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WorkoutSimulation;
