
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Search, Filter, X, Barbell, Dumbbell } from 'lucide-react';
import ExerciseCard from './ExerciseCard';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';

export interface Exercise {
  id: string;
  name: string;
  category: string;
  level: string;
  type: string;
  image_url?: string;
  description?: string;
  equipment?: string;
  equipment_type?: string;
  muscle_group?: string;
}

interface ExerciseSearchProps {
  selectedExercises: Exercise[];
  onAddExercise: (exercise: Exercise) => void;
  onClose: () => void;
}

// Equipment types for filtering
export const EQUIPMENT_TYPES = [
  'Todos',
  'Nenhum', // Bodyweight
  'Barra', // Barbell
  'Halter', // Dumbbell
  'Kettlebell',
  'Máquina', // Machine
  'Anilha', // Plate
  'Elástico', // Resistance Band
  'TRX', // Suspension Band
  'Cabo', // Cable
  'Banco', // Bench
  'Outro' // Other
];

// Muscle groups for filtering
export const MUSCLE_GROUPS = [
  'Todos',
  'Abdômen', // Abdominals
  'Abdutores', // Abductors
  'Adutores', // Adductors
  'Antebraços', // Forearms
  'Bíceps', // Biceps
  'Cardio',
  'Costas', // Back (general)
  'Costas (Superior)', // Upper back
  'Costas (Média)', // Middle back
  'Costas (Inferior)', // Lower back
  'Deltoides', // Shoulders
  'Glúteos', // Glutes
  'Isquiotibiais', // Hamstrings
  'Lombar', // Lower back
  'Oblíquos', // Obliques
  'Panturrilha', // Calves
  'Peito', // Chest
  'Pescoço', // Neck
  'Quadríceps', // Quadriceps
  'Trapézio', // Traps
  'Tríceps' // Triceps
];

