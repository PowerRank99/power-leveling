
import React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Trophy, Medal, Crown, Star, TrendingUp, TrendingDown } from 'lucide-react';

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
      <Badge className="ml-2 flex items-center bg-arcane text-text-primary shadow-glow-subtle">
        <Star className="w-3 h-3 mr-1" />
        {member.badge}
      </Badge>
    );
  };

  const getTrendIcon = (trend?: 'up' | 'down' | 'same') => {
    switch(trend) {
      case 'up': return <TrendingUp className="h-3 w-3 text-arcane" />;
      case 'down': return <TrendingDown className="h-3 w-3 text-valor" />;
      default: return null;
    }
  };
  
  return (
    <div className="space-y-3">
      {members.map((member) => (
        <div 
          key={member.id}
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
          
          <Avatar className={`h-10 w-10 mr-3 ${member.isCurrentUser ? 'ring-2 ring-arcane' : ''}`}>
            <AvatarImage src={member.avatar} alt={member.name} />
            <AvatarFallback className="bg-midnight-card text-text-primary">{member.name.substring(0, 2)}</AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <div className="flex items-center">
              <h4 className={`font-medium font-orbitron ${member.isCurrentUser ? 'text-arcane' : 'text-text-primary'}`}>
                {member.name}
                {member.isCurrentUser && <span className="text-xs text-arcane ml-1 font-sora">(Você)</span>}
              </h4>
              {getBadge(member)}
            </div>
            <div className="flex items-center">
              <p className="text-sm text-text-secondary font-space flex items-center gap-1">
                {member.points} pontos
                {getTrendIcon(member.trend)}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MemberRankingList;
