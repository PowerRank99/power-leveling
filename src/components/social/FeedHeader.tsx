
import React from 'react';
import { BellIcon, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { Badge } from '@/components/ui/badge';

const FeedHeader = () => {
  const { user } = useAuth();
  
  return (
    <div className="bg-midnight-base border-b border-divider z-10 shadow-subtle sticky top-0">
      <div className="px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <h1 className="text-xl font-orbitron font-bold text-text-primary bg-gradient-to-r from-arcane to-valor bg-clip-text text-transparent">PowerLeveling</h1>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="icon" className="text-text-secondary hover:text-arcane hover:bg-arcane-15 relative">
            <BellIcon className="h-5 w-5" />
            <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center bg-valor text-white text-xs">2</Badge>
          </Button>
          
          <Button variant="ghost" size="icon" className="text-text-secondary hover:text-arcane hover:bg-arcane-15">
            <MessageSquare className="h-5 w-5" />
          </Button>
          
          {user && (
            <Avatar className="h-8 w-8 profile-avatar transition-all hover:shadow-glow-purple hover:scale-110">
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
