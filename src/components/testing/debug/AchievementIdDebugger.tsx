
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Copy, Search } from 'lucide-react';
import { AchievementIdMappingService } from '@/services/common/AchievementIdMappingService';

export const AchievementIdDebugger = () => {
  const [mappings, setMappings] = useState<{ stringId: string; uuid: string }[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    if (isVisible) {
      const loadMappings = () => {
        const allMappings = AchievementIdMappingService.getAllMappings();
        setMappings(allMappings);
      };
      
      loadMappings();
    }
  }, [isVisible]);
  
  const filteredMappings = mappings.filter(mapping => 
    mapping.stringId.includes(searchQuery) || 
    mapping.uuid.includes(searchQuery)
  );
  
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };
  
  if (!isVisible) {
    return (
      <Button 
        variant="outline" 
        size="sm" 
        className="mb-2"
        onClick={() => setIsVisible(true)}
      >
        <Search className="h-3 w-3 mr-1" />
        Show Achievement ID Mapper
      </Button>
    );
  }
  
  return (
    <Card className="p-4 mb-4 bg-midnight-card border-divider/30">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium">Achievement ID Mappings</h3>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setIsVisible(false)}
        >
          Hide
        </Button>
      </div>
      
      <div className="relative mb-3">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-text-tertiary" />
        <Input
          placeholder="Search by ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 bg-midnight-elevated border-divider"
        />
      </div>
      
      <ScrollArea className="h-[200px]">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-divider/20">
              <th className="text-left p-2 text-xs text-text-secondary">String ID</th>
              <th className="text-left p-2 text-xs text-text-secondary">UUID</th>
              <th className="text-right p-2 text-xs text-text-secondary">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredMappings.length === 0 ? (
              <tr>
                <td colSpan={3} className="text-center p-4 text-text-tertiary">
                  {searchQuery ? 'No mappings match your search' : 'No mappings available'}
                </td>
              </tr>
            ) : (
              filteredMappings.map((mapping, index) => (
                <tr key={index} className="border-b border-divider/10 hover:bg-midnight-elevated">
                  <td className="p-2 text-xs">
                    <code className="font-mono">{mapping.stringId}</code>
                  </td>
                  <td className="p-2 text-xs">
                    <code className="font-mono truncate">{mapping.uuid}</code>
                  </td>
                  <td className="p-2 text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => handleCopy(mapping.uuid)}
                      title="Copy UUID"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </ScrollArea>
      
      <div className="mt-3 text-xs text-text-tertiary">
        {mappings.length} total mappings available
      </div>
    </Card>
  );
};

export default AchievementIdDebugger;
