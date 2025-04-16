
import React, { useState } from 'react';
import PageHeader from '@/components/ui/PageHeader';
import BottomNavBar from '@/components/navigation/BottomNavBar';
import AuthRequiredRoute from '@/components/AuthRequiredRoute';
import ExerciseImporter from '@/components/admin/ExerciseImporter';
import ExerciseManager from '@/components/admin/ExerciseManager';
import ExerciseCategorizer from '@/components/admin/ExerciseCategorizer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState('manager');
  
  return (
    <AuthRequiredRoute>
      <div className="pb-20 min-h-screen bg-midnight-base">
        <PageHeader title="Admin" showBackButton={true} />
        
        <div className="p-4">
          <h2 className="text-xl font-bold mb-4 font-orbitron text-text-primary">Ferramentas de Administração</h2>
          
          <Tabs defaultValue="manager" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full mb-4">
              <TabsTrigger value="manager" className="flex-1">Gerenciar Exercícios</TabsTrigger>
              <TabsTrigger value="importer" className="flex-1">Importador</TabsTrigger>
              <TabsTrigger value="categorizer" className="flex-1">Categorizador</TabsTrigger>
            </TabsList>
            
            <TabsContent value="manager" className="premium-card p-4 shadow-subtle">
              <ExerciseManager />
            </TabsContent>
            
            <TabsContent value="importer" className="premium-card p-4 shadow-subtle">
              <ExerciseImporter />
            </TabsContent>
            
            <TabsContent value="categorizer" className="premium-card p-4 shadow-subtle">
              <ExerciseCategorizer />
            </TabsContent>
          </Tabs>
        </div>
        
        <BottomNavBar />
      </div>
    </AuthRequiredRoute>
  );
};

export default AdminPage;
