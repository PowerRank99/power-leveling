
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Exercise, ExerciseType } from '@/components/workout/types/Exercise';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useSearchWithFocus } from '@/hooks/useSearchWithFocus';
import SelectedExerciseDisplay from './search/SelectedExerciseDisplay';
import SearchDropdown from './search/SearchDropdown';

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
      
      // Process the exercises to ensure correct typing
      const exercises = (data || []).map(exercise => ({
        ...exercise,
        type: (exercise.type || 'Musculação') as ExerciseType
      })) as Exercise[];
      
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
  }, [isOpen, focusInput]);
  
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
        <SelectedExerciseDisplay 
          exercise={selectedExercise} 
          onClearSelection={handleClearSelection} 
        />
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
            <SearchDropdown
              inputRef={inputRef}
              searchInput={searchInput}
              isLoading={isLoading}
              results={results}
              handleSearchChange={handleSearchChange}
              focusInput={focusInput}
              onSelectExercise={handleSelectExercise}
              onClose={() => setIsOpen(false)}
            />
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  );
};

export default ExerciseSelector;
