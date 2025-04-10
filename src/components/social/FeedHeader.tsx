
import React from 'react';
import { BellIcon, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';

const FeedHeader = () => {
  const { user } = useAuth();
  
  return (
    <div className="bg-midnight-base border-b border-divider z-10 shadow-subtle sticky top-0">
      <div className="px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <h1 className="text-xl font-orbitron font-bold text-text-primary">PowerLeveling</h1>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" className="text-text-secondary hover:text-arcane hover:bg-arcane-15">
            <BellIcon className="h-5 w-5" />
          </Button>
          
          <Button variant="ghost" size="icon" className="text-text-secondary hover:text-arcane hover:bg-arcane-15">
            <MessageSquare className="h-5 w-5" />
          </Button>
          
          {user && (
            <Avatar className="h-8 w-8 profile-avatar">
              <AvatarImage src={user.user_metadata?.avatar_url} />
              <AvatarFallback className="bg-arcane-15 text-arcane">
                {user.user_metadata?.name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
          )}
        </div>
      </div>
    </div>
  );
};

export default FeedHeader;
