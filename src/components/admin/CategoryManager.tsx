
import React, { useState, useEffect } from 'react';
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
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger
} from '@/components/ui/dialog';
import { Pencil, Trash2, Plus, RefreshCcw } from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';
import { CategoryItem, useCategoryManagement } from './CategoryManagement';

interface CategoryManagerProps {
  title: string;
  columnName: string;
  description: string;
}

const CategoryManager: React.FC<CategoryManagerProps> = ({ title, columnName, description }) => {
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

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-bold">{title}</h3>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchCategories}>
            <RefreshCcw className="mr-2 h-4 w-4" />
            Atualizar
          </Button>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Nova Categoria
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Nova Categoria</DialogTitle>
              </DialogHeader>
              <div className="py-4">
                <Input
                  placeholder="Nome da categoria"
                  value={newCategoryValue}
                  onChange={(e) => setNewCategoryValue(e.target.value)}
                />
                <p className="text-xs text-gray-500 mt-2">
                  Nota: A categoria só será criada quando for atribuída a um exercício.
                </p>
              </div>
              <DialogFooter>
                <Button onClick={handleAddCategory}>Adicionar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      {isLoading ? (
        <LoadingSpinner message={`Carregando categorias...`} />
      ) : categories.length > 0 ? (
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
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleUpdate()}
                      />
                    ) : (
                      category.name
                    )}
                  </TableCell>
                  <TableCell>{category.count || 0}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {editingCategory?.id === category.id ? (
                        <Button size="sm" onClick={handleUpdate}>Salvar</Button>
                      ) : (
                        <Button 
                          size="icon" 
                          variant="ghost"
                          onClick={() => handleEdit(category)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      )}
                      <Button 
                        size="icon" 
                        variant="ghost"
                        className="text-red-500 hover:text-red-700"
                        onClick={() => handleDelete(category.name)}
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
      ) : (
        <EmptyState message={`Não há categorias cadastradas.`} />
      )}
    </div>
  );
};

export default CategoryManager;
