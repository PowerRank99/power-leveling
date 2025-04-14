
import React from 'react';
import PageHeader from '@/components/ui/PageHeader';
import ClassBonusTester from '@/components/testing/ClassBonusTester';
import { useAuth } from '@/hooks/useAuth';
import AuthRequiredRoute from '@/components/AuthRequiredRoute';

const ClassBonusTestPage = () => {
  const { user } = useAuth();
  
  return (
    <AuthRequiredRoute>
      <div className="min-h-screen bg-midnight-base pb-20">
        <PageHeader title="Class Bonus Tester" showBackButton={true} />
        
        <div className="p-4 space-y-6">
          <div className="text-sm text-text-secondary mb-4">
            This page allows you to test class bonuses with different exercise types.
            Select a class and exercise type to see how bonuses are applied to specific exercises.
          </div>
          
          <ClassBonusTester />
        </div>
      </div>
    </AuthRequiredRoute>
  );
};

export default ClassBonusTestPage;
