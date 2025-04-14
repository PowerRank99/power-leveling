
import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

type AuthRequiredRouteProps = {
  children: React.ReactNode;
};

const AuthRequiredRoute: React.FC<AuthRequiredRouteProps> = ({ children }) => {
  const { user, loading, error } = useAuth();
  const [timeoutReached, setTimeoutReached] = useState(false);
  
  // Set a timeout to handle potential auth hanging issues
  useEffect(() => {
    const timer = setTimeout(() => {
      if (loading) {
        console.log('Auth loading timeout reached, forcing redirect');
        setTimeoutReached(true);
      }
    }, 5000); // 5 second timeout
    
    return () => clearTimeout(timer);
  }, [loading]);
  
  // If there's an auth error or timeout was reached, redirect to auth page
  if (error || timeoutReached) {
    console.error("Auth error or timeout:", error);
    return <Navigate to="/auth" replace />;
  }
  
  // Show loading state while determining authentication
  if (loading && !timeoutReached) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-midnight-deep">
        <LoadingSpinner 
          size="lg" 
          message="Verificando autenticação..." 
          subMessage="Carregando informações do usuário"
        />
      </div>
    );
  }
  
  // If not authenticated, redirect to auth page
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  // User is authenticated, render children
  return <>{children}</>;
};

export default AuthRequiredRoute;
