
import React from 'react';
import { RankData, RankService } from '@/services/rpg/RankService';
import { Shield, ChevronRight, Award, Trophy } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Progress } from '@/components/ui/progress';

interface RankDisplayProps {
  rankData: RankData | null;
  mini?: boolean;
  loading?: boolean;
  showTooltips?: boolean;
}

const RankDisplay: React.FC<RankDisplayProps> = ({ 
  rankData, 
  mini = false,
  loading = false,
  showTooltips = true
}) => {
  if (!rankData && !loading) {
    return (
      <div className="flex justify-center items-center p-4 text-text-tertiary">
        <Trophy className="mr-2 h-5 w-5" />
        <span>Rank não disponível</span>
      </div>
    );
  }
  
  if (loading) {
    return (
      <div className="animate-pulse flex flex-col p-4">
        <div className="h-8 bg-midnight-elevated rounded-md w-1/3 mb-4"></div>
        <div className="h-4 bg-midnight-elevated rounded-md w-2/3 mb-2"></div>
        <div className="h-4 bg-midnight-elevated rounded-md w-1/2"></div>
      </div>
    );
  }
  
  if (!rankData) return null;
  
  // Get rank color and background classes
  const rankColorClass = RankService.getRankColorClass(rankData.rank);
  const rankBackgroundClass = RankService.getRankBackgroundClass(rankData.rank);
  const rankDescription = RankService.getRankDescription(rankData.rank);
  
  // Calculate progress to next rank
  const currentRankThreshold = RankService.getRankThreshold(rankData.rank);
  const nextRankThreshold = rankData.nextRank ? RankService.getRankThreshold(rankData.nextRank) : null;
  
  let progressPercentage = 0;
  if (currentRankThreshold && nextRankThreshold && rankData.pointsToNextRank !== null) {
    const totalPointsNeeded = nextRankThreshold.minScore - currentRankThreshold.minScore;
    const pointsEarned = totalPointsNeeded - rankData.pointsToNextRank;
    progressPercentage = Math.min(100, Math.max(0, (pointsEarned / totalPointsNeeded) * 100));
  }
  
  if (mini) {
    return (
      <div className="flex items-center space-x-2">
        <div className={`p-1 rounded-md ${rankBackgroundClass}`}>
          <Shield className="h-5 w-5 text-text-primary" />
        </div>
        <span className={`font-orbitron font-bold ${rankColorClass}`}>{rankData.rank}</span>
      </div>
    );
  }
  
  return (
    <Card className="premium-card hover:premium-card-elevated transition-all duration-300">
      <CardHeader className="px-4 py-3 flex flex-row justify-between items-center bg-midnight-card bg-opacity-50 backdrop-blur-sm border-b border-divider/30">
        <h3 className="section-header text-lg orbitron-text font-bold text-text-primary">
          Rank
        </h3>
      </CardHeader>
      
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <div className={`p-2 rounded-md ${rankBackgroundClass} shadow-glow-subtle mr-3`}>
              <Shield className="h-8 w-8 text-text-primary" />
            </div>
            <div>
              <div className="flex items-center">
                <h3 className={`font-orbitron text-2xl font-bold ${rankColorClass}`}>
                  {rankData.rank}
                </h3>
                {rankData.nextRank && (
                  <div className="flex items-center ml-2 text-text-tertiary">
                    <ChevronRight className="h-4 w-4" />
                    <span className={RankService.getRankColorClass(rankData.nextRank)}>
                      {rankData.nextRank}
                    </span>
                  </div>
                )}
              </div>
              <p className="text-text-secondary text-sm">{rankDescription}</p>
            </div>
          </div>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex flex-col items-center bg-midnight-elevated px-3 py-2 rounded-md border border-divider/30">
                  <span className="text-xs text-text-tertiary">Pontuação</span>
                  <span className="font-space text-lg font-bold text-text-primary">{Math.floor(rankData.rankScore)}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p className="text-xs">Rank Score = 1.5 × Level + 2 × (Achievement Points)</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        
        {rankData.nextRank && rankData.pointsToNextRank !== null && (
          <div className="mt-3">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm text-text-secondary">Progresso para {rankData.nextRank}</span>
              <span className="text-sm font-space text-text-secondary">
                {Math.floor(progressPercentage)}%
              </span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
            <div className="flex justify-between mt-2">
              <span className="text-xs text-text-tertiary">{rankData.rank}</span>
              <span className="text-xs text-text-tertiary">
                Faltam {rankData.pointsToNextRank} pontos para {rankData.nextRank}
              </span>
            </div>
          </div>
        )}
        
        <div className="mt-6 flex justify-between gap-2">
          <div className="flex-1 bg-midnight-elevated rounded-md p-3 border border-divider/30">
            <div className="text-center">
              <span className="text-sm text-text-tertiary">Pontos Totais</span>
              <div className="font-space font-bold text-xl text-arcane">
                {rankData.totalPoints}
              </div>
            </div>
          </div>
          
          <div className="flex-1 bg-midnight-elevated rounded-md p-3 border border-divider/30">
            <div className="text-center">
              <span className="text-sm text-text-tertiary">Próximo Rank</span>
              <div className="font-space font-bold text-xl text-valor">
                {rankData.nextRank || '—'}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RankDisplay;
