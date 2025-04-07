
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';

interface ExerciseData {
  nome: string;
  grupo_muscular: string;
  equipamento: string[];
  dificuldade: string;
  descricao: string;
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
      // Add more mappings as needed
    };
    return muscleMap[grupoMuscular] || grupoMuscular;
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
      // Map the JSON structure to the database schema
      const mappedExercise = {
        name: exercise.nome,
        category: mapMuscleGroup(exercise.grupo_muscular),
        level: mapDifficulty(exercise.dificuldade),
        type: 'Composto', // Default value - adjust if needed
        description: exercise.descricao,
        equipment: exercise.equipamento.join(', ')
      };
      
      // Insert into database
      const { error } = await supabase
        .from('exercises')
        .insert(mappedExercise);
        
      if (error) {
        throw new Error(`Error with ${exercise.nome}: ${error.message}`);
      }
      
      importedCount.count++;
    } catch (error) {
      if (error instanceof Error) {
        errors.push(error.message);
      } else {
        errors.push(`Erro desconhecido com ${exercise.nome}`);
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
            placeholder='{"nome": "Flexão Diamante", "grupo_muscular": "Peito", "equipamento": ["Nenhum"], "dificuldade": "Intermediário", "descricao": "Flexão com as mãos juntas..."}'
            rows={10}
            className="mb-4"
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
