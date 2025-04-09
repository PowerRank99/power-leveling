
import React, { useEffect } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Crown, Trophy, Medal } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

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
  
  useEffect(() => {
    // Add staggered animation to podium elements - fixed to make positions visible
    const positions = document.querySelectorAll('.podium-position');
    positions.forEach((pos, index) => {
      setTimeout(() => {
        pos.classList.add('animate-fade-in');
        pos.classList.remove('opacity-0');
      }, 300 + (index * 200));
    });
  }, []);
  
  const getMedalIcon = (position: number) => {
    switch(position) {
      case 1: return <Crown className="w-6 h-6 text-yellow-500 fill-yellow-500" />;
      case 2: return <Trophy className="w-6 h-6 text-gray-400" />;
      case 3: return <Medal className="w-6 h-6 text-orange-400" />;
      default: return null;
    }
  };
  
  return (
    <div className="bg-gradient-to-b from-blue-50 to-white p-4 border-b border-gray-200">
      <div className="flex justify-around items-end h-48 pt-6 relative">
        {podiumOrder.map((index) => {
          const member = top3[index];
          if (!member) return null;
          
          const isFirst = member.position === 1;
          const isSecond = member.position === 2;
          const isThird = member.position === 3;
          
          const podiumHeight = isFirst ? 'h-28' : isSecond ? 'h-20' : 'h-14';
          const avatarSize = isFirst ? 'h-20 w-20' : 'h-16 w-16';
          const textSize = isFirst ? 'text-lg' : 'text-sm';
          
          return (
            <div key={member.id} className="podium-position flex flex-col items-center">
              <div className="relative mb-2">
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                  {getMedalIcon(member.position)}
                </div>
                
                <Avatar className={`${avatarSize} border-4 ${
                  member.isCurrentUser ? 'border-fitblue' : 'border-white'
                } shadow-lg hover:scale-105 transition-transform`}>
                  <AvatarImage src={member.avatar} alt={member.name} />
                  <AvatarFallback>{member.name.substring(0, 2)}</AvatarFallback>
                </Avatar>
                
                <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full 
                  flex items-center justify-center text-xs font-bold
                  ${isFirst ? 'bg-yellow-500' : isSecond ? 'bg-gray-400' : 'bg-orange-400'} 
                  text-white`}>
                  {member.position}
                </div>
              </div>
              
              <p className={`font-bold ${textSize} ${member.isCurrentUser ? 'text-fitblue' : ''}`}>{member.name}</p>
              
              <div className="flex flex-col items-center">
                <p className="text-xs font-medium">{member.points} pts</p>
                
                {member.badge && (
                  <Badge className="mt-1 text-xs bg-fitblue/80">{member.badge}</Badge>
                )}
              </div>
              
              <div className={`${podiumHeight} w-24 mt-2 rounded-t-md bg-gradient-to-t shadow-inner
                ${isFirst ? 'from-yellow-500 to-yellow-400' : 
                  isSecond ? 'from-gray-400 to-gray-300' : 
                    'from-orange-500 to-orange-400'}`}>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LeaderboardPodium;