const ExerciseSearch: React.FC<ExerciseSearchProps> = ({
  selectedExercises,
  onAddExercise,
  onClose,
}) => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [availableExercises, setAvailableExercises] = useState<Exercise[]>([]);
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [equipmentFilter, setEquipmentFilter] = useState('Todos');
  const [muscleFilter, setMuscleFilter] = useState('Todos');
  const [recentExercises, setRecentExercises] = useState<Exercise[]>([]);

  // Load exercises on initial mount
  useEffect(() => {
    fetchExercises();
  }, []);

  // Apply filters when they change or when available exercises change
  useEffect(() => {
    filterExercises();
  }, [equipmentFilter, muscleFilter, availableExercises]);

  const fetchExercises = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .order('name');
      
      if (error) throw error;
      
      const selectedIds = selectedExercises.map(ex => ex.id);
      const exercises = data?.filter(ex => !selectedIds.includes(ex.id)) || [];
      
      setAvailableExercises(exercises as Exercise[]);
      setFilteredExercises(exercises as Exercise[]);
      
      // Simulate recent exercises (would usually be fetched from user history)
      setRecentExercises(exercises.slice(0, 5) as Exercise[]);
    } catch (error) {
      console.error('Error fetching exercises:', error);
      toast({
        title: 'Erro na busca',
        description: 'Não foi possível buscar exercícios. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterExercises = () => {
    let filtered = [...availableExercises];
    
    // Apply search query filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(ex => 
        ex.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply equipment filter
    if (equipmentFilter !== 'Todos') {
      filtered = filtered.filter(ex => 
        ex.equipment_type === equipmentFilter
      );
    }
    
    // Apply muscle filter
    if (muscleFilter !== 'Todos') {
      filtered = filtered.filter(ex => 
        ex.muscle_group === muscleFilter
      );
    }
    
    setFilteredExercises(filtered);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    // Apply search filter with small delay for better UX
    setTimeout(() => filterExercises(), 300);
  };

  const resetFilters = () => {
    setEquipmentFilter('Todos');
    setMuscleFilter('Todos');
    setSearchQuery('');
    setFilteredExercises(availableExercises);
  };

  // Check if any filters are active
  const hasActiveFilters = equipmentFilter !== 'Todos' || muscleFilter !== 'Todos' || searchQuery.trim() !== '';

  return (
    <div className="bg-white rounded-lg shadow-md mb-4">
      {/* Search and filter bar */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex gap-2 items-center mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Buscar exercícios..."
              className="pl-10"
            />
          </div>
          
          {/* Reset filters button */}
          {hasActiveFilters && (
            <Button 
              variant="ghost" 
              size="icon"
              onClick={resetFilters}
            >
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>

        <div className="flex gap-2">
          {/* Equipment filter */}
          <Sheet>
            <SheetTrigger asChild>
              <Button 
                variant="outline" 
                className={`flex-1 ${equipmentFilter !== 'Todos' ? 'bg-fitblue-50 text-fitblue border-fitblue' : ''}`}
              >
                <Dumbbell className="mr-2 h-4 w-4" />
                {equipmentFilter === 'Todos' ? 'Equipamento' : equipmentFilter}
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[60vh]">
              <SheetHeader>
                <SheetTitle>Selecione o equipamento</SheetTitle>
              </SheetHeader>
              <div className="grid grid-cols-2 gap-2 mt-4">
                {EQUIPMENT_TYPES.map(type => (
                  <Button 
                    key={type} 
                    variant={equipmentFilter === type ? "default" : "outline"}
                    className="justify-start"
                    onClick={() => {
                      setEquipmentFilter(type);
                      const sheetCloseButton = document.querySelector('[data-radix-collection-item]') as HTMLElement;
                      if (sheetCloseButton) sheetCloseButton.click();
                    }}
                  >
                    {type}
                  </Button>
                ))}
              </div>
            </SheetContent>
          </Sheet>

          {/* Muscle group filter */}
          <Sheet>
            <SheetTrigger asChild>
              <Button 
                variant="outline" 
                className={`flex-1 ${muscleFilter !== 'Todos' ? 'bg-fitblue-50 text-fitblue border-fitblue' : ''}`}
              >
                <Filter className="mr-2 h-4 w-4" />
                {muscleFilter === 'Todos' ? 'Músculos' : muscleFilter}
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[60vh] overflow-y-auto">
              <SheetHeader>
                <SheetTitle>Selecione o grupo muscular</SheetTitle>
              </SheetHeader>
              <div className="grid grid-cols-2 gap-2 mt-4">
                {MUSCLE_GROUPS.map(muscle => (
                  <Button 
                    key={muscle} 
                    variant={muscleFilter === muscle ? "default" : "outline"}
                    className="justify-start"
                    onClick={() => {
                      setMuscleFilter(muscle);
                      const sheetCloseButton = document.querySelector('[data-radix-collection-item]') as HTMLElement;
                      if (sheetCloseButton) sheetCloseButton.click();
                    }}
                  >
                    {muscle}
                  </Button>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Exercise list */}
      <div className="max-h-[60vh] overflow-y-auto p-4">
        {isLoading ? (
          <LoadingSpinner message="Buscando exercícios..." />
        ) : (
          <div>
            {/* Recent exercises section */}
            {searchQuery === '' && equipmentFilter === 'Todos' && muscleFilter === 'Todos' && recentExercises.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Recentes</h3>
                {recentExercises.map(exercise => (
                  <div 
                    key={exercise.id} 
                    className="cursor-pointer" 
                    onClick={() => onAddExercise(exercise)}
                  >
                    <ExerciseCard
                      name={exercise.name}
                      category={exercise.category}
                      level={exercise.level as any}
                      image={exercise.image_url || '/placeholder.svg'}
                      description={exercise.description}
                      equipment={exercise.equipment}
                      muscleGroup={exercise.muscle_group}
                      equipmentType={exercise.equipment_type}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* All exercises or filtered results */}
            {filteredExercises.length > 0 ? (
              <div>
                {hasActiveFilters && (
                  <h3 className="text-sm font-medium text-gray-500 mb-2">
                    {filteredExercises.length} resultado{filteredExercises.length !== 1 ? 's' : ''}
                  </h3>
                )}
                {filteredExercises.map(exercise => (
                  <div 
                    key={exercise.id} 
                    className="cursor-pointer" 
                    onClick={() => onAddExercise(exercise)}
                  >
                    <ExerciseCard
                      name={exercise.name}
                      category={exercise.category}
                      level={exercise.level as any}
                      image={exercise.image_url || '/placeholder.svg'}
                      description={exercise.description}
                      equipment={exercise.equipment}
                      muscleGroup={exercise.muscle_group}
                      equipmentType={exercise.equipment_type}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState message={
                searchQuery ? 
                `Nenhum exercício encontrado para "${searchQuery}"${equipmentFilter !== 'Todos' ? ` com ${equipmentFilter}` : ''}${muscleFilter !== 'Todos' ? ` para ${muscleFilter}` : ''}.` : 
                "Nenhum exercício encontrado com os filtros selecionados."
              } />
            )}
          </div>
        )}
      </div>

      {/* Bottom actions */}
      <div className="p-4 border-t border-gray-200">
        <Button 
          variant="outline" 
          className="w-full"
          onClick={onClose}
        >
          Fechar Busca
        </Button>
      </div>
    </div>
  );
};

export default ExerciseSearch;
