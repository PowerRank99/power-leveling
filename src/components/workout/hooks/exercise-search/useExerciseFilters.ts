
import { Exercise } from '../../types/Exercise';
import { MUSCLE_GROUP_ALIASES, EQUIPMENT_TYPE_ALIASES, EXERCISE_CATEGORY_MAP } from '../../constants/exerciseFilters';

// Normalize text for comparison by removing accents and converting to lowercase
export const normalizeText = (text: string | null | undefined): string => {
  if (!text) return '';
  return text.toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
};

// Check if an exercise matches the given filter and value
export const matchesFilter = (exercise: Exercise, filterType: 'muscle_group' | 'equipment_type', filterValue: string): boolean => {
  if (filterValue === 'Todos') return true;
  
  const exerciseValue = filterType === 'muscle_group' 
    ? (exercise.muscle_group || exercise.category || '')
    : (exercise.equipment_type || exercise.equipment || '');
  
  const normalizedExerciseValue = normalizeText(exerciseValue);
  const normalizedFilterValue = normalizeText(filterValue);
  
  // Direct match
  if (normalizedExerciseValue === normalizedFilterValue) {
    return true;
  }
  
  // Check aliases based on filter type
  if (filterType === 'muscle_group') {
    // Check exercise name for category-specific keywords (especially for Cardio and Esportes)
    if (filterValue === 'Cardio' || filterValue === 'Esportes') {
      const normalizedName = normalizeText(exercise.name);
      
      // Look for keywords in exercise name that match the category
      for (const [keyword, category] of Object.entries(EXERCISE_CATEGORY_MAP)) {
        if (normalizedName.includes(normalizeText(keyword)) && 
            normalizeText(category) === normalizedFilterValue) {
          return true;
        }
      }
    }
    
    // Check if exercise value matches any key in the aliases map that maps to our filter value
    const matchingAliasKey = Object.keys(MUSCLE_GROUP_ALIASES).find(key => 
      normalizedExerciseValue.includes(key) && 
      normalizeText(MUSCLE_GROUP_ALIASES[key as keyof typeof MUSCLE_GROUP_ALIASES]) === normalizedFilterValue
    );
    
    if (matchingAliasKey) return true;
    
    // Special case for 'Não especificado'
    if (filterValue === 'Não especificado' && (!exercise.muscle_group || exercise.muscle_group.trim() === '')) {
      return true;
    }

    // Check if category matches (for backward compatibility)
    if (normalizeText(exercise.category) === normalizedFilterValue) {
      return true;
    }
  }
  
  // Check aliases for equipment types
  if (filterType === 'equipment_type') {
    // Check if exercise value matches any key in the aliases map that maps to our filter value
    const matchingAliasKey = Object.keys(EQUIPMENT_TYPE_ALIASES).find(key => 
      normalizedExerciseValue.includes(key) && 
      normalizeText(EQUIPMENT_TYPE_ALIASES[key as keyof typeof EQUIPMENT_TYPE_ALIASES]) === normalizedFilterValue
    );
    
    if (matchingAliasKey) return true;
    
    // Special case for 'Nenhum' (bodyweight exercises)
    if (filterValue === 'Nenhum' && (!exercise.equipment_type || exercise.equipment_type.trim() === '' || 
        !exercise.equipment || exercise.equipment.trim() === '')) {
      return true;
    }
    
    // Special case for 'Não especificado'
    if (filterValue === 'Não especificado' && (!exercise.equipment_type || exercise.equipment_type.trim() === '')) {
      return true;
    }
  }
  
  return false;
};

// Apply all filters to a list of exercises
export const applyFilters = (
  exercises: Exercise[], 
  searchQuery: string, 
  equipmentFilter: string, 
  muscleFilter: string
): Exercise[] => {
  let filtered = [...exercises];
  console.log('Starting filter with', filtered.length, 'exercises');
  
  if (searchQuery.trim()) {
    filtered = filtered.filter(ex => 
      normalizeText(ex.name).includes(normalizeText(searchQuery))
    );
    console.log('After search filter:', filtered.length, 'exercises');
  }
  
  if (equipmentFilter !== 'Todos') {
    console.log('Filtering by equipment:', equipmentFilter);
    
    filtered = filtered.filter(ex => matchesFilter(ex, 'equipment_type', equipmentFilter));
    
    console.log('After equipment filter:', filtered.length, 'exercises remaining');
  }
  
  if (muscleFilter !== 'Todos') {
    console.log('Filtering by muscle:', muscleFilter);
    
    filtered = filtered.filter(ex => matchesFilter(ex, 'muscle_group', muscleFilter));
    
    console.log('After muscle filter:', filtered.length, 'exercises remaining');
  }
  
  return filtered;
};
