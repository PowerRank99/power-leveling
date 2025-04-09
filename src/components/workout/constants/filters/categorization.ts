
import { MUSCLE_GROUPS } from './muscle-groups';
import { MUSCLE_GROUP_ALIASES } from './aliases';
import { EXERCISE_CATEGORY_MAP } from './category-mapping';

/**
 * Normalize text for comparison by removing accents and converting to lowercase
 */
export const normalizeText = (text: string | null | undefined): string => {
  if (!text) return '';
  return text.toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
};

/**
 * Categorizes an exercise based on its name, existing category, and muscle group
 * @param exerciseName The name of the exercise
 * @param existingCategory The existing category (if any)
 * @param existingMuscleGroup The existing muscle group (if any)
 * @returns The determined category
 */
export const categorizeExercise = (
  exerciseName: string,
  existingCategory?: string | null,
  existingMuscleGroup?: string | null
): string => {
  const normalizedName = (exerciseName || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  
  // Check for exact matches in the category map
  for (const [keyword, category] of Object.entries(EXERCISE_CATEGORY_MAP)) {
    if (normalizedName.includes(keyword.toLowerCase())) {
      console.log(`Categorized "${exerciseName}" as "${category}" via keyword "${keyword}"`);
      return category;
    }
  }
  
  // Check if existing muscle group is valid and in our known groups
  if (existingMuscleGroup && 
      MUSCLE_GROUPS.includes(existingMuscleGroup) && 
      existingMuscleGroup !== 'Todos' && 
      existingMuscleGroup !== 'Não especificado') {
    return existingMuscleGroup;
  }
  
  // Check existing category against aliases
  if (existingCategory) {
    const normalizedCategory = existingCategory.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    for (const [alias, category] of Object.entries(MUSCLE_GROUP_ALIASES)) {
      if (normalizedCategory.includes(alias.toLowerCase())) {
        console.log(`Mapped "${existingCategory}" to "${category}" via alias "${alias}"`);
        return category;
      }
    }
    
    // If we have a category that's in our muscle groups list, use that
    if (MUSCLE_GROUPS.includes(existingCategory) && 
        existingCategory !== 'Todos' && 
        existingCategory !== 'Não especificado') {
      return existingCategory;
    }
  }
  
  // Special handling for Bíceps and Tríceps
  if (normalizedName.includes("curl") || 
      normalizedName.includes("rosca") || 
      normalizedName.includes("bicep") || 
      normalizedName.includes("biceps")) {
    return 'Bíceps';
  }
  
  if (normalizedName.includes("trice") || 
      normalizedName.includes("trícep") || 
      normalizedName.includes("extensão") || 
      normalizedName.includes("extensao") ||
      normalizedName.includes("pushdown") || 
      normalizedName.includes("mergulho")) {
    return 'Tríceps';
  }
  
  // Fallback to the existing category or a default
  return existingMuscleGroup || existingCategory || 'Não especificado';
};
