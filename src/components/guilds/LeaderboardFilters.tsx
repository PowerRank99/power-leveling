
import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion } from 'framer-motion';

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
    <div className="p-4 bg-midnight-card border-b border-divider">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold font-orbitron tracking-wide text-text-primary">Classificação</h3>
        
        <Select value={metricFilter} onValueChange={onMetricFilterChange}>
          <SelectTrigger className="w-36 h-9 bg-midnight-elevated text-text-secondary border-divider">
            <SelectValue placeholder="Métrica" />
          </SelectTrigger>
          <SelectContent className="bg-midnight-elevated text-text-primary border-divider">
            <SelectItem value="xp">EXP Ganho</SelectItem>
            <SelectItem value="workouts">Dias de Treino</SelectItem>
            <SelectItem value="streak">Sequência</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <Tabs defaultValue="weekly" className="w-full" value={timeFilter} onValueChange={onTimeFilterChange}>
        <TabsList className="grid grid-cols-3 w-full bg-midnight-elevated">
          <TabsTrigger value="weekly" className="font-orbitron data-[state=active]:bg-arcane data-[state=active]:text-text-primary data-[state=active]:shadow-glow-purple relative overflow-hidden">
            <motion.span
              className="absolute inset-0 bg-arcane-15"
              initial={{ x: "-100%" }}
              animate={{ x: timeFilter === "weekly" ? "0%" : "-100%" }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            />
            <span className="relative z-10">Semanal</span>
          </TabsTrigger>
          <TabsTrigger value="monthly" className="font-orbitron data-[state=active]:bg-arcane data-[state=active]:text-text-primary data-[state=active]:shadow-glow-purple relative overflow-hidden">
            <motion.span
              className="absolute inset-0 bg-arcane-15"
              initial={{ x: "-100%" }}
              animate={{ x: timeFilter === "monthly" ? "0%" : "-100%" }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            />
            <span className="relative z-10">Mensal</span>
          </TabsTrigger>
          <TabsTrigger value="alltime" className="font-orbitron data-[state=active]:bg-arcane data-[state=active]:text-text-primary data-[state=active]:shadow-glow-purple relative overflow-hidden">
            <motion.span
              className="absolute inset-0 bg-arcane-15"
              initial={{ x: "-100%" }}
              animate={{ x: timeFilter === "alltime" ? "0%" : "-100%" }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            />
            <span className="relative z-10">Anual</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
};

export default LeaderboardFilters;
