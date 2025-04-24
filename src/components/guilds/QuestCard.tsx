
import React from 'react';
import { Calendar, Check, Clock, Shield, X } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';

// Define Quest types
export interface QuestReward {
  type: string;
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
  onClick?: (questId: string) => void;
}

const QuestCard: React.FC<QuestCardProps> = ({ quest, onClick }) => {
  const progressPercentage = Math.min(100, (quest.daysCompleted / quest.daysRequired) * 100);
  
  // Format date strings
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('pt-BR', {
      day: 'numeric',
      month: 'short'
    }).format(date);
  };
  
  // Calculate days remaining (or days since end for completed/failed quests)
  const getDaysInfo = () => {
    const endDate = new Date(quest.endDate);
    const today = new Date();
    
    // For active quests, calculate days remaining
    if (quest.status === 'active') {
      const diffTime = endDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays <= 0) {
        return "Último dia!";
      }
      return `${diffDays} dias restantes`;
    }
    
    // For completed/failed quests, show when it ended
    const diffTime = today.getTime() - endDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return "Finalizado hoje";
    } else if (diffDays === 1) {
      return "Finalizado ontem";
    }
    return `Finalizado há ${diffDays} dias`;
  };
  
  // Get appropriate status badge
  const getStatusBadge = () => {
    switch (quest.status) {
      case 'active':
        return <Badge className="bg-arcane-15 text-arcane border-arcane-30">Em Andamento</Badge>;
      case 'completed':
        return <Badge className="bg-achievement-15 text-achievement border-achievement-30">Concluído</Badge>;
      case 'failed':
        return <Badge className="bg-valor-15 text-valor border-valor-30">Falhou</Badge>;
      default:
        return null;
    }
  };
  
  // Get progress indicator color based on status
  const getProgressColor = () => {
    switch (quest.status) {
      case 'active':
        return 'bg-arcane';
      case 'completed':
        return 'bg-achievement';
      case 'failed':
        return 'bg-valor';
      default:
        return 'bg-arcane';
    }
  };
  
  // Get status icon
  const getStatusIcon = () => {
    switch (quest.status) {
      case 'active':
        return <Clock className="h-4 w-4 text-arcane" />;
      case 'completed':
        return <Check className="h-4 w-4 text-achievement" />;
      case 'failed':
        return <X className="h-4 w-4 text-valor" />;
      default:
        return <Shield className="h-4 w-4 text-text-secondary" />;
    }
  };
  
  return (
    <motion.div 
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
      onClick={() => onClick && onClick(quest.id)}
      className="cursor-pointer"
    >
      <Card className={`overflow-hidden border ${
        quest.status === 'active' ? 'border-arcane-30' : 
        quest.status === 'completed' ? 'border-achievement-30' : 'border-valor-30'
      }`}>
        <CardContent className="p-3">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-orbitron font-semibold text-text-primary tracking-wide">
                  {quest.title}
                </h3>
                {getStatusBadge()}
              </div>
              
              <p className="text-sm text-text-secondary font-sora mb-3">
                {quest.guildName}
              </p>
              
              <div className="flex gap-4 text-xs text-text-tertiary mb-3">
                <div className="flex items-center">
                  <Calendar className="h-3.5 w-3.5 mr-1" />
                  <span>
                    {formatDate(quest.startDate)} - {formatDate(quest.endDate)}
                  </span>
                </div>
                
                <div className="flex items-center">
                  {getStatusIcon()}
                  <span className="ml-1">{getDaysInfo()}</span>
                </div>
              </div>
              
              <div className="mb-1 flex justify-between items-center text-xs">
                <span className="text-text-secondary">Progresso</span>
                <span className="font-space text-text-primary">
                  {quest.daysCompleted}/{quest.daysRequired} dias
                </span>
              </div>
              
              <Progress 
                value={progressPercentage} 
                className="h-1.5 mb-2"
                indicatorClassName={getProgressColor()}
              />
              
              <div className="flex justify-end mt-3">
                {quest.rewards.map((reward, index) => (
                  <Badge key={index} variant="outline" className="ml-2 text-xs font-space bg-midnight-elevated border-divider">
                    {reward.amount} {reward.type.toUpperCase()}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default QuestCard;
