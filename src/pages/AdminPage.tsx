
import React from 'react';
import PageHeader from '@/components/ui/PageHeader';
import BottomNavBar from '@/components/navigation/BottomNavBar';
import AuthRequiredRoute from '@/components/AuthRequiredRoute';
import ExerciseImporter from '@/components/admin/ExerciseImporter';
import ExerciseManager from '@/components/admin/ExerciseManager';
import ExerciseCategorizer from '@/components/admin/ExerciseCategorizer';

const AdminPage = () => {
  return (
    <AuthRequiredRoute>
      <div className="pb-20 min-h-screen bg-midnight-base">
        <PageHeader title="Admin" showBackButton={true} />
        
        <div className="p-4">
          <h2 className="text-xl font-bold mb-4 font-orbitron text-text-primary">Ferramentas de Administração</h2>
          
          <div className="premium-card p-4 mb-6 shadow-subtle">
            <ExerciseImporter />
          </div>
          
          <div className="premium-card p-4 mb-6 shadow-subtle">
            <ExerciseCategorizer />
          </div>
          
          <div className="premium-card p-4 shadow-subtle">
            <ExerciseManager />
          </div>
        </div>
        
        <BottomNavBar />
      </div>
    </AuthRequiredRoute>
  );
};

export default AdminPage;
