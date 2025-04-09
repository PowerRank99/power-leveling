
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';
import { normalizeText } from '@/components/workout/hooks/exercise-search/useExerciseFilters';

interface ExerciseData {
  name: string;
  category?: string;
  level?: string;
  type?: string;
  description?: string;
  equipment?: string;
  equipment_type?: string;
  muscle_group?: string;
}

const ExerciseImporter = () => {
  const { toast } = useToast();
  const [jsonData, setJsonData] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<{imported: number; errors: string[]}>({ imported: 0, errors: [] });
  const [isComplete, setIsComplete] = useState(false);

  const mapDifficulty = (dificuldade: string): string => {
    const difficultyMap: Record<string, string> = {
      'Iniciante': 'Iniciante',
      'Intermediário': 'Intermediário',
      'Avançado': 'Avançado',
    };
    return difficultyMap[dificuldade] || 'Iniciante';
  };

  const mapMuscleGroup = (grupoMuscular: string): string => {
    // Map muscle groups to database categories
    const muscleMap: Record<string, string> = {
      'Peito': 'Peito',
      'Costas': 'Costas',
      'Pernas': 'Pernas',
      'Ombros': 'Ombros',
      'Bíceps': 'Braços',
      'Tríceps': 'Braços',
      'Abdômen': 'Abdômen',
      'Cardio': 'Cardio',
      'Esportes': 'Esportes',
      // Add more mappings as needed
    };
    
    if (!grupoMuscular) return 'Não especificado';
    
    const normalizedGroup = normalizeText(grupoMuscular);
    for (const [key, value] of Object.entries(muscleMap)) {
      if (normalizeText(key) === normalizedGroup) {
        return value;
      }
    }
    
    return grupoMuscular;
  };

  const handleImport = async () => {
    setIsLoading(true);
    setIsComplete(false);
    
    try {
      let data: ExerciseData | ExerciseData[];
      
      try {
        data = JSON.parse(jsonData);
      } catch (error) {
        toast({
          title: 'Erro no formato JSON',
          description: 'O texto fornecido não está em formato JSON válido.',
          variant: 'destructive',
        });
        setIsLoading(false);
        return;
      }
      
      // Handle both single object and array of objects
      const exercises = Array.isArray(data) ? data : [data];
      const importedCount = { count: 0 };
      const errors: string[] = [];
      
      // Process each exercise
      for (const exercise of exercises) {
        await processExercise(exercise, importedCount, errors);
      }
      
      setResults({ imported: importedCount.count, errors });
      setIsComplete(true);
      
      toast({
        title: 'Importação concluída',
        description: `${importedCount.count} exercícios importados com ${errors.length} erros.`,
        variant: errors.length > 0 ? 'destructive' : 'default',
      });
    } catch (error) {
      console.error('Error importing exercises:', error);
      toast({
        title: 'Erro na importação',
        description: 'Ocorreu um erro ao importar os exercícios.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const processExercise = async (
    exercise: ExerciseData, 
    importedCount: { count: number }, 
    errors: string[]
  ) => {
    try {
      if (!exercise.name) {
        throw new Error('Nome do exercício é obrigatório');
      }

      // Prepare exercise data for insertion
      const mappedExercise = {
        name: exercise.name,
        category: exercise.category || 'Não especificado',
        level: exercise.level ? mapDifficulty(exercise.level) : 'Iniciante',
        type: exercise.type || 'Composto',
        description: exercise.description || '',
        equipment: exercise.equipment || '',
        equipment_type: exercise.equipment_type || '',
        muscle_group: exercise.muscle_group || exercise.category || 'Não especificado'
      };

      console.log('Importing exercise:', mappedExercise);
      
      // Insert into database
      const { error } = await supabase
        .from('exercises')
        .insert(mappedExercise);
        
      if (error) {
        throw new Error(`Error with ${exercise.name}: ${error.message}`);
      }
      
      importedCount.count++;
    } catch (error) {
      if (error instanceof Error) {
        errors.push(error.message);
      } else {
        errors.push(`Erro desconhecido com ${exercise.name}`);
      }
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-200">
      <h2 className="text-xl font-bold mb-4">Importador de Exercícios</h2>
      
      {!isComplete ? (
        <>
          <p className="mb-3 text-gray-600">
            Cole o JSON dos exercícios abaixo. É possível importar um único exercício ou um array de exercícios.
          </p>
          
          <Textarea
            value={jsonData}
            onChange={(e) => setJsonData(e.target.value)}
            placeholder='{
  "name": "Exercício 1 de Ombros com Elástico",
  "category": "Ombros",
  "level": "Iniciante",
  "type": "Composto",
  "description": "Exercício de ombros utilizando elástico.",
  "equipment": "Elástico",
  "equipment_type": "Resistance band exercises",
  "muscle_group": "Ombros"
}'
            rows={10}
            className="mb-4 font-mono text-sm"
          />
          
          <Button 
            onClick={handleImport} 
            disabled={isLoading || !jsonData.trim()}
            className="w-full"
          >
            {isLoading ? 'Importando...' : 'Importar Exercícios'}
          </Button>
          
          {isLoading && <LoadingSpinner message="Importando exercícios..." />}
        </>
      ) : (
        <div className="mt-4">
          <div className="bg-gray-50 p-4 rounded-md mb-4">
            <h3 className="font-bold mb-2">Resultados da importação:</h3>
            <p>Exercícios importados com sucesso: <span className="font-semibold text-green-600">{results.imported}</span></p>
            <p>Erros encontrados: <span className="font-semibold text-red-600">{results.errors.length}</span></p>
          </div>
          
          {results.errors.length > 0 && (
            <div className="mt-4">
              <h4 className="font-bold mb-2 text-red-600">Erros:</h4>
              <ul className="list-disc list-inside bg-red-50 p-3 rounded-md">
                {results.errors.map((error, index) => (
                  <li key={index} className="text-red-700 mb-1">{error}</li>
                ))}
              </ul>
            </div>
          )}
          
          <Button onClick={() => {
            setJsonData('');
            setIsComplete(false);
          }} className="mt-4">
            Importar mais exercícios
          </Button>
        </div>
      )}
    </div>
  );
};

export default ExerciseImporter;
