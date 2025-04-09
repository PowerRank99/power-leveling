
import React from 'react';
import { Calendar, Activity, TrendingUp } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';

interface WorkoutPageHeaderProps {
  recentWorkoutCount: number;
  routineCount: number;
  lastWorkoutDays?: number | null;
}

const WorkoutPageHeader: React.FC<WorkoutPageHeaderProps> = ({
  recentWorkoutCount,
  routineCount,
  lastWorkoutDays = null
}) => {
  return (
    <div className="bg-white">
      <PageHeader title="Treino" showBackButton={false} />
      
      <div className="px-4 pb-3 pt-1 grid grid-cols-3 gap-3 border-b border-gray-100">
        <div className="flex flex-col items-center bg-blue-50 rounded-lg px-3 py-2">
          <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full mb-1">
            <Activity className="h-4 w-4 text-blue-600" />
          </div>
          <span className="text-lg font-bold text-blue-700">{recentWorkoutCount}</span>
          <span className="text-xs text-blue-600">Treinos</span>
        </div>
        
        <div className="flex flex-col items-center bg-green-50 rounded-lg px-3 py-2">
          <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full mb-1">
            <Calendar className="h-4 w-4 text-green-600" />
          </div>
          <span className="text-lg font-bold text-green-700">{routineCount}</span>
          <span className="text-xs text-green-600">Rotinas</span>
        </div>
        
        <div className="flex flex-col items-center bg-purple-50 rounded-lg px-3 py-2">
          <div className="flex items-center justify-center w-8 h-8 bg-purple-100 rounded-full mb-1">
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </div>
          <span className="text-lg font-bold text-purple-700">
            {lastWorkoutDays === null ? '-' : lastWorkoutDays}
          </span>
          <span className="text-xs text-purple-600">
            {lastWorkoutDays === 0 ? 'Hoje' : 'Dias atrás'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default WorkoutPageHeader;
