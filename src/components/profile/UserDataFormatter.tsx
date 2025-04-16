
import React, { ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { Database } from '@/integrations/supabase/types';

// Define Profile type based on the database schema
export type Profile = Database['public']['Tables']['profiles']['Row'];

export interface FormattedUserData {
  avatar: string;
  name: string;
  username: string;
  workoutsCount: number;
}

interface UserDataFormatterProps {
  user: User | null;
  profile: Profile | null;
  children: (data: FormattedUserData) => ReactNode;
}

const UserDataFormatter: React.FC<UserDataFormatterProps> = ({ 
  user, 
  profile, 
  children 
}) => {
  // Format user data for display
  const userAvatar = profile?.avatar_url || "/lovable-uploads/c6066df0-70c1-48cf-b017-126e8f7e850a.png";
  const userName = profile?.name || user?.email || 'User';
  const userName1 = userName.split('@')[0] || 'user';
  const userName2 = userName1.toLowerCase().replace(/\s/g, '');
  
  const formattedData: FormattedUserData = {
    avatar: userAvatar,
    name: userName,
    username: userName2,
    workoutsCount: profile?.workouts_count || 0
  };

  return <>{children(formattedData)}</>;
};

export default UserDataFormatter;
