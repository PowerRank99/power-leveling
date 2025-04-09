
import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface LeaderboardFiltersProps {
  timeFilter: string;
  metricFilter: string;
  onTimeFilterChange: (value: string) => void;
  onMetricFilterChange: (value: string) => void;
}

const LeaderboardFilters: React.FC<LeaderboardFiltersProps> = ({
  timeFilter,
  metricFilter,
  onTimeFilterChange,
  onMetricFilterChange
}) => {
  return (
    <div className="p-4 bg-white border-b border-gray-200">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold">Classificação</h3>
        
        <Select value={metricFilter} onValueChange={onMetricFilterChange}>
          <SelectTrigger className="w-36 h-9">
            <SelectValue placeholder="Métrica" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="xp">EXP Ganho</SelectItem>
            <SelectItem value="workouts">Dias de Treino</SelectItem>
            <SelectItem value="streak">Sequência</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <Tabs defaultValue="weekly" className="w-full" value={timeFilter} onValueChange={onTimeFilterChange}>
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="weekly">Semanal</TabsTrigger>
          <TabsTrigger value="monthly">Mensal</TabsTrigger>
          <TabsTrigger value="alltime">Todos</TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
};

export default LeaderboardFilters;
