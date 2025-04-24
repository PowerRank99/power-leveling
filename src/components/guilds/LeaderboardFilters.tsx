
import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
    <div className="p-4 space-y-4">
      <div>
        <label className="text-sm font-sora text-text-secondary mb-2 block">Período</label>
        <Tabs value={timeFilter} onValueChange={onTimeFilterChange} className="w-full">
          <TabsList className="grid grid-cols-3 w-full bg-midnight-elevated overflow-hidden rounded-lg">
            <TabsTrigger 
              value="weekly" 
              className="rounded-md transition-all duration-300 data-[state=active]:bg-arcane-15 data-[state=active]:text-arcane data-[state=active]:shadow-glow-subtle data-[state=active]:border-b-2 data-[state=active]:border-arcane data-[state=inactive]:hover:bg-arcane-15/30 data-[state=inactive]:hover:text-text-primary text-text-secondary"
            >
              Semanal
            </TabsTrigger>
            <TabsTrigger 
              value="monthly" 
              className="rounded-md transition-all duration-300 data-[state=active]:bg-arcane-15 data-[state=active]:text-arcane data-[state=active]:shadow-glow-subtle data-[state=active]:border-b-2 data-[state=active]:border-arcane data-[state=inactive]:hover:bg-arcane-15/30 data-[state=inactive]:hover:text-text-primary text-text-secondary"
            >
              Mensal
            </TabsTrigger>
            <TabsTrigger 
              value="alltime" 
              className="rounded-md transition-all duration-300 data-[state=active]:bg-arcane-15 data-[state=active]:text-arcane data-[state=active]:shadow-glow-subtle data-[state=active]:border-b-2 data-[state=active]:border-arcane data-[state=inactive]:hover:bg-arcane-15/30 data-[state=inactive]:hover:text-text-primary text-text-secondary"
            >
              Geral
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      <div>
        <label className="text-sm font-sora text-text-secondary mb-2 block">Ordenar Por</label>
        <Tabs value={metricFilter} onValueChange={onMetricFilterChange} className="w-full">
          <TabsList className="grid grid-cols-3 w-full bg-midnight-elevated overflow-hidden rounded-lg">
            <TabsTrigger 
              value="xp" 
              className="rounded-md transition-all duration-300 data-[state=active]:bg-arcane-15 data-[state=active]:text-arcane data-[state=active]:shadow-glow-subtle data-[state=active]:border-b-2 data-[state=active]:border-arcane data-[state=inactive]:hover:bg-arcane-15/30 data-[state=inactive]:hover:text-text-primary text-text-secondary"
            >
              XP
            </TabsTrigger>
            <TabsTrigger 
              value="workouts" 
              className="rounded-md transition-all duration-300 data-[state=active]:bg-arcane-15 data-[state=active]:text-arcane data-[state=active]:shadow-glow-subtle data-[state=active]:border-b-2 data-[state=active]:border-arcane data-[state=inactive]:hover:bg-arcane-15/30 data-[state=inactive]:hover:text-text-primary text-text-secondary"
            >
              Treinos
            </TabsTrigger>
            <TabsTrigger 
              value="streak" 
              className="rounded-md transition-all duration-300 data-[state=active]:bg-arcane-15 data-[state=active]:text-arcane data-[state=active]:shadow-glow-subtle data-[state=active]:border-b-2 data-[state=active]:border-arcane data-[state=inactive]:hover:bg-arcane-15/30 data-[state=inactive]:hover:text-text-primary text-text-secondary"
            >
              Sequência
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </div>
  );
};

export default LeaderboardFilters;
