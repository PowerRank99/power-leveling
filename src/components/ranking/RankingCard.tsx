
import React from 'react';
import { Crown, ChevronRight } from 'lucide-react';

interface Participant {
  id: string;
  name: string;
  avatar: string;
  points: number;
  position: number;
  isCurrentUser?: boolean;
}

interface RankingCardProps {
  title: string;
  participants: Participant[];
  totalParticipants: number;
  onClick?: () => void;
}

const RankingCard: React.FC<RankingCardProps> = ({
  title,
  participants,
  totalParticipants,
  onClick
}) => {
  // Sort participants by position
  const sortedParticipants = [...participants].sort((a, b) => a.position - b.position);
  
  // Only show top 3
  const displayParticipants = sortedParticipants.slice(0, 3);
  
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden mb-4" onClick={onClick}>
      <div className="p-4">
        <h3 className="font-bold text-xl mb-1">{title}</h3>
        <p className="text-sm text-gray-500">{totalParticipants} participantes</p>
        
        <div className="flex justify-center mt-4 mb-2 relative">
          {displayParticipants.map((participant, index) => {
            const positionStyles = [
              "absolute left-1/2 transform -translate-x-1/2", // 1st place
              "absolute left-[25%] transform -translate-x-1/2 translate-y-4", // 2nd place
              "absolute left-[75%] transform -translate-x-1/2 translate-y-4"  // 3rd place
            ];
            
            return (
              <div 
                key={participant.id}
                className={`relative ${positionStyles[index]}`}
              >
                {index === 0 && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Crown className="w-6 h-6 text-yellow-500 fill-yellow-500" />
                  </div>
                )}
                
                <div className={`w-16 h-16 rounded-full overflow-hidden border-4 ${
                  participant.isCurrentUser ? 'border-fitblue' : 'border-white'
                } shadow-md`}>
                  <img 
                    src={participant.avatar} 
                    alt={participant.name}
                    className="w-full h-full object-cover" 
                  />
                </div>
                
                <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full 
                  flex items-center justify-center text-xs font-bold
                  ${index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-orange-400'} 
                  text-white`}>
                  {participant.position}
                </div>
                
                <p className="text-center text-sm mt-1 font-medium">{participant.name}</p>
                <p className="text-center text-xs font-bold">{participant.points} pts</p>
              </div>
            );
          })}
        </div>
        
        <div className="mt-16 py-3 text-center border-t border-gray-100 flex items-center justify-center">
          <span className="text-fitblue font-medium text-sm">Ver Ranking Completo</span>
          <ChevronRight className="w-4 h-4 text-fitblue ml-1" />
        </div>
      </div>
    </div>
  );
};

export default RankingCard;
