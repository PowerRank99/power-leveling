
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CalendarDays, Clock, Trophy, Users } from 'lucide-react';

interface QuestReward {
  type: 'xp' | 'item' | 'badge';
  amount?: number;
  name?: string;
  description?: string;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'completed' | 'expired';
  participantsCount: number;
  completionRate: number;
  rewards: QuestReward[];
  difficulty: 'easy' | 'medium' | 'hard';
  type: 'workout' | 'attendance' | 'challenge';
}

interface QuestCardProps {
  quest: Quest;
  onClick?: () => void;
}

const QuestCard: React.FC<QuestCardProps> = ({ quest, onClick }) => {
  // Format dates for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', { 
      day: '2-digit', 
      month: '2-digit' 
    }).format(date);
  };
  
  // Calculate days remaining
  const getDaysRemaining = () => {
    const today = new Date();
    const endDate = new Date(quest.endDate);
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };
  
  // Get color based on quest status
  const getStatusColor = () => {
    switch(quest.status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'expired': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-green-100 text-green-800 border-green-200';
    }
  };
  
  // Get difficulty badge color
  const getDifficultyColor = () => {
    switch(quest.difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };
  
  // Translate status to Portuguese
  const getStatusText = () => {
    switch(quest.status) {
      case 'active': return 'Ativa';
      case 'completed': return 'Concluída';
      case 'expired': return 'Expirada';
      default: return 'Ativa';
    }
  };
  
  // Translate difficulty to Portuguese
  const getDifficultyText = () => {
    switch(quest.difficulty) {
      case 'easy': return 'Fácil';
      case 'medium': return 'Média';
      case 'hard': return 'Difícil';
      default: return 'Média';
    }
  };

  return (
    <Card 
      className="overflow-hidden border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <div className="p-4">
        <div className="flex justify-between items-start">
          <h3 className="font-bold text-lg">{quest.title}</h3>
          <Badge className={getStatusColor()}>
            {getStatusText()}
          </Badge>
        </div>
        
        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{quest.description}</p>
        
        <div className="flex flex-wrap gap-2 mt-3">
          <Badge variant="outline" className="flex items-center gap-1">
            <CalendarDays className="h-3 w-3" />
            <span>{formatDate(quest.startDate)} - {formatDate(quest.endDate)}</span>
          </Badge>
          
          <Badge variant="outline" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{getDaysRemaining()} dias restantes</span>
          </Badge>
          
          <Badge variant="outline" className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            <span>{quest.participantsCount} participantes</span>
          </Badge>
          
          <Badge className={getDifficultyColor()}>
            {getDifficultyText()}
          </Badge>
        </div>
        
        <div className="mt-4">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Progresso</span>
            <span>{quest.completionRate}%</span>
          </div>
          <Progress value={quest.completionRate} className="h-2 bg-gray-100" />
        </div>
        
        <div className="mt-4">
          <p className="text-xs text-gray-500 mb-1">Recompensas:</p>
          <div className="flex flex-wrap gap-2">
            {quest.rewards.map((reward, index) => (
              <Badge key={index} variant="secondary" className="flex items-center gap-1 bg-blue-50 text-blue-700">
                <Trophy className="h-3 w-3" />
                {reward.type === 'xp' && <span>{reward.amount} XP</span>}
                {reward.type !== 'xp' && <span>{reward.name}</span>}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default QuestCard;
