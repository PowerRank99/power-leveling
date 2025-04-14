
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { Database } from '@/integrations/supabase/types';

// Define Profile type based on the database schema
export type Profile = Database['public']['Tables']['profiles']['Row'];

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  error: Error | null;
  signIn: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let authSubscription: { subscription: { unsubscribe: () => void } } | null = null;
    
    // Function to fetch profile data
    const fetchProfile = async (userId: string) => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();
          
        if (data) {
          setProfile(data);
        } else if (error) {
          console.error('Error fetching profile:', error);
        }
      } catch (err) {
        console.error('Error in fetchProfile:', err);
      }
    };

    // Set up auth state listener first
    const setupAuthListener = async () => {
      try {
        // Clear any previous state
        setError(null);
        
        const { data: authListenerData } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            console.log('Auth state changed:', event, session?.user?.id);
            
            if (session && session.user) {
              setUser(session.user);
              
              // Fetch profile data on auth state change
              // Use setTimeout to prevent blocking the auth callback
              setTimeout(() => {
                fetchProfile(session.user.id);
              }, 0);
            } else {
              setUser(null);
              setProfile(null);
            }
            setLoading(false);
          }
        );
        
        authSubscription = authListenerData;
        
        // Then check for existing session
        const { data, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          throw sessionError;
        }
        
        if (data.session?.user) {
          setUser(data.session.user);
          
          // Fetch profile data
          await fetchProfile(data.session.user.id);
        }
        
        // If we get here without errors, we can safely set loading to false
        setLoading(false);
      } catch (err) {
        console.error('Error in setupAuthListener:', err);
        setError(err instanceof Error ? err : new Error('Unknown authentication error'));
        setLoading(false);
      }
    };

    setupAuthListener();

    // Cleanup function
    return () => {
      if (authSubscription?.subscription) {
        authSubscription.subscription.unsubscribe();
      }
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      return data;
    } catch (err) {
      console.error('Error signing in:', err);
      setError(err instanceof Error ? err : new Error('Unknown sign in error'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      setError(null);
      
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
    } catch (err) {
      console.error('Error signing out:', err);
      setError(err instanceof Error ? err : new Error('Unknown sign out error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, error, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
