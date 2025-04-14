
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

const IndexPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleGetStarted = () => {
    if (user) {
      navigate('/profile');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-midnight-base p-4">
      <div className="max-w-2xl w-full space-y-8 text-center">
        <h1 className="text-4xl font-orbitron text-text-primary">PowerLeveling</h1>
        <p className="text-text-secondary">Transform your fitness journey into an epic adventure</p>
        
        <div className="pt-8">
          <Button 
            variant="arcane" 
            className="px-8 py-6 text-lg"
            onClick={handleGetStarted}
          >
            {user ? 'Continue Your Journey' : 'Start Your Journey'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default IndexPage;
