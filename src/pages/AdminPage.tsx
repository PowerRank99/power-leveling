
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '@/components/ui/PageHeader';
import BottomNavBar from '@/components/navigation/BottomNavBar';
import AuthRequiredRoute from '@/components/AuthRequiredRoute';
import ExerciseImporter from '@/components/admin/ExerciseImporter';
import ExerciseManager from '@/components/admin/ExerciseManager';
import ExerciseCategorizer from '@/components/admin/ExerciseCategorizer';
import FeatureFlagManager from '@/components/dev/FeatureFlagManager';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Beaker, Settings, Flag } from 'lucide-react';

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState('manager');
  
  return (
    <AuthRequiredRoute>
      <div className="pb-20 min-h-screen bg-midnight-base">
        <PageHeader title="Admin" showBackButton={true} />
        
        <div className="p-4">
          <h2 className="text-xl font-bold mb-4 font-orbitron text-text-primary">Ferramentas de Administração</h2>
          
          {/* Feature Flags Section */}
          <div className="mb-4 premium-card p-3 shadow-subtle border-divider flex justify-between items-center">
            <div className="flex items-center">
              <Flag className="h-5 w-5 mr-2 text-arcane-60" />
              <span className="text-text-primary">Gerenciador de Feature Flags</span>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="bg-midnight-elevated border-arcane-30 hover:bg-arcane-15 text-arcane"
              onClick={() => setActiveTab('flags')}
            >
              <Settings className="h-4 w-4 mr-1" />
              Gerenciar
            </Button>
          </div>

          {/* Testing Tools Section */}
          <div className="mb-4 premium-card p-3 shadow-subtle border-divider flex justify-between items-center">
            <div className="flex items-center">
              <Beaker className="h-5 w-5 mr-2 text-arcane-60" />
              <span className="text-text-primary">Ferramenta de Testes de Conquistas</span>
            </div>
            <Link to="/achievement-testing">
              <Button 
                variant="outline" 
                size="sm" 
                className="bg-midnight-elevated border-arcane-30 hover:bg-arcane-15 text-arcane"
              >
                <Settings className="h-4 w-4 mr-1" />
                Acessar
              </Button>
            </Link>
          </div>
          
          <Tabs defaultValue="manager" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full mb-4">
              <TabsTrigger value="manager" className="flex-1">Gerenciar Exercícios</TabsTrigger>
              <TabsTrigger value="importer" className="flex-1">Importador</TabsTrigger>
              <TabsTrigger value="categorizer" className="flex-1">Categorizador</TabsTrigger>
              <TabsTrigger value="flags" className="flex-1">Feature Flags</TabsTrigger>
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

            <TabsContent value="flags" className="premium-card p-4 shadow-subtle">
              <FeatureFlagManager />
            </TabsContent>
          </Tabs>
        </div>
        
        <BottomNavBar />
      </div>
    </AuthRequiredRoute>
  );
};

export default AdminPage;
