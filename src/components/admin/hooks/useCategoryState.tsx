
import { useState, useEffect } from 'react';
import { CategoryItem, useCategoryManagement } from '../CategoryManagement';

export const useCategoryState = (columnName: string) => {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryValue, setNewCategoryValue] = useState('');
  
  const { getUniqueValues, updateCategoryValue, deleteCategory } = useCategoryManagement();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setIsLoading(true);
    const data = await getUniqueValues(columnName);
    setCategories(data);
    setIsLoading(false);
  };

  const handleEdit = (category: CategoryItem) => {
    setEditingCategory(category);
    setNewCategoryName(category.name);
  };

  const handleUpdate = async () => {
    if (editingCategory && newCategoryName && newCategoryName !== editingCategory.name) {
      const success = await updateCategoryValue(columnName, editingCategory.name, newCategoryName);
      if (success) {
        await fetchCategories();
        setEditingCategory(null);
        setNewCategoryName('');
      }
    }
  };

  const handleDelete = async (categoryName: string) => {
    if (window.confirm(`Tem certeza que deseja remover "${categoryName}"? Isso vai remover esta categoria de todos os exercícios.`)) {
      const success = await deleteCategory(columnName, categoryName);
      if (success) {
        await fetchCategories();
      }
    }
  };

  const handleAddCategory = async () => {
    if (newCategoryValue.trim()) {
      // For new categories, we don't actually need to do anything in the database
      // until we assign exercises to this category
      setNewCategoryValue('');
      await fetchCategories(); // Refresh to make sure we have the latest data
    }
  };

  const handleNewCategoryNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewCategoryName(e.target.value);
  };

  const handleNewCategoryValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewCategoryValue(e.target.value);
  };

  return {
    categories,
    isLoading,
    editingCategory,
    newCategoryName,
    newCategoryValue,
    fetchCategories,
    handleEdit,
    handleUpdate,
    handleDelete,
    handleAddCategory,
    handleNewCategoryNameChange,
    handleNewCategoryValueChange
  };
};
