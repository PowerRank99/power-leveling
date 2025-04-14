
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dumbbell } from 'lucide-react';
import { useManualWorkoutSimulation } from './simulation/useManualWorkoutSimulation';
import ManualWorkoutConfigForm from './simulation/ManualWorkoutConfigForm';
import XPBreakdownPanel from './simulation/XPBreakdownPanel';
import SubmitButton from './simulation/SubmitButton';

interface ManualWorkoutSimulationProps {
  userId: string;
  addLogEntry: (action: string, details: string) => void;
}

const ManualWorkoutSimulation: React.FC<ManualWorkoutSimulationProps> = ({ userId, addLogEntry }) => {
  const {
    state,
    setActivityType,
    setDescription,
    setDuration,
    setIsPowerDay,
    setUseClassPassives,
    setSelectedClass,
    getClassBonusDescription,
    submitManualWorkout
  } = useManualWorkoutSimulation({ userId, addLogEntry });

  const classBonus = getClassBonusDescription();
  
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
            <ManualWorkoutConfigForm
              activityType={state.activityType}
              setActivityType={setActivityType}
              description={state.description}
              setDescription={setDescription}
              duration={state.duration}
              setDuration={setDuration}
              isPowerDay={state.isPowerDay}
              setIsPowerDay={setIsPowerDay}
              useClassPassives={state.useClassPassives}
              setUseClassPassives={setUseClassPassives}
              selectedClass={state.selectedClass}
              setSelectedClass={setSelectedClass}
            />
          </div>
          
          <div className="space-y-4 flex flex-col">
            <XPBreakdownPanel
              totalXP={state.totalXP}
              isPowerDay={state.isPowerDay}
              classBonus={classBonus}
            />
            
            <SubmitButton
              onClick={submitManualWorkout}
              isLoading={state.isLoading}
              disabled={!userId}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ManualWorkoutSimulation;
