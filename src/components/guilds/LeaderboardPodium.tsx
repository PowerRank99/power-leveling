
import React, { useEffect } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Crown, Trophy, Medal } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

interface Member {
  id: string;
  name: string;
  avatar: string;
  points: number;
  position: number;
  isCurrentUser?: boolean;
  badge?: string;
}

interface LeaderboardPodiumProps {
  members: Member[];
}

const LeaderboardPodium: React.FC<LeaderboardPodiumProps> = ({ members }) => {
  // Sort members by position
  const sortedMembers = [...members].sort((a, b) => a.position - b.position);
  
  // Get the top 3 members
  const top3 = sortedMembers.slice(0, 3);
  
  // Position the members on the podium
  const podiumOrder = [1, 0, 2]; // Middle (1st), Left (2nd), Right (3rd)
  
  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3
      }
    }
  };
  
  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { duration: 0.5, ease: [0.23, 1, 0.32, 1] } }
  };
  
  const getMedalIcon = (position: number) => {
    switch(position) {
      case 1: return <Crown className="w-6 h-6 text-achievement fill-achievement" />;
      case 2: return <Trophy className="w-6 h-6 text-text-secondary" />;
      case 3: return <Medal className="w-6 h-6 text-valor" />;
      default: return null;
    }
  };
  
  return (
    <div className="bg-gradient-to-b from-arcane-15 to-midnight-card p-4 border-b border-divider">
      <motion.div 
        className="flex justify-around items-end h-56 relative pt-14 mt-10 perspective-800"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {podiumOrder.map((index) => {
          const member = top3[index];
          if (!member) return null;
          
          const isFirst = member.position === 1;
          const isSecond = member.position === 2;
          const isThird = member.position === 3;
          
          const podiumHeight = isFirst ? 'h-28' : isSecond ? 'h-20' : 'h-14';
          const avatarSize = isFirst ? 'h-20 w-20' : 'h-16 w-16';
          const textSize = isFirst ? 'text-lg' : 'text-sm';
          
          const podiumGradient = isFirst 
            ? 'from-achievement to-achievement/70 shadow-glow-gold' 
            : isSecond 
              ? 'from-text-secondary to-text-tertiary' 
              : 'from-valor to-valor/70';
          
          return (
            <motion.div 
              key={member.id} 
              className="flex flex-col items-center transform-preserve-3d"
              variants={item}
            >
              <div className="relative mb-2">
                <div className="absolute -top-5 left-1/2 transform -translate-x-1/2">
                  {getMedalIcon(member.position)}
                </div>
                
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                >
                  <Avatar className={`${avatarSize} border-4 ${
                    member.isCurrentUser ? 'border-arcane shadow-glow-purple' : 'border-divider'
                  } shadow-elevated transition-all duration-300`}>
                    <AvatarImage src={member.avatar} alt={member.name} />
                    <AvatarFallback className="bg-midnight-card text-text-primary font-orbitron">{member.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                </motion.div>
                
                <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full 
                  flex items-center justify-center text-xs font-bold
                  ${isFirst ? 'bg-achievement' : isSecond ? 'bg-text-secondary' : 'bg-valor'} 
                  text-midnight-deep shadow-elevated`}>
                  {member.position}
                </div>
              </div>
              
              <p className={`font-bold ${textSize} font-orbitron tracking-wide ${member.isCurrentUser ? 'text-arcane' : 'text-text-primary'}`}>{member.name}</p>
              
              <div className="flex flex-col items-center">
                <p className="text-xs font-space text-text-secondary">{member.points} pts</p>
                
                {member.badge && (
                  <Badge 
                    variant={isFirst ? "achievement" : "arcane"} 
                    className="mt-1 text-xs shadow-glow-subtle"
                  >
                    {member.badge}
                  </Badge>
                )}
              </div>
              
              <motion.div 
                className={`${podiumHeight} w-24 mt-2 rounded-t-md bg-gradient-to-t ${podiumGradient} shadow-inner`}
                initial={{ height: 0 }}
                animate={{ height: podiumHeight.replace('h-', '') + 'px' }}
                transition={{ duration: 0.5, delay: 0.2 * member.position, ease: [0.16, 1, 0.3, 1] }}
              />
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
};

export default LeaderboardPodium;
