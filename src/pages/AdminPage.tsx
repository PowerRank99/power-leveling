
import React from 'react';
import PageHeader from '@/components/ui/PageHeader';
import BottomNavBar from '@/components/navigation/BottomNavBar';
import AuthRequiredRoute from '@/components/AuthRequiredRoute';
import ExerciseImporter from '@/components/admin/ExerciseImporter';
import ExerciseManager from '@/components/admin/ExerciseManager';
import ExerciseCategorizer from '@/components/admin/ExerciseCategorizer';
import MuscleGroupDiagnostic from '@/components/admin/MuscleGroupDiagnostic';

const AdminPage = () => {
  return (
    <AuthRequiredRoute>
      <div className="pb-20">
        <PageHeader title="Admin" showBackButton={true} />
        
        <div className="p-4 bg-gray-50 min-h-screen">
          <h2 className="text-xl font-bold mb-4">Ferramentas de Administração</h2>
          
          <div className="mb-6">
            <ExerciseImporter />
          </div>
          
          <div className="mb-6">
            <MuscleGroupDiagnostic />
          </div>
          
          <div className="mb-6">
            <ExerciseCategorizer />
          </div>
          
          <ExerciseManager />
        </div>
        
        <BottomNavBar />
      </div>
    </AuthRequiredRoute>
  );
};

export default AdminPage;
