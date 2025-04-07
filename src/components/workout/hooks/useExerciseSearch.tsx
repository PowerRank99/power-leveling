
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Exercise } from '../types/Exercise';

interface UseExerciseSearchProps {
  selectedExercises: Exercise[];
}

export const useExerciseSearch = ({ selectedExercises }: UseExerciseSearchProps) => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [availableExercises, setAvailableExercises] = useState<Exercise[]>([]);
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [equipmentFilter, setEquipmentFilter] = useState('Todos');
  const [muscleFilter, setMuscleFilter] = useState('Todos');
  const [recentExercises, setRecentExercises] = useState<Exercise[]>([]);

  // Debugging state to track filter changes
  const [debugInfo, setDebugInfo] = useState({
    totalExercises: 0,
    afterEquipmentFilter: 0,
    afterMuscleFilter: 0,
    finalFiltered: 0
  });

  useEffect(() => {
    fetchExercises();
  }, [selectedExercises]);

  useEffect(() => {
    if (availableExercises.length > 0) {
      filterExercises();
    }
  }, [equipmentFilter, muscleFilter, availableExercises, searchQuery]);

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
      
      console.log('Fetched exercises:', exercises.length);
      
      // Log the actual muscle_group and equipment_type values from the database
      const uniqueMuscleGroups = [...new Set(exercises.map(ex => ex.muscle_group))].filter(Boolean);
      const uniqueEquipmentTypes = [...new Set(exercises.map(ex => ex.equipment_type))].filter(Boolean);
      
      console.log('Unique muscle groups in DB:', uniqueMuscleGroups);
      console.log('Unique equipment types in DB:', uniqueEquipmentTypes);
      
      // Process exercises to normalize values for comparison
      const processedExercises = exercises.map(ex => ({
        ...ex,
        muscle_group: ex.muscle_group || 'Não especificado',
        equipment_type: ex.equipment_type || 'Não especificado'
      }));
      
      setAvailableExercises(processedExercises as Exercise[]);
      setFilteredExercises(processedExercises as Exercise[]);
      setDebugInfo(prev => ({ ...prev, totalExercises: processedExercises.length }));
      
      setRecentExercises(processedExercises.slice(0, 5) as Exercise[]);
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
    console.log('Starting filter with', filtered.length, 'exercises');
    
    if (searchQuery.trim()) {
      filtered = filtered.filter(ex => 
        ex.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      console.log('After search filter:', filtered.length, 'exercises');
    }
    
    if (equipmentFilter !== 'Todos') {
      console.log('Filtering by equipment:', equipmentFilter);
      
      filtered = filtered.filter(ex => {
        // Normalize both for comparison - ensure lowercase and trim
        const exEquipment = (ex.equipment_type || '').toLowerCase().trim();
        const filterEquipment = equipmentFilter.toLowerCase().trim();
        
        console.log(`Comparing exercise ${ex.name} equipment "${exEquipment}" with filter "${filterEquipment}"`);
        
        // For "Nenhum" filter
        if (filterEquipment === 'nenhum') {
          return exEquipment === 'nenhum' || exEquipment === '' || !ex.equipment_type;
        }
        
        // For "Não especificado" filter
        if (filterEquipment === 'não especificado') {
          return exEquipment === 'não especificado' || exEquipment === '' || !ex.equipment_type;
        }
        
        // Direct comparison (case-insensitive)
        return exEquipment === filterEquipment;
      });
      
      console.log('After equipment filter:', filtered.length, 'exercises remaining');
      setDebugInfo(prev => ({ ...prev, afterEquipmentFilter: filtered.length }));
    }
    
    if (muscleFilter !== 'Todos') {
      console.log('Filtering by muscle:', muscleFilter);
      
      filtered = filtered.filter(ex => {
        // Normalize both for comparison - ensure lowercase and trim
        const exMuscle = (ex.muscle_group || '').toLowerCase().trim();
        const filterMuscle = muscleFilter.toLowerCase().trim();
        
        console.log(`Comparing exercise ${ex.name} muscle "${exMuscle}" with filter "${filterMuscle}"`);
        
        // For "Não especificado" filter
        if (filterMuscle === 'não especificado') {
          return exMuscle === 'não especificado' || exMuscle === '' || !ex.muscle_group;
        }
        
        // Direct comparison (case-insensitive)
        return exMuscle === filterMuscle;
      });
      
      console.log('After muscle filter:', filtered.length, 'exercises remaining');
      setDebugInfo(prev => ({ ...prev, afterMuscleFilter: filtered.length }));
    }
    
    setFilteredExercises(filtered);
    setDebugInfo(prev => ({ ...prev, finalFiltered: filtered.length }));
    console.log('Final filtered exercises:', filtered.length);
    
    // Log sample exercises for debugging
    if (filtered.length > 0 && filtered.length < 10) {
      filtered.forEach(ex => {
        console.log(`Exercise: ${ex.name}, Muscle: "${ex.muscle_group}", Equipment: "${ex.equipment_type}"`);
      });
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const resetFilters = () => {
    setEquipmentFilter('Todos');
    setMuscleFilter('Todos');
    setSearchQuery('');
  };

  const hasActiveFilters = equipmentFilter !== 'Todos' || muscleFilter !== 'Todos' || searchQuery.trim() !== '';

  return {
    searchQuery,
    setSearchQuery,
    filteredExercises,
    isLoading,
    equipmentFilter,
    setEquipmentFilter,
    muscleFilter,
    setMuscleFilter,
    recentExercises,
    handleSearchChange,
    resetFilters,
    hasActiveFilters,
    debugInfo
  };
};
