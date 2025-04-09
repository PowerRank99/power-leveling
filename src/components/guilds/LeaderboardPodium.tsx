
import React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Crown } from 'lucide-react';

interface Member {
  id: string;
  name: string;
  avatar: string;
  points: number;
  position: number;
  isCurrentUser?: boolean;
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
  
  return (
    <div className="bg-white p-4 border-b border-gray-200">
      <div className="flex justify-around items-end h-44 pt-6 relative">
        {podiumOrder.map((index) => {
          const member = top3[index];
          if (!member) return null;
          
          const isFirst = member.position === 1;
          const isSecond = member.position === 2;
          const isThird = member.position === 3;
          
          const podiumHeight = isFirst ? 'h-24' : isSecond ? 'h-16' : 'h-10';
          const avatarSize = isFirst ? 'h-20 w-20' : 'h-16 w-16';
          const textSize = isFirst ? 'text-lg' : 'text-sm';
          
          return (
            <div key={member.id} className="flex flex-col items-center">
              <div className="relative mb-2">
                {isFirst && (
                  <div className="absolute -top-5 left-1/2 transform -translate-x-1/2">
                    <Crown className="w-6 h-6 text-yellow-500 fill-yellow-500" />
                  </div>
                )}
                
                <Avatar className={`${avatarSize} border-4 ${member.isCurrentUser ? 'border-fitblue' : 'border-white'} shadow-md`}>
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
              <p className="text-xs font-medium">{member.points} pts</p>
              
              <div className={`${podiumHeight} w-16 mt-2 rounded-t-md bg-gradient-to-t 
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
