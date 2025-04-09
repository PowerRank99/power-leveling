
import React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Trophy } from 'lucide-react';

interface Member {
  id: string;
  name: string;
  avatar: string;
  points: number;
  position: number;
  isCurrentUser?: boolean;
  badge?: string;
}

interface MemberRankingListProps {
  members: Member[];
}

const MemberRankingList: React.FC<MemberRankingListProps> = ({ members }) => {
  const getPositionColor = (position: number) => {
    switch(position) {
      case 1: return 'text-yellow-500';
      case 2: return 'text-gray-500';
      case 3: return 'text-orange-500';
      default: return 'text-gray-700';
    }
  };
  
  const getBadge = (member: Member) => {
    if (!member.badge) return null;
    
    return (
      <Badge className="ml-2 flex items-center bg-fitblue">
        <Trophy className="w-3 h-3 mr-1" />
        {member.badge}
      </Badge>
    );
  };
  
  return (
    <div className="space-y-3">
      {members.map((member) => (
        <div 
          key={member.id}
          className={`flex items-center p-3 rounded-lg ${
            member.isCurrentUser ? 'bg-blue-50 border border-blue-100' : 'bg-white border border-gray-100'
          }`}
        >
          <div className="w-8 text-center mr-3">
            <span className={`text-lg font-bold ${getPositionColor(member.position)}`}>
              {member.position}
            </span>
          </div>
          
          <Avatar className="h-10 w-10 mr-3">
            <AvatarImage src={member.avatar} alt={member.name} />
            <AvatarFallback>{member.name.substring(0, 2)}</AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <div className="flex items-center">
              <h4 className={`font-medium ${member.isCurrentUser ? 'text-fitblue' : ''}`}>
                {member.name}
              </h4>
              {getBadge(member)}
            </div>
            <p className="text-sm text-gray-500">{member.points} pontos</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MemberRankingList;
