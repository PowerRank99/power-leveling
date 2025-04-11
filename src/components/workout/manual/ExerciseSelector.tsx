
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Search, X, ChevronDown, ChevronUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Exercise } from '@/components/workout/types/Exercise';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import ExerciseCard from '@/components/workout/ExerciseCard';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useIsMobile } from '@/hooks/use-mobile';
import { useSearchWithFocus } from '@/hooks/useSearchWithFocus';

interface ExerciseSelectorProps {
  selectedExercise: Exercise | null;
  onExerciseSelect: (exercise: Exercise | null) => void;
}

// Simple exercise cache
const exerciseCache: Record<string, Exercise[]> = {};

const ExerciseSelector: React.FC<ExerciseSelectorProps> = ({
  selectedExercise,
  onExerciseSelect,
}) => {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<Exercise[]>([]);
  
  // Use our custom search hook
  const { 
    searchTerm: searchInput,
    inputRef,
    handleSearchChange,
    focusInput
  } = useSearchWithFocus<Exercise>({});
  
  // Search exercises function with focus maintenance
  const searchExercises = async (query: string) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    
    // Check cache first
    const cacheKey = query.toLowerCase().trim();
    if (exerciseCache[cacheKey]) {
      setResults(exerciseCache[cacheKey]);
      focusInput(); // Maintain focus after updating results
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Simple direct query with limit
      const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .ilike('name', `%${query}%`)
        .limit(10);
        
      if (error) throw error;
      
      const exercises = data || [];
      
      // Update cache and results
      exerciseCache[cacheKey] = exercises;
      setResults(exercises);
    } catch (err) {
      console.error('Error searching exercises:', err);
      toast({
        title: 'Erro na busca',
        description: 'Não foi possível buscar exercícios.',
        variant: 'destructive',
      });
      setResults([]);
    } finally {
      setIsLoading(false);
      // Focus will be maintained by the useEffect
      focusInput();
    }
  };
  
  // Focus management when opening/closing the collapsible
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        focusInput();
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [isOpen]);
  
  // Debounced search
  useEffect(() => {
    if (!isOpen) return;
    
    const timer = setTimeout(() => {
      if (searchInput) {
        searchExercises(searchInput);
      }
    }, 400);
    
    return () => clearTimeout(timer);
  }, [searchInput, isOpen]);
  
  const handleClearSelection = () => {
    onExerciseSelect(null);
  };
  
  const handleSelectExercise = (exercise: Exercise) => {
    onExerciseSelect(exercise);
    setIsOpen(false);
  };

  return (
    <div className="space-y-3">
      <Label htmlFor="exercise">Tipo de Exercício</Label>
      
      {selectedExercise ? (
        <div className="relative">
          <ExerciseCard
            name={selectedExercise.name}
            category={selectedExercise.category}
            level={selectedExercise.level as any}
            type="Força"
            image={selectedExercise.image_url || '/placeholder.svg'}
            description={selectedExercise.description || ''}
            equipment={selectedExercise.equipment || ''}
            muscleGroup={selectedExercise.muscle_group || selectedExercise.category || 'Não especificado'}
            equipmentType={selectedExercise.equipment_type || 'Não especificado'}
            disableExpand={true}
          />
          <button 
            className="absolute top-3 right-3 bg-arcane-30 text-text-primary p-2 rounded-full"
            onClick={handleClearSelection}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger asChild>
            <Button 
              type="button" 
              variant="outline" 
              className="w-full flex justify-between items-center bg-midnight-elevated border-arcane/30"
            >
              <span className="text-gray-400">Selecione um exercício</span>
              {isOpen ? <ChevronUp className="ml-2 h-4 w-4" /> : <ChevronDown className="ml-2 h-4 w-4" />}
            </Button>
          </CollapsibleTrigger>
          
          <CollapsibleContent className="mt-2">
            <div className="p-4 bg-midnight-card rounded-lg border border-arcane/30 shadow-md">
              <div className="relative flex items-center mb-4">
                <Search className="absolute left-3 text-gray-400 h-4 w-4" />
                <Input
                  ref={inputRef}
                  value={searchInput}
                  onChange={handleSearchChange}
                  placeholder="Buscar exercícios..."
                  className="pl-10 bg-midnight-elevated border-arcane/30"
                  disabled={isLoading}
                  onClick={e => {
                    e.stopPropagation();
                    focusInput();
                  }}
                />
              </div>
              
              <div className="max-h-[180px] overflow-hidden">
                <ScrollArea className="h-[180px] rounded-md border border-divider/20 bg-midnight-elevated">
                  {isLoading ? (
                    <div className="space-y-3 p-2">
                      <p className="text-center text-sm text-gray-400 mb-2">Carregando exercícios...</p>
                      <Skeleton className="h-12 w-full bg-midnight-card" />
                      <Skeleton className="h-12 w-full bg-midnight-card" />
                    </div>
                  ) : results.length > 0 ? (
                    <div className="p-2">
                      {results.map(exercise => (
                        <div 
                          key={exercise.id} 
                          className="cursor-pointer mb-2" 
                          onClick={() => handleSelectExercise(exercise)}
                        >
                          <div className="p-2 bg-midnight-card rounded-lg hover:bg-arcane-15 transition-colors">
                            <p className="font-orbitron font-semibold text-text-primary text-sm">{exercise.name}</p>
                            <p className="text-xs text-text-secondary">{exercise.category}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-gray-400 py-4 px-2">
                      {searchInput.length > 0 ? 'Nenhum exercício encontrado' : 'Digite para buscar exercícios'}
                    </p>
                  )}
                </ScrollArea>
              </div>
              
              <div className="mt-4">
                <Button 
                  type="button" 
                  variant="arcane" 
                  className="w-full text-text-primary"
                  onClick={() => setIsOpen(false)}
                >
                  Fechar
                </Button>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  );
};

export default ExerciseSelector;
