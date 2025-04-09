
import React from 'react';
import PageHeader from '@/components/ui/PageHeader';
import BottomNavBar from '@/components/navigation/BottomNavBar';
import AuthRequiredRoute from '@/components/AuthRequiredRoute';
import ExerciseImporter from '@/components/admin/ExerciseImporter';
import ExerciseManager from '@/components/admin/ExerciseManager';
import CategoryManager from '@/components/admin/CategoryManager';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const AdminPage = () => {
  return (
    <AuthRequiredRoute>
      <div className="pb-20">
        <PageHeader title="Admin" showBackButton={true} />
        
        <div className="p-4 bg-gray-50 min-h-screen">
          <h2 className="text-xl font-bold mb-4">Ferramentas de Administração</h2>
          
          <Tabs defaultValue="exercises" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="exercises">Exercícios</TabsTrigger>
              <TabsTrigger value="categories">Categorias</TabsTrigger>
            </TabsList>
            
            <TabsContent value="exercises" className="space-y-6">
              <ExerciseImporter />
              <ExerciseManager />
            </TabsContent>
            
            <TabsContent value="categories" className="space-y-6">
              <CategoryManager 
                title="Grupos Musculares" 
                columnName="muscle_group"
                description="Gerencie os grupos musculares disponíveis para classificação de exercícios."
              />
              
              <CategoryManager 
                title="Tipos de Equipamento" 
                columnName="equipment_type"
                description="Gerencie os tipos de equipamento disponíveis para classificação de exercícios."
              />
            </TabsContent>
          </Tabs>
        </div>
        
        <BottomNavBar />
      </div>
    </AuthRequiredRoute>
  );
};

export default AdminPage;
