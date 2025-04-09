
import React from 'react';
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableRow, 
  TableHead, 
  TableCell 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Pencil, Trash2 } from 'lucide-react';
import { CategoryItem } from '../CategoryManagement';

interface CategoryTableProps {
  categories: CategoryItem[];
  editingCategory: CategoryItem | null;
  newCategoryName: string;
  onEdit: (category: CategoryItem) => void;
  onUpdate: () => void;
  onDelete: (categoryName: string) => void;
  onNewCategoryNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const CategoryTable: React.FC<CategoryTableProps> = ({
  categories,
  editingCategory,
  newCategoryName,
  onEdit,
  onUpdate,
  onDelete,
  onNewCategoryNameChange
}) => {
  return (
    <div className="border rounded-md overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Exercícios</TableHead>
            <TableHead className="w-[100px]">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories.map((category) => (
            <TableRow key={category.id}>
              <TableCell>
                {editingCategory?.id === category.id ? (
                  <Input 
                    value={newCategoryName}
                    onChange={onNewCategoryNameChange}
                    onKeyDown={(e) => e.key === 'Enter' && onUpdate()}
                  />
                ) : (
                  category.name
                )}
              </TableCell>
              <TableCell>{category.count || 0}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {editingCategory?.id === category.id ? (
                    <Button size="sm" onClick={onUpdate}>Salvar</Button>
                  ) : (
                    <Button 
                      size="icon" 
                      variant="ghost"
                      onClick={() => onEdit(category)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  )}
                  <Button 
                    size="icon" 
                    variant="ghost"
                    className="text-red-500 hover:text-red-700"
                    onClick={() => onDelete(category.name)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default CategoryTable;
