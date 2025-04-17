
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

const UserXPDetails = () => {
  const [userXP, setUserXP] = useState<{
    currentXP: number;
    level: number;
    nextLevelXP: number;
  } | null>(null);

  useEffect(() => {
    const fetchUserXP = async () => {
      // Fetch user by name (assuming unique name)
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('xp, level')
        .eq('name', 'Bruno Pierri')
        .single();

      if (error) {
        console.error('Error fetching user XP:', error);
        return;
      }

      if (profiles) {
        // Calculate XP needed for next level (100 * current level)
        const nextLevelXP = profiles.level < 99 
          ? profiles.level * 100 
          : Infinity;

        setUserXP({
          currentXP: profiles.xp || 0,
          level: profiles.level || 1,
          nextLevelXP
        });
      }
    };

    fetchUserXP();
  }, []);

  if (!userXP) return <div>Loading XP information...</div>;

  return (
    <div>
      <p>Current XP: {userXP.currentXP}</p>
      <p>Current Level: {userXP.level}</p>
      <p>XP Needed for Next Level: {userXP.nextLevelXP === Infinity ? 'Max Level' : userXP.nextLevelXP}</p>
      <p>XP Remaining: {userXP.nextLevelXP === Infinity ? '0' : userXP.nextLevelXP - userXP.currentXP}</p>
    </div>
  );
};

export default UserXPDetails;
