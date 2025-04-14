
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';

const ProfilePage = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleTestClassBonus = () => {
    navigate('/testing/class-bonus');
  };
  
  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-midnight-base p-4">
      <div className="max-w-lg mx-auto">
        <h1 className="text-2xl font-bold mb-6">Profile Page</h1>
        
        {user ? (
          <div className="rounded-lg bg-midnight-card p-4 border border-divider/20 space-y-4">
            <div>
              <div className="text-text-secondary">Email:</div>
              <div className="font-semibold">{user.email}</div>
            </div>
            
            <div className="pt-4 space-y-2">
              <Button onClick={handleTestClassBonus} className="w-full">
                Test Class XP Bonuses
              </Button>
              
              <Button onClick={handleLogout} variant="outline" className="w-full">
                Logout
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="mb-4">You are not logged in</p>
            <Button onClick={() => navigate('/login')}>Go to Login</Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
