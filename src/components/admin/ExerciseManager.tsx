
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';
import ExerciseCard from '@/components/workout/ExerciseCard';
import { 
  Trash2, 
  RefreshCcw, 
  Filter, 
  CheckSquare, 
  XSquare
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Input } from '@/components/ui/input';
import { useCategoryManagement } from './CategoryManagement';
import { MUSCLE_GROUPS, EQUIPMENT_TYPES } from '@/components/workout/constants/exerciseFilters';

interface Exercise {
  id: string;
  name: string;
  category: string;
  level: string;
  type: string; // Keep this for database compatibility
  image_url?: string;
  description?: string;
  equipment?: string;
  muscle_group?: string;
  equipment_type?: string;
}

const ExerciseManager = () => {
  const { toast } = useToast();
  const { getUniqueValues } = useCategoryManagement();
  
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [selectedExercises, setSelectedExercises] = useState<string[]>([]);
  
  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [muscleFilter, setMuscleFilter] = useState('');
  const [equipmentFilter, setEquipmentFilter] = useState('');
  const [muscleGroups, setMuscleGroups] = useState<string[]>([]);
  const [equipmentTypes, setEquipmentTypes] = useState<string[]>([]);

  useEffect(() => {
    fetchExercises();
    loadCategoryOptions();
  }, []);

  const loadCategoryOptions = async () => {
    const muscleData = await getUniqueValues('muscle_group');
    const equipmentData = await getUniqueValues('equipment_type');
    
    setMuscleGroups(['', ...muscleData.map(item => item.name)]);
    setEquipmentTypes(['', ...equipmentData.map(item => item.name)]);
  };

  const fetchExercises = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .order('name');

      if (error) throw error;
      setExercises(data as Exercise[]);
      setSelectedExercises([]);
    } catch (error) {
      console.error('Error fetching exercises:', error);
      toast({
        title: 'Erro ao carregar exercícios',
        description: 'Não foi possível carregar a lista de exercícios.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este exercício?')) {
      setIsDeleting(id);
      try {
        const { error } = await supabase
          .from('exercises')
          .delete()
          .eq('id', id);

        if (error) throw error;
        
        setExercises(exercises.filter(exercise => exercise.id !== id));
        
        toast({
          title: 'Exercício excluído',
          description: 'O exercício foi excluído com sucesso.',
        });
      } catch (error) {
        console.error('Error deleting exercise:', error);
        toast({
          title: 'Erro ao excluir exercício',
          description: 'Não foi possível excluir o exercício.',
          variant: 'destructive'
        });
      } finally {
        setIsDeleting(null);
      }
    }
  };
  
  const handleDeleteSelected = async () => {
    if (selectedExercises.length === 0) return;
    
    if (window.confirm(`Tem certeza que deseja excluir ${selectedExercises.length} exercício(s)?`)) {
      try {
        const { error } = await supabase
          .from('exercises')
          .delete()
          .in('id', selectedExercises);

        if (error) throw error;
        
        setExercises(exercises.filter(exercise => !selectedExercises.includes(exercise.id)));
        setSelectedExercises([]);
        
        toast({
          title: 'Exercícios excluídos',
          description: `${selectedExercises.length} exercício(s) foram excluídos com sucesso.`,
        });
      } catch (error) {
        console.error('Error deleting multiple exercises:', error);
        toast({
          title: 'Erro ao excluir exercícios',
          description: 'Não foi possível excluir os exercícios selecionados.',
          variant: 'destructive'
        });
      }
    }
  };
  
  const toggleExerciseSelection = (id: string) => {
    setSelectedExercises(prev => 
      prev.includes(id) ? prev.filter(exId => exId !== id) : [...prev, id]
    );
  };
  
  const toggleSelectAll = () => {
    if (selectedExercises.length === filteredExercises.length) {
      setSelectedExercises([]);
    } else {
      setSelectedExercises(filteredExercises.map(ex => ex.id));
    }
  };

  const resetFilters = () => {
    setSearchQuery('');
    setMuscleFilter('');
    setEquipmentFilter('');
  };

  // Filter exercises based on current filters
  const filteredExercises = exercises.filter(exercise => {
    const matchesSearch = searchQuery === '' || 
      exercise.name.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesMuscle = muscleFilter === '' || 
      (exercise.muscle_group && exercise.muscle_group === muscleFilter);
      
    const matchesEquipment = equipmentFilter === '' || 
      (exercise.equipment_type && exercise.equipment_type === equipmentFilter);
      
    return matchesSearch && matchesMuscle && matchesEquipment;
  });

  return (
    <div className="mb-6">
      <div className="flex flex-wrap justify-between items-center mb-4 gap-2">
        <div>
          <h3 className="text-lg font-bold">Exercícios Cadastrados ({exercises.length})</h3>
          <div className="text-sm text-gray-500">
            {filteredExercises.length !== exercises.length && 
              `Mostrando ${filteredExercises.length} de ${exercises.length}`}
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {selectedExercises.length > 0 && (
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={handleDeleteSelected}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Excluir ({selectedExercises.length})
            </Button>
          )}

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
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Grupo Muscular</label>
                  <Select value={muscleFilter} onValueChange={setMuscleFilter}>
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
                  <Select value={equipmentFilter} onValueChange={setEquipmentFilter}>
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
          
          <Button variant="outline" size="sm" onClick={toggleSelectAll}>
            {selectedExercises.length === filteredExercises.length && filteredExercises.length > 0 ? (
              <>
                <XSquare className="mr-2 h-4 w-4" />
                Desmarcar Todos
              </>
            ) : (
              <>
                <CheckSquare className="mr-2 h-4 w-4" />
                Selecionar Todos
              </>
            )}
          </Button>
          
          <Button variant="outline" size="sm" onClick={fetchExercises}>
            <RefreshCcw className="mr-2 h-4 w-4" />
            Atualizar
          </Button>
        </div>
      </div>
      
      {isLoading ? (
        <LoadingSpinner message="Carregando exercícios..." />
      ) : filteredExercises.length > 0 ? (
        <div className="space-y-3">
          {filteredExercises.map(exercise => (
            <div key={exercise.id} className="relative border rounded-lg">
              <div className="absolute top-3 left-3 z-10">
                <Checkbox
                  checked={selectedExercises.includes(exercise.id)}
                  onCheckedChange={() => toggleExerciseSelection(exercise.id)}
                />
              </div>
              
              <div className="pt-3 pl-10">
                <ExerciseCard
                  name={exercise.name}
                  category={exercise.category}
                  level={exercise.level as any}
                  image={exercise.image_url || '/placeholder.svg'}
                  description={exercise.description}
                  equipment={exercise.equipment}
                  muscle_group={exercise.muscle_group}
                  equipment_type={exercise.equipment_type}
                />
              </div>
              
              <button 
                className={`absolute top-3 right-3 bg-red-100 text-red-600 p-2 rounded-full ${isDeleting === exercise.id ? 'opacity-50' : ''}`}
                onClick={() => handleDelete(exercise.id)}
                disabled={isDeleting === exercise.id}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState message={
          exercises.length === 0 
            ? "Não há exercícios cadastrados ainda. Use o importador de exercícios para adicionar."
            : "Nenhum exercício corresponde aos filtros aplicados."
        } />
      )}
    </div>
  );
};

export default ExerciseManager;
