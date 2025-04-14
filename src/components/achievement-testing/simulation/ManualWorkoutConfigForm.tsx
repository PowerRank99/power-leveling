
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import ClassPassivesToggle from '../common/ClassPassivesToggle';
import { POWER_DAY_BONUS_XP } from './useManualWorkoutSimulation';

interface ManualWorkoutConfigFormProps {
  activityType: string;
  setActivityType: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
  duration: number;
  setDuration: (value: number) => void;
  isPowerDay: boolean;
  setIsPowerDay: (value: boolean) => void;
  useClassPassives: boolean;
  setUseClassPassives: (value: boolean) => void;
  selectedClass: string | null;
  setSelectedClass: (value: string | null) => void;
}

const ManualWorkoutConfigForm: React.FC<ManualWorkoutConfigFormProps> = ({
  activityType,
  setActivityType,
  description,
  setDescription,
  duration,
  setDuration,
  isPowerDay,
  setIsPowerDay,
  useClassPassives,
  setUseClassPassives,
  selectedClass,
  setSelectedClass,
}) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="activityType">Tipo de Atividade</Label>
        <Select value={activityType} onValueChange={setActivityType}>
          <SelectTrigger id="activityType" className="bg-midnight-elevated border-divider">
            <SelectValue placeholder="Escolha o tipo de atividade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="strength">Musculação</SelectItem>
            <SelectItem value="cardio">Cardio</SelectItem>
            <SelectItem value="running">Corrida</SelectItem>
            <SelectItem value="yoga">Yoga</SelectItem>
            <SelectItem value="sports">Esportes</SelectItem>
            <SelectItem value="bodyweight">Calistenia</SelectItem>
            <SelectItem value="flexibility">Flexibilidade</SelectItem>
            <SelectItem value="swimming">Natação</SelectItem>
            <SelectItem value="other">Outro</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="duration">Duração (minutos)</Label>
        <Input
          id="duration"
          type="number"
          min={5}
          max={180}
          className="bg-midnight-elevated border-divider"
          value={duration}
          onChange={(e) => setDuration(parseInt(e.target.value) || 0)}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description">Descrição</Label>
        <Textarea
          id="description"
          className="bg-midnight-elevated border-divider min-h-[120px]"
          placeholder="Descreva seu treino..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      
      <div className="flex items-center space-x-2 pt-2">
        <Switch
          id="powerDay"
          checked={isPowerDay}
          onCheckedChange={setIsPowerDay}
        />
        <Label htmlFor="powerDay">Activate Power Day (+{POWER_DAY_BONUS_XP} XP)</Label>
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

export default ManualWorkoutConfigForm;
