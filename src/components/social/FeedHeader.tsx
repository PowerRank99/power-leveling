
import React from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';

const FeedHeader = () => {
  return (
    <div className="sticky top-0 z-10 bg-white px-4 py-3 flex justify-between items-center shadow-sm">
      <h1 className="text-2xl font-bold">Início</h1>
      <Button variant="ghost" size="icon" className="text-gray-500">
        <Bell className="h-6 w-6" />
      </Button>
    </div>
  );
};

export default FeedHeader;
