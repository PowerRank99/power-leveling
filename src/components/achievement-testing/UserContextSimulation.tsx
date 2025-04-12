
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface UserProfile {
  id: string;
  name: string;
  level: number;
}

interface UserContextSimulationProps {
  currentUserId: string;
  onUserChange: (userId: string) => void;
  addLogEntry: (action: string, details: string) => void;
}

const UserContextSimulation: React.FC<UserContextSimulationProps> = ({ 
  currentUserId, 
  onUserChange,
  addLogEntry
}) => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [selectedUserId, setSelectedUserId] = useState(currentUserId);
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    fetchUsers();
  }, []);
  
  useEffect(() => {
    setSelectedUserId(currentUserId);
  }, [currentUserId]);
  
  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, level')
        .order('name');
      
      if (error) throw error;
      
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleUserSelection = () => {
    onUserChange(selectedUserId);
    
    const selectedUser = users.find(u => u.id === selectedUserId);
    addLogEntry(
      'Test User Selected', 
      `User: ${selectedUser?.name || 'Unknown'}, Level: ${selectedUser?.level || 0}`
    );
  };
  
  return (
    <div className="flex flex-col md:flex-row gap-3 items-end">
      <div className="flex-grow space-y-2">
        <Label htmlFor="userSelect" className="flex items-center text-arcane-60">
          <Users className="mr-2 h-4 w-4" />
          Select Test User
        </Label>
        <Select 
          value={selectedUserId} 
          onValueChange={setSelectedUserId}
          disabled={isLoading || users.length === 0}
        >
          <SelectTrigger id="userSelect" className="bg-midnight-elevated border-divider">
            <SelectValue placeholder={isLoading ? "Loading users..." : "Select a user"} />
          </SelectTrigger>
          <SelectContent>
            {users.map((user) => (
              <SelectItem key={user.id} value={user.id}>
                <div className="flex items-center">
                  <User className="mr-2 h-4 w-4" />
                  <span>{user.name}</span>
                  <span className="ml-2 text-xs text-text-tertiary">Lvl {user.level}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-text-tertiary mt-1">
          Note: Actions will be performed as the selected test user
        </p>
      </div>
      
      <Button 
        onClick={handleUserSelection} 
        disabled={isLoading || !selectedUserId || selectedUserId === currentUserId}
        className="bg-midnight-elevated text-text-primary border border-divider hover:bg-midnight-card"
      >
        <User className="mr-2 h-4 w-4" />
        Use Test User
      </Button>
    </div>
  );
};

export default UserContextSimulation;
