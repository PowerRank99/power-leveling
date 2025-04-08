
import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface TimerPreset {
  label: string;
  minutes: number;
  seconds: number;
}

interface TimerPresetSelectorProps {
  presets: TimerPreset[];
  defaultValue: string;
  onPresetChange: (value: string) => void;
}

const TimerPresetSelector: React.FC<TimerPresetSelectorProps> = ({ 
  presets, 
  defaultValue, 
  onPresetChange 
}) => {
  return (
    <div className="w-full mt-2 animate-scale-in">
      <Select 
        onValueChange={onPresetChange} 
        defaultValue={defaultValue}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Selecione o tempo" />
        </SelectTrigger>
        <SelectContent>
          {presets.map((preset) => (
            <SelectItem key={preset.label} value={preset.label}>
              {preset.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default TimerPresetSelector;
