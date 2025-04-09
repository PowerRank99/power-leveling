
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Exercise } from '@/components/workout/types/Exercise';
import { 
  MUSCLE_GROUPS, 
  EQUIPMENT_TYPES, 
  categorizeExercise 
} from '@/components/workout/constants/exerciseFilters';

type CategoryStats = Record<string, number>;

const ExerciseCategorizer = () => {
  const { toast } = useToast();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [stats, setStats] = useState<CategoryStats>({});
  const [equipmentStats, setEquipmentStats] = useState<CategoryStats>({});
  const [selectedTab, setSelectedTab] = useState<string>('status');

  useEffect(() => {
    fetchExercises();
  }, []);
  
  const fetchExercises = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .order('name');

      if (error) throw error;
      
      setExercises(data as Exercise[]);
      calculateStats(data as Exercise[]);
      
      toast({
        title: 'Exercícios carregados',
        description: `Carregados ${data?.length || 0} exercícios do banco de dados.`,
      });
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
  
  const calculateStats = (exerciseData: Exercise[]) => {
    const categoryCount: CategoryStats = {};
    const equipmentCount: CategoryStats = {};
    
    // Initialize with all possible categories
    MUSCLE_GROUPS.forEach(group => {
      if (group !== 'Todos') {
        categoryCount[group] = 0;
      }
    });
    
    // Initialize with all possible equipment types
    EQUIPMENT_TYPES.forEach(type => {
      if (type !== 'Todos') {
        equipmentCount[type] = 0;
      }
    });
    
    // Count current distribution
    exerciseData.forEach(exercise => {
      // For muscle groups
      const muscleGroup = exercise.muscle_group || exercise.category || 'Não especificado';
      if (categoryCount[muscleGroup] !== undefined) {
        categoryCount[muscleGroup]++;
      } else {
        categoryCount[muscleGroup] = 1;
      }
      
      // For equipment types
      const equipmentType = exercise.equipment_type || exercise.equipment || 'Não especificado';
      if (equipmentCount[equipmentType] !== undefined) {
        equipmentCount[equipmentType]++;
      } else {
        equipmentCount[equipmentType] = 1;
      }
    });
    
    setStats(categoryCount);
    setEquipmentStats(equipmentCount);
  };
  
  const updateExerciseCategories = async () => {
    setIsUpdating(true);
    const updates: Array<Exercise> = [];
    const categoryUpdates: CategoryStats = {};
    
    // Categorize all exercises
    exercises.forEach(exercise => {
      const newCategory = categorizeExercise(
        exercise.name, 
        exercise.category, 
        exercise.muscle_group
      );
      
      // Only update if category is different
      if (newCategory !== (exercise.muscle_group || exercise.category)) {
        updates.push({
          ...exercise,
          muscle_group: newCategory
        });
        
        // Count updates by category
        if (categoryUpdates[newCategory]) {
          categoryUpdates[newCategory]++;
        } else {
          categoryUpdates[newCategory] = 1;
        }
      }
    });
    
    try {
      // Batch updates in chunks of 50
      const BATCH_SIZE = 50;
      let updatedCount = 0;
      
      for (let i = 0; i < updates.length; i += BATCH_SIZE) {
        const batch = updates.slice(i, i + BATCH_SIZE);
        
        // Update each exercise in the batch
        for (const exercise of batch) {
          const { error } = await supabase
            .from('exercises')
            .update({ muscle_group: exercise.muscle_group })
            .eq('id', exercise.id);
            
          if (!error) {
            updatedCount++;
          } else {
            console.error(`Error updating exercise ${exercise.id}:`, error);
          }
        }
        
        // Update progress toast
        toast({
          title: 'Atualizando categorias',
          description: `Progresso: ${updatedCount}/${updates.length} exercícios`,
        });
      }
      
      // Show final results
      toast({
        title: 'Categorização completa',
        description: `${updatedCount} exercícios foram categorizados com sucesso.`,
      });
      
      // Refresh exercises
      fetchExercises();
      
    } catch (error) {
      console.error('Error updating exercise categories:', error);
      toast({
        title: 'Erro na atualização',
        description: 'Houve um problema ao atualizar as categorias dos exercícios.',
        variant: 'destructive'
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="bg-white rounded-md shadow p-4 mb-6">
      <h3 className="text-lg font-medium mb-4">Categorização de Exercícios</h3>
      
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="status">Status Atual</TabsTrigger>
          <TabsTrigger value="update">Atualizar Categorias</TabsTrigger>
        </TabsList>
        
        <TabsContent value="status" className="space-y-4">
          {isLoading ? (
            <LoadingSpinner message="Carregando exercícios..." />
          ) : (
            <div>
              <div className="mb-4">
                <h4 className="text-md font-medium mb-2">Total de Exercícios: {exercises.length}</h4>
                <p className="text-sm text-gray-500">Distribuição por categoria muscular:</p>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                  {Object.entries(stats).sort(([, a], [, b]) => b - a).map(([category, count]) => (
                    <div 
                      key={category} 
                      className="bg-gray-50 p-3 rounded-md flex justify-between"
                    >
                      <span>{category}</span>
                      <span className="font-medium">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="text-md font-medium mb-2">Distribuição por tipo de equipamento:</h4>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                  {Object.entries(equipmentStats).sort(([, a], [, b]) => b - a).map(([equipment, count]) => (
                    <div 
                      key={equipment} 
                      className="bg-gray-50 p-3 rounded-md flex justify-between"
                    >
                      <span>{equipment}</span>
                      <span className="font-medium">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <Button 
                variant="outline"
                className="mt-4" 
                onClick={fetchExercises}
              >
                Atualizar Estatísticas
              </Button>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="update" className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-100 p-4 rounded-md">
            <h4 className="font-medium text-yellow-800">Informação de Categorização</h4>
            <p className="mt-1 text-yellow-700">
              Esta operação vai analisar todos os {exercises.length} exercícios e atualizar suas categorias 
              com base nos novos grupos musculares: Cardio e Esportes.
            </p>
            <p className="mt-1 text-yellow-700">
              O processo é baseado no nome do exercício e nas categorias existentes. 
              Nenhum exercício será excluído durante este processo.
            </p>
          </div>
          
          <Button
            onClick={updateExerciseCategories}
            disabled={isLoading || isUpdating}
            className="w-full"
          >
            {isUpdating ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" /> 
                Atualizando Categorias...
              </>
            ) : (
              'Iniciar Categorização'
            )}
          </Button>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ExerciseCategorizer;
