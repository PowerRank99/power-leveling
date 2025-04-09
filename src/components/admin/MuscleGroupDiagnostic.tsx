
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Exercise } from '@/components/workout/types/Exercise';
import { normalizeText } from '@/components/workout/hooks/exercise-search/useExerciseFilters';
import { MUSCLE_GROUP_ALIASES } from '@/components/workout/constants/exerciseFilters';

type MuscleGroupStats = {
  [key: string]: {
    count: number;
    exercises: Exercise[];
  }
}

const MuscleGroupDiagnostic = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isFixing, setIsFixing] = useState(false);
  const [stats, setStats] = useState<MuscleGroupStats>({});
  const [selectedTab, setSelectedTab] = useState("diagnostics");
  const [diagnosticResults, setDiagnosticResults] = useState<string[]>([]);
  
  // Run diagnostics on Bíceps and Tríceps categorization
  const runDiagnostics = async () => {
    setIsLoading(true);
    setDiagnosticResults([]);
    
    try {
      const logMessage = (msg: string) => {
        setDiagnosticResults(prev => [...prev, msg]);
      };
      
      // Log start of diagnostics
      logMessage('Starting muscle group diagnostics...');
      
      // Check total exercises
      const { count: totalExercises, error: totalError } = await supabase
        .from('exercises')
        .select('*', { count: 'exact', head: true });
        
      if (totalError) throw totalError;
      logMessage(`Total exercises in database: ${totalExercises}`);
      
      // Fetch all exercises for detailed analysis
      const { data: allExercises, error: fetchError } = await supabase
        .from('exercises')
        .select('*')
        .order('name');
        
      if (fetchError) throw fetchError;
      
      // Group exercises by muscle group
      const muscleGroupStats: MuscleGroupStats = {};
      
      allExercises?.forEach(ex => {
        const muscleGroup = ex.muscle_group || ex.category || 'Não especificado';
        
        if (!muscleGroupStats[muscleGroup]) {
          muscleGroupStats[muscleGroup] = {
            count: 0,
            exercises: []
          };
        }
        
        muscleGroupStats[muscleGroup].count++;
        muscleGroupStats[muscleGroup].exercises.push(ex as Exercise);
      });
      
      setStats(muscleGroupStats);
      
      // Check Bíceps exercises specifically
      const { data: bicepsExercises, error: bicepsError } = await supabase
        .from('exercises')
        .select('*')
        .or('muscle_group.eq.Bíceps,category.eq.Bíceps');
        
      if (bicepsError) throw bicepsError;
      logMessage(`Found ${bicepsExercises?.length || 0} exercises categorized as Bíceps`);
      
      // Check Tríceps exercises specifically
      const { data: tricepsExercises, error: tricepsError } = await supabase
        .from('exercises')
        .select('*')
        .or('muscle_group.eq.Tríceps,category.eq.Tríceps');
        
      if (tricepsError) throw tricepsError;
      logMessage(`Found ${tricepsExercises?.length || 0} exercises categorized as Tríceps`);
      
      // Find potential misclassified exercises
      const bicepsKeywords = ['curl', 'rosca', 'biceps', 'bíceps'];
      const tricepsKeywords = ['tríceps', 'triceps', 'extensão', 'pushdown', 'mergulho'];
      
      const potentialBiceps = allExercises?.filter(ex => {
        const normalizedName = normalizeText(ex.name);
        const muscleGroup = ex.muscle_group || ex.category || '';
        return bicepsKeywords.some(keyword => normalizedName.includes(keyword)) && 
               muscleGroup !== 'Bíceps';
      }) || [];
      
      const potentialTriceps = allExercises?.filter(ex => {
        const normalizedName = normalizeText(ex.name);
        const muscleGroup = ex.muscle_group || ex.category || '';
        return tricepsKeywords.some(keyword => normalizedName.includes(keyword)) && 
               muscleGroup !== 'Tríceps';
      }) || [];
      
      logMessage(`Found ${potentialBiceps.length} potential Bíceps exercises that may be misclassified`);
      potentialBiceps.forEach(ex => {
        logMessage(`- "${ex.name}" is currently categorized as "${ex.muscle_group || ex.category || 'Não especificado'}"`);
      });
      
      logMessage(`Found ${potentialTriceps.length} potential Tríceps exercises that may be misclassified`);
      potentialTriceps.forEach(ex => {
        logMessage(`- "${ex.name}" is currently categorized as "${ex.muscle_group || ex.category || 'Não especificado'}"`);
      });
      
      logMessage('Diagnostics completed!');
      
      toast({
        title: 'Diagnóstico concluído',
        description: `Analisados ${allExercises?.length || 0} exercícios.`,
      });
    } catch (error) {
      console.error('Diagnostic error:', error);
      toast({
        title: 'Erro no diagnóstico',
        description: 'Houve um problema ao diagnosticar os exercícios.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fix the Bíceps and Tríceps categorization issues
  const fixCategorizationIssues = async () => {
    setIsFixing(true);
    setDiagnosticResults([]);
    
    try {
      const logMessage = (msg: string) => {
        setDiagnosticResults(prev => [...prev, msg]);
      };
      
      logMessage('Starting categorization fixes...');
      
      // Define keywords for identifying exercises
      const bicepsKeywords = ['curl', 'rosca', 'biceps', 'bíceps'];
      const tricepsKeywords = ['tríceps', 'triceps', 'extensão de tríceps', 'pushdown', 'mergulho'];
      
      // Update potential Bíceps exercises
      let bicepsUpdated = 0;
      for (const keyword of bicepsKeywords) {
        logMessage(`Finding exercises with keyword: ${keyword}`);
        
        const { data, error } = await supabase
          .from('exercises')
          .update({ muscle_group: 'Bíceps' })
          .neq('muscle_group', 'Bíceps')
          .ilike('name', `%${keyword}%`);
          
        if (error) {
          logMessage(`Error updating exercises with keyword "${keyword}": ${error.message}`);
        } else {
          bicepsUpdated++;
          logMessage(`Updated exercises containing "${keyword}"`);
        }
      }
      
      // Update potential Tríceps exercises
      let tricepsUpdated = 0;
      for (const keyword of tricepsKeywords) {
        logMessage(`Finding exercises with keyword: ${keyword}`);
        
        const { data, error } = await supabase
          .from('exercises')
          .update({ muscle_group: 'Tríceps' })
          .neq('muscle_group', 'Tríceps')
          .ilike('name', `%${keyword}%`);
          
        if (error) {
          logMessage(`Error updating exercises with keyword "${keyword}": ${error.message}`);
        } else {
          tricepsUpdated++;
          logMessage(`Updated exercises containing "${keyword}"`);
        }
      }
      
      // Update old category field to match muscle_group for consistency
      const { error: categoryUpdateError } = await supabase
        .from('exercises')
        .update({ category: 'Bíceps' })
        .eq('muscle_group', 'Bíceps');
        
      if (categoryUpdateError) {
        logMessage(`Error updating category field for Bíceps: ${categoryUpdateError.message}`);
      } else {
        logMessage('Updated category field to match muscle_group for Bíceps exercises');
      }
      
      const { error: tricepsCategoryUpdateError } = await supabase
        .from('exercises')
        .update({ category: 'Tríceps' })
        .eq('muscle_group', 'Tríceps');
        
      if (tricepsCategoryUpdateError) {
        logMessage(`Error updating category field for Tríceps: ${tricepsCategoryUpdateError.message}`);
      } else {
        logMessage('Updated category field to match muscle_group for Tríceps exercises');
      }
      
      logMessage('Fix completed! Running diagnostics again to verify changes...');
      
      // Re-run diagnostics to verify changes
      await runDiagnostics();
      
      toast({
        title: 'Correção concluída',
        description: 'As categorias de Bíceps e Tríceps foram atualizadas.',
      });
    } catch (error) {
      console.error('Fix error:', error);
      toast({
        title: 'Erro na correção',
        description: 'Houve um problema ao corrigir as categorias dos exercícios.',
        variant: 'destructive'
      });
    } finally {
      setIsFixing(false);
    }
  };

  return (
    <div className="bg-white rounded-md shadow p-4">
      <h3 className="text-lg font-medium mb-4">Diagnóstico de Grupos Musculares</h3>
      
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="diagnostics">Diagnóstico</TabsTrigger>
          <TabsTrigger value="stats">Estatísticas</TabsTrigger>
          <TabsTrigger value="fix">Corrigir</TabsTrigger>
        </TabsList>
        
        <TabsContent value="diagnostics" className="space-y-4">
          <Button 
            onClick={runDiagnostics}
            disabled={isLoading}
            className="mb-4"
          >
            {isLoading ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" /> 
                Executando diagnóstico...
              </>
            ) : 'Executar Diagnóstico'}
          </Button>
          
          {diagnosticResults.length > 0 && (
            <div className="bg-gray-50 p-4 rounded-md overflow-auto max-h-96">
              <pre className="text-sm">
                {diagnosticResults.map((line, index) => (
                  <div key={index} className="py-1">{line}</div>
                ))}
              </pre>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="stats" className="space-y-4">
          {Object.keys(stats).length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {Object.entries(stats)
                .sort(([, a], [, b]) => b.count - a.count)
                .map(([muscleGroup, { count, exercises }]) => (
                <div key={muscleGroup} className="border rounded-md p-4">
                  <h4 className="font-medium text-lg">{muscleGroup} <span className="text-sm font-normal text-gray-500">({count} exercícios)</span></h4>
                  <div className="mt-2 max-h-40 overflow-y-auto">
                    <ul className="text-sm">
                      {exercises.map(ex => (
                        <li key={ex.id} className="py-1">
                          {ex.name}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">Execute o diagnóstico para ver estatísticas dos grupos musculares.</p>
          )}
        </TabsContent>
        
        <TabsContent value="fix" className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-100 p-4 rounded-md">
            <h4 className="font-medium text-yellow-800">Atenção - Correção Automática</h4>
            <p className="mt-1 text-yellow-700">
              Esta operação vai analisar os nomes dos exercícios e corrigir automaticamente as categorias de Bíceps e Tríceps.
              A correção é baseada em palavras-chave como "curl", "rosca", "extensão", etc.
            </p>
          </div>
          
          <Button
            onClick={fixCategorizationIssues}
            disabled={isFixing}
            variant="destructive"
            className="w-full"
          >
            {isFixing ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" /> 
                Corrigindo categorias...
              </>
            ) : 'Corrigir Categorias de Bíceps/Tríceps'}
          </Button>
          
          {diagnosticResults.length > 0 && (
            <div className="bg-gray-50 p-4 rounded-md overflow-auto max-h-96">
              <pre className="text-sm">
                {diagnosticResults.map((line, index) => (
                  <div key={index} className="py-1">{line}</div>
                ))}
              </pre>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MuscleGroupDiagnostic;
