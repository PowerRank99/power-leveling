
import React from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Compass, Calendar, CheckCircle, XCircle, Shield } from 'lucide-react';

interface QuestReward {
  type: 'xp';
  amount: number;
}

export interface Quest {
  id: string;
  title: string;
  guildName: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'completed' | 'failed';
  daysCompleted: number;
  daysRequired: number;
  rewards: QuestReward[];
}

interface QuestCardProps {
  quest: Quest;
  onClick?: () => void;
}

const QuestCard: React.FC<QuestCardProps> = ({ quest, onClick }) => {
  // Format date to PT-BR
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "d MMM", { locale: ptBR });
  };
  
  // Get status badge
  const getStatusBadge = () => {
    switch(quest.status) {
      case 'active':
        return <div className="px-4 py-1 rounded-full bg-blue-100 text-blue-700 flex items-center"><Compass className="h-3 w-3 mr-1" />In Progress</div>;
      case 'completed':
        return <div className="px-4 py-1 rounded-full bg-green-100 text-green-700 flex items-center"><CheckCircle className="h-3 w-3 mr-1" />Completed</div>;
      case 'failed':
        return <div className="px-4 py-1 rounded-full bg-red-100 text-red-700 flex items-center"><XCircle className="h-3 w-3 mr-1" />Failed</div>;
      default:
        return null;
    }
  };
  
  // Get progress indicator color
  const getProgressColor = () => {
    switch(quest.status) {
      case 'active':
        return "bg-blue-500";
      case 'completed':
        return "bg-green-500";
      case 'failed':
        return "bg-red-500";
      default:
        return "bg-blue-500";
    }
  };
  
  // Calculate progress percentage
  const progressPercentage = (quest.daysCompleted / quest.daysRequired) * 100;
  
  return (
    <Card 
      className="p-6 mb-4 hover:shadow-md transition-shadow border border-gray-200 hover:border-fitblue-100"
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="text-xl font-bold text-gray-800">{quest.title}</h3>
          <p className="text-gray-500 flex items-center text-sm">
            <Shield className="h-4 w-4 mr-1 text-gray-400" />
            {quest.guildName}
          </p>
        </div>
        {getStatusBadge()}
      </div>
      
      <div className="mt-5">
        <div className="flex justify-between mb-1">
          <span className="text-gray-600">Progress</span>
          <span className="font-medium">{quest.daysCompleted}/{quest.daysRequired} days</span>
        </div>
        
        <Progress 
          value={progressPercentage} 
          className="h-3" 
          indicatorColor={getProgressColor()}
        />
      </div>
      
      <div className="mt-5">
        {quest.status === 'active' && (
          <div className="flex justify-between">
            <div className="text-gray-500 flex items-center text-sm">
              <Calendar className="h-4 w-4 mr-1" />
              Start: {formatDate(quest.startDate)}
            </div>
            <div className="text-gray-500 flex items-center text-sm">
              <Calendar className="h-4 w-4 mr-1" />
              End: {formatDate(quest.endDate)}
            </div>
          </div>
        )}
        
        {quest.status === 'completed' && (
          <div className="flex justify-between items-center">
            <div className="text-gray-500 flex items-center text-sm">
              <Calendar className="h-4 w-4 mr-1" />
              Completed on {formatDate(quest.endDate)}
            </div>
            <div className="text-green-600 font-medium">
              +{quest.rewards[0].amount} EXP
            </div>
          </div>
        )}
        
        {quest.status === 'failed' && (
          <div className="flex justify-between items-center">
            <div className="text-gray-500 flex items-center text-sm">
              <Calendar className="h-4 w-4 mr-1" />
              End: {formatDate(quest.endDate)}
            </div>
            <div className="text-red-600">
              Quest Ended
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default QuestCard;
