
import React from 'react';
import { Calendar, Clock, Shield, Trophy, Users } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

import { RaidWithProgress, GuildRaidType } from '@/services/rpg/guild/types';

interface GuildRaidListProps {
  raids: RaidWithProgress[];
  guildId: string;
  isGuildMaster?: boolean;
  onJoinRaid?: (raidId: string) => void;
  onCreateRaid?: () => void;
}

const GuildRaidList: React.FC<GuildRaidListProps> = ({
  raids,
  guildId,
  isGuildMaster = false,
  onJoinRaid,
  onCreateRaid
}) => {
  const navigate = useNavigate();

  const getRaidTypeLabel = (type: GuildRaidType): string => {
    switch (type) {
      case 'consistency': return 'Consistência';
      case 'beast': return 'Fera Mitológica';
      case 'elemental': return 'Desafio Elemental';
      default: return 'Desconhecido';
    }
  };
  
  const getRaidTypeColor = (type: GuildRaidType): string => {
    switch (type) {
      case 'consistency': return 'bg-arcane-15 text-arcane border-arcane-30';
      case 'beast': return 'bg-valor-15 text-valor border-valor-30';
      case 'elemental': return 'bg-achievement-15 text-achievement border-achievement-30';
      default: return 'bg-midnight-elevated text-text-secondary border-divider';
    }
  };
  
  const getDaysRemaining = (endDate: Date): number => {
    const now = new Date();
    const diffTime = endDate.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  if (!raids || raids.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <Shield className="w-12 h-12 text-text-tertiary mb-3" />
        <h3 className="font-orbitron text-lg text-text-secondary mb-2">Nenhuma missão ativa</h3>
        <p className="text-sm text-text-tertiary mb-6 font-sora max-w-sm">
          A guilda não tem missões ativas no momento. {isGuildMaster ? 'Você pode criar uma nova missão!' : ''}
        </p>
        
        {isGuildMaster && (
          <Button 
            onClick={onCreateRaid} 
            variant="arcane"
            className="font-sora"
          >
            Criar Nova Missão
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {raids.map((raid) => (
        <motion.div 
          key={raid.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          whileHover={{ y: -2 }}
          className="transition-all duration-300"
        >
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="flex flex-col">
                {/* Raid Header */}
                <div className="p-4 flex justify-between items-start border-b border-divider bg-midnight-elevated/50">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-orbitron text-md font-bold text-text-primary">{raid.name}</h3>
                      <Badge className={`${getRaidTypeColor(raid.raidType)} text-xs`}>
                        {getRaidTypeLabel(raid.raidType)}
                      </Badge>
                    </div>
                    
                    <div className="flex mt-2 gap-4 text-xs">
                      <div className="flex items-center text-text-secondary">
                        <Calendar className="w-3.5 h-3.5 mr-1" />
                        <span className="font-space">
                          {getDaysRemaining(raid.endDate)} dias restantes
                        </span>
                      </div>
                      
                      <div className="flex items-center text-text-secondary">
                        <Users className="w-3.5 h-3.5 mr-1" />
                        <span className="font-space">
                          {raid.raidDetails.participantsCount || '0'} participantes
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {raid.raidDetails.xpReward && (
                    <Badge variant="achievement" className="flex items-center gap-1">
                      <Trophy className="w-3.5 h-3.5" /> 
                      {raid.raidDetails.xpReward} XP
                    </Badge>
                  )}
                </div>
                
                {/* Raid Progress */}
                <div className="p-4">
                  <div className="flex justify-between items-center text-xs mb-1.5 font-sora">
                    <span className="text-text-secondary">Progresso</span>
                    <span className="text-text-primary font-space">
                      {Math.floor(raid.progress.percentage)}%
                    </span>
                  </div>
                  
                  <Progress 
                    value={raid.progress.percentage} 
                    className="h-2" 
                    indicatorColor={
                      raid.raidType === 'consistency' ? "bg-arcane" : 
                      raid.raidType === 'beast' ? "bg-valor" : "bg-achievement"
                    }
                  />
                  
                  <div className="flex justify-between mt-1 text-xs text-text-tertiary font-space">
                    <span>{raid.progress.currentValue} / {raid.progress.targetValue}</span>
                    
                    {raid.raidType === 'consistency' && (
                      <span>Dias: {raid.daysRequired} necessários</span>
                    )}
                  </div>
                  
                  <div className="flex justify-end mt-4">
                    <Button 
                      variant="outline"
                      size="sm"
                      className="bg-midnight-elevated border-divider hover:bg-arcane-15 hover:border-arcane-30 font-sora text-sm"
                      onClick={() => onJoinRaid && onJoinRaid(raid.id)}
                    >
                      Participar
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
      
      {isGuildMaster && (
        <div className="flex justify-center pt-2">
          <Button 
            onClick={onCreateRaid} 
            variant="arcane" 
            className="font-sora"
          >
            Criar Nova Missão
          </Button>
        </div>
      )}
    </div>
  );
};

export default GuildRaidList;
