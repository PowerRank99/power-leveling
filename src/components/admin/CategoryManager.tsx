
import React from 'react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';
import { useCategoryState } from './hooks/useCategoryState';
import CategoryHeader from './category/CategoryHeader';
import CategoryTable from './category/CategoryTable';

interface CategoryManagerProps {
  title: string;
  columnName: string;
  description: string;
}

const CategoryManager: React.FC<CategoryManagerProps> = ({ title, columnName, description }) => {
  const {
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
  } = useCategoryState(columnName);

  return (
    <div className="mb-8">
      <CategoryHeader
        title={title}
        description={description}
        onRefresh={fetchCategories}
        newCategoryValue={newCategoryValue}
        onNewCategoryValueChange={handleNewCategoryValueChange}
        onAddCategory={handleAddCategory}
      />
      
      {isLoading ? (
        <LoadingSpinner message={`Carregando categorias...`} />
      ) : categories.length > 0 ? (
        <CategoryTable
          categories={categories}
          editingCategory={editingCategory}
          newCategoryName={newCategoryName}
          onEdit={handleEdit}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
          onNewCategoryNameChange={handleNewCategoryNameChange}
        />
      ) : (
        <EmptyState message={`Não há categorias cadastradas.`} />
      )}
    </div>
  );
};

export default CategoryManager;
