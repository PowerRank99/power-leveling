
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Check, Clock, Shield, Target, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';

import { RaidService } from '@/services/rpg/guild/RaidService';
import { RaidWithProgress } from '@/services/rpg/guild/types';
import { useAuth } from '@/hooks/useAuth';

interface RaidParticipationUIProps {
  raid: RaidWithProgress;
  onRaidUpdate?: () => void;
}

const RaidParticipationUI: React.FC<RaidParticipationUIProps> = ({ 
  raid,
  onRaidUpdate
}) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [hasParticipatedToday, setHasParticipatedToday] = useState(false);
  const [userProgress, setUserProgress] = useState(0);

  // Calculate days remaining
  const daysRemaining = Math.ceil((raid.endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] }
    }
  };
  
  useEffect(() => {
    // Check if user has participated today
    // This would normally come from the API
    setHasParticipatedToday(false);
    
    // Get user progress for this raid
    if (raid.raidDetails.participants) {
      const userParticipation = raid.raidDetails.participants.find(
        (p: any) => p.user_id === user?.id
      );
      
      if (userParticipation) {
        setUserProgress(userParticipation.days_completed || 0);
      }
    }
  }, [raid, user]);
  
  const handleParticipate = async () => {
    if (!user?.id) {
      toast.error("Você precisa estar logado para participar");
      return;
    }
    
    try {
      setIsLoading(true);
      const result = await RaidService.trackParticipation(raid.id, user.id);
      
      if (result) {
        toast.success("Participação registrada!", {
          description: "Sua contribuição para a raid foi registrada com sucesso."
        });
        setHasParticipatedToday(true);
        setUserProgress(prev => prev + 1);
        if (onRaidUpdate) onRaidUpdate();
      }
    } catch (error) {
      toast.error("Erro ao registrar participação", {
        description: "Ocorreu um erro ao registrar sua participação. Tente novamente."
      });
      console.error("Error tracking participation:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const getRaidTypeDetails = () => {
    switch (raid.raidType) {
      case 'consistency':
        return {
          description: `Treine ${raid.daysRequired} dias durante o período da missão.`,
          icon: <Calendar className="h-6 w-6 text-arcane" />,
          color: 'text-arcane',
          background: 'bg-arcane-15',
          border: 'border-arcane-30',
          title: 'Missão de Consistência'
        };
      case 'beast':
        return {
          description: `Derrote a fera mitológica acumulando ${raid.progress.targetValue} treinos coletivos.`,
          icon: <Target className="h-6 w-6 text-valor" />,
          color: 'text-valor',
          background: 'bg-valor-15',
          border: 'border-valor-30',
          title: 'Fera Mitológica'
        };
      case 'elemental':
        return {
          description: `Complete um treino de cada tipo de elemento: ${(raid.raidDetails.elementalTypes || []).join(', ')}.`,
          icon: <Shield className="h-6 w-6 text-achievement" />,
          color: 'text-achievement',
          background: 'bg-achievement-15',
          border: 'border-achievement-30',
          title: 'Desafio Elemental'
        };
      default:
        return {
          description: 'Participe desta missão para ganhar recompensas.',
          icon: <Shield className="h-6 w-6 text-text-secondary" />,
          color: 'text-text-secondary',
          background: 'bg-midnight-elevated',
          border: 'border-divider',
          title: 'Missão'
        };
    }
  };
  
  const typeDetails = getRaidTypeDetails();

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <Card className={`border ${typeDetails.border} overflow-hidden shadow-subtle`}>
        <CardContent className="p-0">
          {/* Raid Header */}
          <div className={`${typeDetails.background} p-5 border-b ${typeDetails.border}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {typeDetails.icon}
                <h3 className={`font-orbitron font-bold ml-2 tracking-wide ${typeDetails.color}`}>
                  {typeDetails.title}
                </h3>
              </div>
              
              {raid.raidDetails.xpReward && (
                <Badge variant="achievement" className="flex items-center gap-1">
                  <Trophy className="w-3.5 h-3.5" /> 
                  {raid.raidDetails.xpReward} XP
                </Badge>
              )}
            </div>
            
            <p className="text-text-secondary font-sora mt-2 text-sm">
              {typeDetails.description}
            </p>
            
            <div className="flex justify-between mt-3">
              <div className="flex items-center text-text-secondary text-sm">
                <Clock className="w-4 h-4 mr-1" />
                {daysRemaining > 1 ? `${daysRemaining} dias restantes` : "Último dia!"}
              </div>
            </div>
          </div>
          
          {/* Participation Section */}
          <div className="p-5 space-y-4">
            {/* Overall Progress */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-sm text-text-secondary font-sora">Progresso da Guilda</span>
                <span className="text-sm font-space text-text-primary">{Math.floor(raid.progress.percentage)}%</span>
              </div>
              <Progress 
                value={raid.progress.percentage} 
                className={`h-2`}
                indicatorColor={
                  raid.raidType === 'consistency' ? "bg-arcane" : 
                  raid.raidType === 'beast' ? "bg-valor" : "bg-achievement"
                }
              />
              <div className="flex justify-between mt-1">
                <span className="text-xs text-text-tertiary font-space">
                  {raid.progress.currentValue} / {raid.progress.targetValue}
                </span>
              </div>
            </div>
            
            {/* User Progress */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-sm text-text-secondary font-sora">Sua Contribuição</span>
                <span className="text-sm font-space text-text-primary">
                  {userProgress} / {raid.daysRequired}
                </span>
              </div>
              <Progress 
                value={(userProgress / raid.daysRequired) * 100} 
                className={`h-2`}
                indicatorColor={
                  raid.raidType === 'consistency' ? "bg-arcane" : 
                  raid.raidType === 'beast' ? "bg-valor" : "bg-achievement"
                }
              />
            </div>
            
            {/* Participation Action */}
            <div className="flex justify-center pt-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <Button
                        variant={hasParticipatedToday ? "outline" : "arcane"}
                        disabled={hasParticipatedToday || isLoading}
                        onClick={handleParticipate}
                        className={`font-sora ${hasParticipatedToday ? 'bg-arcane-15 border-arcane-30' : ''}`}
                      >
                        {isLoading ? (
                          <>
                            <span className="animate-pulse">Registrando...</span>
                          </>
                        ) : hasParticipatedToday ? (
                          <>
                            <Check className="w-4 h-4 mr-1" /> Participação Registrada
                          </>
                        ) : (
                          <>Participar Hoje</>
                        )}
                      </Button>
                    </div>
                  </TooltipTrigger>
                  {hasParticipatedToday && (
                    <TooltipContent side="bottom" className="bg-midnight-elevated border border-arcane-30 text-text-primary text-xs">
                      Você já participou hoje. Volte amanhã!
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default RaidParticipationUI;
