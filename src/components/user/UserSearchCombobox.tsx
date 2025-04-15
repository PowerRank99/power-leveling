import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, ChevronsUpDown, UserRound } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface UserOption {
  value: string;
  label: string;
  avatar?: string;
}

interface UserSearchComboboxProps {
  onUserSelect: (userId: string) => void;
  selectedUserId?: string;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

const UserSearchCombobox: React.FC<UserSearchComboboxProps> = ({
  onUserSelect,
  selectedUserId,
  placeholder = 'Select user...',
  className,
  disabled = false
}) => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [query, setQuery] = useState('');
  
  // Current selected user data
  const [selectedUser, setSelectedUser] = useState<UserOption | null>(null);
  
  // Fetch users on initial load
  useEffect(() => {
    const fetchInitialUsers = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, name, avatar_url')
          .order('name')
          .limit(10);
          
        if (error) {
          console.error('Error fetching users:', error);
          return;
        }
        
        const options = data.map(user => ({
          value: user.id,
          label: user.name || 'Unknown User',
          avatar: user.avatar_url
        }));
        
        setUsers(options);
        
        // If we have a selected user ID, find the user
        if (selectedUserId) {
          const selectedOption = options.find(option => option.value === selectedUserId);
          if (selectedOption) {
            setSelectedUser(selectedOption);
          } else {
            // If not in the initial list, fetch specific user
            fetchUserById(selectedUserId);
          }
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchInitialUsers();
  }, []);
  
  // Fetch a specific user by ID
  const fetchUserById = async (userId: string) => {
    if (!userId) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, avatar_url')
        .eq('id', userId)
        .single();
        
      if (error || !data) {
        console.error('Error fetching user by ID:', error);
        return;
      }
      
      const userOption = {
        value: data.id,
        label: data.name || 'Unknown User',
        avatar: data.avatar_url
      };
      
      setSelectedUser(userOption);
      
      // Add to users list if not already there
      setUsers(prev => {
        if (!prev.some(u => u.value === userOption.value)) {
          return [...prev, userOption];
        }
        return prev;
      });
    } catch (error) {
      console.error('Error fetching user by ID:', error);
    }
  };
  
  // Search users based on query
  const searchUsers = async (searchQuery: string) => {
    if (!searchQuery) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, avatar_url')
        .ilike('name', `%${searchQuery}%`)
        .order('name')
        .limit(10);
        
      if (error) {
        console.error('Error searching users:', error);
        return;
      }
      
      const options = data.map(user => ({
        value: user.id,
        label: user.name || 'Unknown User',
        avatar: user.avatar_url
      }));
      
      setUsers(options);
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle search input change
  const handleSearchChange = (value: string) => {
    setQuery(value);
    if (value.length >= 2) {
      searchUsers(value);
    }
  };
  
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between bg-midnight-elevated border-divider",
            className
          )}
          disabled={disabled}
        >
          {selectedUser ? (
            <span className="flex items-center">
              {selectedUser.avatar ? (
                <img
                  src={selectedUser.avatar}
                  alt={selectedUser.label}
                  className="w-5 h-5 rounded-full mr-2"
                />
              ) : (
                <UserRound className="w-4 h-4 mr-2" />
              )}
              {selectedUser.label}
            </span>
          ) : (
            <span>{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandInput 
            placeholder="Search users..." 
            value={query} 
            onValueChange={handleSearchChange} 
          />
          <CommandList>
            <CommandEmpty>No users found.</CommandEmpty>
            <CommandGroup>
              {/* Current user (always first) */}
              {user && (
                <CommandItem
                  key={user.id}
                  value={`self-${user.id}`}
                  onSelect={() => {
                    onUserSelect(user.id);
                    setSelectedUser({
                      value: user.id,
                      label: 'Current User (You)'
                    });
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedUserId === user.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <span className="flex items-center">
                    <UserRound className="w-4 h-4 mr-2 text-arcane" />
                    Current User (You)
                  </span>
                </CommandItem>
              )}
              
              {/* Other users */}
              {users.map((userOption) => (
                <CommandItem
                  key={userOption.value}
                  value={userOption.value}
                  onSelect={() => {
                    onUserSelect(userOption.value);
                    setSelectedUser(userOption);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedUserId === userOption.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <span className="flex items-center">
                    {userOption.avatar ? (
                      <img
                        src={userOption.avatar}
                        alt={userOption.label}
                        className="w-4 h-4 rounded-full mr-2"
                      />
                    ) : (
                      <UserRound className="w-4 h-4 mr-2" />
                    )}
                    {userOption.label}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default UserSearchCombobox;
