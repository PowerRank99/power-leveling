
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Compass, Calendar, CheckCircle, XCircle, Shield, Award } from 'lucide-react';

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
        return <div className="px-3 py-1 rounded-full bg-arcane-15 text-arcane text-xs flex items-center border border-arcane-30"><Compass className="h-3 w-3 mr-1" />Em Progresso</div>;
      case 'completed':
        return <div className="px-3 py-1 rounded-full bg-achievement-15 text-achievement text-xs flex items-center border border-achievement-30"><CheckCircle className="h-3 w-3 mr-1" />Completo</div>;
      case 'failed':
        return <div className="px-3 py-1 rounded-full bg-valor-15 text-valor text-xs flex items-center border border-valor-30"><XCircle className="h-3 w-3 mr-1" />Falhou</div>;
      default:
        return null;
    }
  };
  
  // Get progress indicator color
  const getProgressColor = () => {
    switch(quest.status) {
      case 'active':
        return "bg-arcane";
      case 'completed':
        return "bg-achievement";
      case 'failed':
        return "bg-valor";
      default:
        return "bg-arcane";
    }
  };
  
  // Calculate progress percentage
  const progressPercentage = (quest.daysCompleted / quest.daysRequired) * 100;
  
  return (
    <div 
      className="p-4 mb-4 hover:shadow-elevated transition-all border border-divider bg-midnight-elevated rounded-lg"
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="text-lg font-orbitron font-bold text-text-primary">{quest.title}</h3>
          <p className="text-text-secondary flex items-center text-sm font-sora">
            <Shield className="h-4 w-4 mr-1 text-text-tertiary" />
            {quest.guildName}
          </p>
        </div>
        {getStatusBadge()}
      </div>
      
      <div className="mt-4">
        <div className="flex justify-between mb-1">
          <span className="text-text-secondary font-sora text-sm">Progresso</span>
          <span className="font-medium text-text-primary font-space">{quest.daysCompleted}/{quest.daysRequired} dias</span>
        </div>
        
        <Progress 
          value={progressPercentage} 
          className="h-2.5 bg-midnight-card" 
          indicatorClassName={getProgressColor()}
        />
      </div>
      
      <div className="mt-4">
        {quest.status === 'active' && (
          <div className="flex justify-between">
            <div className="text-text-secondary flex items-center text-sm font-sora">
              <Calendar className="h-4 w-4 mr-1" />
              Início: {formatDate(quest.startDate)}
            </div>
            <div className="text-text-secondary flex items-center text-sm font-sora">
              <Calendar className="h-4 w-4 mr-1" />
              Fim: {formatDate(quest.endDate)}
            </div>
          </div>
        )}
        
        {quest.status === 'completed' && (
          <div className="flex justify-between items-center">
            <div className="text-text-secondary flex items-center text-sm font-sora">
              <Calendar className="h-4 w-4 mr-1" />
              Completado em {formatDate(quest.endDate)}
            </div>
            <div className="text-achievement font-medium flex items-center font-space">
              <Award className="h-4 w-4 mr-1" />
              +{quest.rewards[0].amount} EXP
            </div>
          </div>
        )}
        
        {quest.status === 'failed' && (
          <div className="flex justify-between items-center">
            <div className="text-text-secondary flex items-center text-sm font-sora">
              <Calendar className="h-4 w-4 mr-1" />
              Fim: {formatDate(quest.endDate)}
            </div>
            <div className="text-valor font-sora text-sm">
              Quest Finalizada
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestCard;
