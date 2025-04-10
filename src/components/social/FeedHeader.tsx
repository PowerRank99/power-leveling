
import React from 'react';
import { BellIcon, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const FeedHeader = () => {
  const { user } = useAuth();
  
  return (
    <div className="bg-midnight-base border-b border-divider z-10 shadow-subtle sticky top-0">
      <div className="px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <motion.h1 
            className="text-xl font-orbitron font-bold text-text-primary bg-gradient-to-r from-arcane to-valor bg-clip-text text-transparent"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            PowerLeveling
          </motion.h1>
        </div>
        
        <div className="flex items-center space-x-3">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="text-text-secondary hover:text-arcane hover:bg-arcane-15 relative">
                  <BellIcon className="h-5 w-5" />
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 10
                    }}
                  >
                    <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center bg-valor text-white text-xs">2</Badge>
                  </motion.div>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="bg-midnight-elevated border border-arcane-30 text-text-primary text-xs">
                Notificações
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="text-text-secondary hover:text-arcane hover:bg-arcane-15">
                  <MessageSquare className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="bg-midnight-elevated border border-arcane-30 text-text-primary text-xs">
                Mensagens
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          {user && (
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Avatar className="h-8 w-8 profile-avatar transition-all hover:shadow-glow-purple">
                <AvatarImage src={user.user_metadata?.avatar_url} />
                <AvatarFallback className="bg-arcane-15 text-arcane">
                  {user.user_metadata?.name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FeedHeader;
