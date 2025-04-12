
import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EXERCISE_TYPES, CLASS_PASSIVE_SKILLS } from '@/services/rpg/constants/exerciseTypes';

interface ClassPassivesToggleProps {
  enabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
  selectedClass: string | null;
  onClassChange: (className: string) => void;
}

const ClassPassivesToggle: React.FC<ClassPassivesToggleProps> = ({
  enabled,
  onEnabledChange,
  selectedClass,
  onClassChange
}) => {
  const classes = ['Guerreiro', 'Monge', 'Ninja', 'Bruxo', 'Paladino'];
  
  // Initialize class if none selected
  useEffect(() => {
    if (enabled && !selectedClass && classes.length > 0) {
      onClassChange(classes[0]);
    }
  }, [enabled, selectedClass, onClassChange]);

  return (
    <div className="space-y-3">
      <div className="flex items-center space-x-2">
        <Switch
          id="enableClassPassives"
          checked={enabled}
          onCheckedChange={onEnabledChange}
        />
        <Label htmlFor="enableClassPassives">Enable Class Passives</Label>
      </div>
      
      {enabled && (
        <div className="pl-6 border-l-2 border-arcane-30">
          <Label htmlFor="classSelect">Selected Class</Label>
          <Select 
            value={selectedClass || ''} 
            onValueChange={onClassChange}
          >
            <SelectTrigger id="classSelect" className="bg-midnight-elevated border-divider mt-1">
              <SelectValue placeholder="Select class" />
            </SelectTrigger>
            <SelectContent>
              {classes.map((className) => (
                <SelectItem key={className} value={className}>
                  {className}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {selectedClass && (
            <div className="mt-2 text-xs text-text-secondary p-2 bg-midnight-card rounded border border-divider/30">
              <p className="font-semibold text-arcane-60 mb-1">Class bonuses:</p>
              <ul className="space-y-1">
                {CLASS_PASSIVE_SKILLS[selectedClass as keyof typeof CLASS_PASSIVE_SKILLS]?.map((bonus, index) => (
                  <li key={index}>{bonus}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ClassPassivesToggle;
