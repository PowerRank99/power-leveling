
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCcw } from 'lucide-react';
import AddCategoryDialog from './AddCategoryDialog';

interface CategoryHeaderProps {
  title: string;
  description: string;
  onRefresh: () => void;
  newCategoryValue: string;
  onNewCategoryValueChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onAddCategory: () => void;
}

const CategoryHeader: React.FC<CategoryHeaderProps> = ({
  title,
  description,
  onRefresh,
  newCategoryValue,
  onNewCategoryValueChange,
  onAddCategory
}) => {
  return (
    <div className="flex justify-between items-center mb-4">
      <div>
        <h3 className="text-lg font-bold">{title}</h3>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={onRefresh}>
          <RefreshCcw className="mr-2 h-4 w-4" />
          Atualizar
        </Button>
        
        <AddCategoryDialog
          newCategoryValue={newCategoryValue}
          onNewCategoryValueChange={onNewCategoryValueChange}
          onAddCategory={onAddCategory}
        />
      </div>
    </div>
  );
};

export default CategoryHeader;
