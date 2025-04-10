
import React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Trophy, Medal, Crown, Star, TrendingUp, TrendingDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface Member {
  id: string;
  name: string;
  avatar: string;
  points: number;
  position: number;
  isCurrentUser?: boolean;
  badge?: string;
  trend?: 'up' | 'down' | 'same';
}

interface MemberRankingListProps {
  members: Member[];
}

const MemberRankingList: React.FC<MemberRankingListProps> = ({ members }) => {
  const getPositionColor = (position: number) => {
    switch(position) {
      case 1: return 'text-achievement';
      case 2: return 'text-text-secondary';
      case 3: return 'text-valor';
      default: return 'text-text-tertiary';
    }
  };
  
  const getPositionIcon = (position: number) => {
    switch(position) {
      case 1: return <Crown className="h-4 w-4 text-achievement fill-achievement" />;
      case 2: return <Medal className="h-4 w-4 text-text-secondary" />;
      case 3: return <Medal className="h-4 w-4 text-valor" />;
      default: return position;
    }
  };
  
  const getBadge = (member: Member) => {
    if (!member.badge) return null;
    
    return (
      <Badge variant="achievement" className="ml-2 flex items-center">
        <Star className="w-3 h-3 mr-1" />
        {member.badge}
      </Badge>
    );
  };

  const getTrendIcon = (trend?: 'up' | 'down' | 'same') => {
    switch(trend) {
      case 'up': return (
        <motion.div
          initial={{ y: 0 }}
          animate={{ y: [-1, 1, -1] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          <TrendingUp className="h-3 w-3 text-arcane" />
        </motion.div>
      );
      case 'down': return (
        <motion.div
          initial={{ y: 0 }}
          animate={{ y: [1, -1, 1] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          <TrendingDown className="h-3 w-3 text-valor" />
        </motion.div>
      );
      default: return null;
    }
  };
  
  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] }
    }
  };
  
  return (
    <motion.div 
      className="space-y-3"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {members.map((member) => (
        <motion.div 
          key={member.id}
          variants={item}
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
          className={`flex items-center p-3 rounded-lg ${
            member.isCurrentUser 
              ? 'bg-arcane-15 border border-arcane-30 shadow-glow-subtle' 
              : 'bg-midnight-elevated border border-divider hover:border-arcane-30 hover:bg-arcane-15/30 transition-colors'
          }`}
        >
          <div className="w-8 text-center mr-3 flex justify-center">
            <div className={`flex items-center justify-center font-bold ${getPositionColor(member.position)}`}>
              {getPositionIcon(member.position)}
            </div>
          </div>
          
          <Avatar className={`h-10 w-10 mr-3 ${member.isCurrentUser ? 'ring-2 ring-arcane shadow-glow-purple' : 'hover:ring-1 hover:ring-arcane-30 transition-all duration-300'}`}>
            <AvatarImage src={member.avatar} alt={member.name} className="object-cover" />
            <AvatarFallback className="bg-midnight-card text-text-primary font-orbitron">{member.name.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <div className="flex items-center">
              <h4 className={`font-medium font-orbitron tracking-wide ${member.isCurrentUser ? 'text-arcane' : 'text-text-primary'}`}>
                {member.name}
                {member.isCurrentUser && <span className="text-xs text-arcane ml-1 font-sora">(Você)</span>}
              </h4>
              {getBadge(member)}
            </div>
            <div className="flex items-center">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <p className="text-sm text-text-secondary font-space flex items-center gap-1">
                      {member.points} pontos
                      {getTrendIcon(member.trend)}
                    </p>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="bg-midnight-elevated border border-arcane-30 text-text-primary text-xs">
                    {member.trend === 'up' ? 'Em ascensão' : member.trend === 'down' ? 'Em queda' : 'Posição estável'}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
};

export default MemberRankingList;
