
import React from 'react';
import { Bell, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';

const FeedHeader = () => {
  const { user } = useAuth();
  
  return (
    <div className="sticky top-0 z-20 bg-white px-4 py-3 flex justify-between items-center shadow-sm border-b border-gray-200">
      <div className="flex items-center">
        <Avatar className="h-8 w-8 mr-2">
          <AvatarImage src={user?.user_metadata?.avatar_url} alt="Avatar" />
          <AvatarFallback>FT</AvatarFallback>
        </Avatar>
        <h1 className="text-xl font-bold">Início</h1>
      </div>
      
      <div className="flex items-center space-x-2">
        <Button variant="ghost" size="icon" className="text-gray-500 rounded-full">
          <Search className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" className="text-gray-500 rounded-full relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
        </Button>
      </div>
    </div>
  );
};

export default FeedHeader;
