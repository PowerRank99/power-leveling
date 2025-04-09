
import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Filter } from "lucide-react";

interface ExerciseFiltersProps {
  searchQuery: string;
  muscleFilter: string;
  equipmentFilter: string;
  muscleGroups: string[];
  equipmentTypes: string[];
  onSearchQueryChange: (value: string) => void;
  onMuscleFilterChange: (value: string) => void;
  onEquipmentFilterChange: (value: string) => void;
  resetFilters: () => void;
}

const ExerciseFilters: React.FC<ExerciseFiltersProps> = ({
  searchQuery,
  muscleFilter,
  equipmentFilter,
  muscleGroups,
  equipmentTypes,
  onSearchQueryChange,
  onMuscleFilterChange,
  onEquipmentFilterChange,
  resetFilters,
}) => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm">
          <Filter className="mr-2 h-4 w-4" />
          Filtrar
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Filtrar Exercícios</SheetTitle>
          <SheetDescription>
            Aplique filtros para encontrar exercícios específicos.
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Pesquisar por nome</label>
            <Input
              placeholder="Nome do exercício"
              value={searchQuery}
              onChange={(e) => onSearchQueryChange(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Grupo Muscular</label>
            <Select value={muscleFilter} onValueChange={onMuscleFilterChange}>
              <SelectTrigger>
                <SelectValue placeholder="Selecionar grupo muscular" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos</SelectItem>
                {muscleGroups.filter(g => g !== '').map(group => (
                  <SelectItem key={group} value={group}>{group}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Equipamento</label>
            <Select value={equipmentFilter} onValueChange={onEquipmentFilterChange}>
              <SelectTrigger>
                <SelectValue placeholder="Selecionar equipamento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos</SelectItem>
                {equipmentTypes.filter(e => e !== '').map(equipment => (
                  <SelectItem key={equipment} value={equipment}>{equipment}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="pt-4">
            <Button variant="outline" size="sm" onClick={resetFilters}>
              Limpar Filtros
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ExerciseFilters;
