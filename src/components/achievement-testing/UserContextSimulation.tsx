
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';

interface UserContextSimulationProps {
  currentUserId: string;
  onUserChange: (userId: string) => void;
  addLogEntry: (action: string, details: string) => void;
}

const UserContextSimulation: React.FC<UserContextSimulationProps> = ({
  currentUserId,
  onUserChange,
  addLogEntry
}) => {
  const classes = ['Guerreiro', 'Monge', 'Ninja', 'Bruxo', 'Paladino', 'Druida'];
  const [selectedClass, setSelectedClass] = React.useState<string>('');

  const handleClassChange = (className: string) => {
    setSelectedClass(className);
    addLogEntry('Class Changed', `Selected class: ${className}`);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="userId">User ID</Label>
          <Input
            id="userId"
            value={currentUserId}
            onChange={(e) => onUserChange(e.target.value)}
            placeholder="Enter user ID"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="class">Class</Label>
          <Select value={selectedClass} onValueChange={handleClassChange}>
            <SelectTrigger id="class">
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
        </div>
      </div>

      <Card className="bg-midnight-card">
        <CardContent className="p-4">
          <div className="text-sm space-y-2">
            <h3 className="font-semibold text-arcane mb-2">Class Bonuses:</h3>
            {selectedClass && (
              <ul className="space-y-2 text-text-secondary">
                {selectedClass === 'Guerreiro' && (
                  <>
                    <li>• Força Bruta: +20% XP from strength training exercises</li>
                    <li>• Saindo da Jaula: +10% XP for workouts with Personal Records</li>
                  </>
                )}
                {selectedClass === 'Monge' && (
                  <>
                    <li>• Força Interior: +20% XP from bodyweight exercises</li>
                    <li>• Discípulo do Algoritmo: +10% additional streak bonus</li>
                  </>
                )}
                {selectedClass === 'Ninja' && (
                  <>
                    <li>• Forrest Gump: +20% XP from cardio exercises</li>
                    <li>• HIIT & Run: +40% XP from workouts under 45 minutes</li>
                  </>
                )}
                {selectedClass === 'Bruxo' && (
                  <>
                    <li>• Pijama Arcano: Reduced streak loss when not training</li>
                    <li>• Topo da Montanha: +50% achievement points</li>
                  </>
                )}
                {selectedClass === 'Paladino' && (
                  <>
                    <li>• Caminho do Herói: +40% XP from sports activities</li>
                    <li>• Camisa 10: +10% guild XP contribution (stackable)</li>
                  </>
                )}
                {selectedClass === 'Druida' && (
                  <>
                    <li>• Ritmo da Natureza: +40% XP from mobility & flexibility</li>
                    <li>• Cochilada Mística: +50% XP bonus after rest day</li>
                  </>
                )}
              </ul>
            )}
            {!selectedClass && (
              <p className="text-text-tertiary italic">Select a class to view bonuses</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserContextSimulation;
