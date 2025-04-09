
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export interface CategoryItem {
  id: string;
  name: string;
  count?: number;
}

// Utility functions for managing categories (muscle groups and equipment types)
export const useCategoryManagement = () => {
  const { toast } = useToast();
  
  // Get unique values from a column in the exercises table
  const getUniqueValues = async (columnName: string): Promise<CategoryItem[]> => {
    try {
      const { data, error } = await supabase
        .from('exercises')
        .select(`${columnName}`)
        .not(columnName, 'is', null);
      
      if (error) throw error;
      
      // Extract unique values and count occurrences
      const valueCounts: Record<string, number> = {};
      
      // Use type assertion to avoid deep type instantiation
      const items = data as Array<Record<string, string>>;
      
      items.forEach((item) => {
        const value = item[columnName] || 'Não especificado';
        valueCounts[value] = (valueCounts[value] || 0) + 1;
      });
      
      // Convert to array of objects with count
      const uniqueValues = Object.entries(valueCounts).map(([name, count]) => ({
        id: name,
        name,
        count
      }));
      
      return uniqueValues.sort((a, b) => a.name.localeCompare(b.name));
    } catch (error) {
      console.error(`Error fetching unique ${columnName} values:`, error);
      toast({
        title: `Erro ao buscar ${columnName}`,
        description: `Não foi possível carregar os valores únicos de ${columnName}.`,
        variant: 'destructive'
      });
      return [];
    }
  };
  
  // Update category value across multiple exercises
  const updateCategoryValue = async (
    columnName: string,
    oldValue: string,
    newValue: string
  ): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('exercises')
        .update({ [columnName]: newValue })
        .eq(columnName, oldValue);
      
      if (error) throw error;
      
      toast({
        title: 'Categoria atualizada',
        description: `Os exercícios foram atualizados com sucesso para "${newValue}".`,
      });
      
      return true;
    } catch (error) {
      console.error(`Error updating ${columnName}:`, error);
      toast({
        title: 'Erro ao atualizar categoria',
        description: `Não foi possível atualizar os exercícios para "${newValue}".`,
        variant: 'destructive'
      });
      return false;
    }
  };

  // Delete a category by setting it to null for all matching exercises
  const deleteCategory = async (
    columnName: string,
    value: string
  ): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('exercises')
        .update({ [columnName]: null })
        .eq(columnName, value);
      
      if (error) throw error;
      
      toast({
        title: 'Categoria removida',
        description: `A categoria "${value}" foi removida com sucesso.`,
      });
      
      return true;
    } catch (error) {
      console.error(`Error deleting ${columnName} category:`, error);
      toast({
        title: 'Erro ao remover categoria',
        description: `Não foi possível remover a categoria "${value}".`,
        variant: 'destructive'
      });
      return false;
    }
  };

  return {
    getUniqueValues,
    updateCategoryValue,
    deleteCategory
  };
};
