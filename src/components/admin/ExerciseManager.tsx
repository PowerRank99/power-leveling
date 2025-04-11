
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';
import ExerciseEditor from '@/components/admin/exercise-editor';
import { RefreshCcw, Search, X } from 'lucide-react';
import { Exercise, ExerciseType, DifficultyLevel } from '@/components/workout/types/Exercise';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const ExerciseManager = () => {
  const { toast } = useToast();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [exerciseToDelete, setExerciseToDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchExercises();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredExercises(exercises);
    } else {
      const term = searchTerm.toLowerCase();
      const filtered = exercises.filter(exercise => 
        exercise.name.toLowerCase().includes(term) || 
        (exercise.muscle_group && exercise.muscle_group.toLowerCase().includes(term)) ||
        (exercise.type && exercise.type.toLowerCase().includes(term))
      );
      setFilteredExercises(filtered);
    }
  }, [searchTerm, exercises]);

  const fetchExercises = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .order('name');

      if (error) throw error;
      
      // Ensure all exercises have valid type and level
      const processedData = (data || []).map(exercise => ({
        ...exercise,
        type: (exercise.type || 'Musculação') as ExerciseType,
        level: (exercise.level || 'Intermediário') as DifficultyLevel
      }));
      
      setExercises(processedData as Exercise[]);
      setFilteredExercises(processedData as Exercise[]);
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

  const confirmDelete = (id: string) => {
    setExerciseToDelete(id);
    setShowDeleteConfirm(true);
  };

  const handleDelete = async () => {
    if (!exerciseToDelete) return;
    
    setIsDeleting(exerciseToDelete);
    setShowDeleteConfirm(false);
    
    try {
      const { error } = await supabase
        .from('exercises')
        .delete()
        .eq('id', exerciseToDelete);

      if (error) throw error;
      
      setExercises(exercises.filter(exercise => exercise.id !== exerciseToDelete));
      setFilteredExercises(filteredExercises.filter(exercise => exercise.id !== exerciseToDelete));
      
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
      setExerciseToDelete(null);
    }
  };

  const handleExerciseUpdate = (updatedExercise: Exercise) => {
    setExercises(prevExercises => 
      prevExercises.map(ex => 
        ex.id === updatedExercise.id ? updatedExercise : ex
      )
    );
    setFilteredExercises(prevExercises => 
      prevExercises.map(ex => 
        ex.id === updatedExercise.id ? updatedExercise : ex
      )
    );
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold">Exercícios Cadastrados ({filteredExercises.length})</h3>
        <Button variant="outline" size="sm" onClick={fetchExercises}>
          <RefreshCcw className="mr-2 h-4 w-4" />
          Atualizar
        </Button>
      </div>
      
      <div className="relative mb-4">
        <Input
          type="text"
          placeholder="Buscar exercício por nome, tipo ou grupo muscular..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        {searchTerm && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      
      {isLoading ? (
        <LoadingSpinner message="Carregando exercícios..." />
      ) : filteredExercises.length > 0 ? (
        <div className="space-y-3">
          {filteredExercises.map(exercise => (
            <ExerciseEditor
              key={exercise.id}
              exercise={exercise}
              onDelete={confirmDelete}
              onUpdate={handleExerciseUpdate}
            />
          ))}
        </div>
      ) : (
        <EmptyState 
          title="Não há exercícios encontrados"
          description={searchTerm ? "Tente outros termos de busca" : "Use o importador de exercícios para adicionar."}
        />
      )}

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir exercício</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este exercício? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <Button variant="destructive" onClick={handleDelete}>
              Excluir
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ExerciseManager;
