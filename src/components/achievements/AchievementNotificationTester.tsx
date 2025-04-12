import React from 'react';
import { Button } from '@/components/ui/button';
import { useAchievementNotificationStore } from '@/stores/achievementNotificationStore';
import { AchievementNotification } from '@/types/achievementTypes';

const AchievementNotificationTester: React.FC = () => {
  const { addNotification } = useAchievementNotificationStore();
  
  const testAchievementRanks = ['S', 'A', 'B', 'C', 'D', 'E'] as const;
  type AchievementRank = typeof testAchievementRanks[number] | 'Unranked';
  
  const generateRandomAchievement = (rank: AchievementRank) => {
    const titles = {
      S: ['Lendário', 'Deus Guerreiro', 'Nascido das Sombras', 'Desbravador Supremo'],
      A: ['Mestre Ascendente', 'Soberano da Força', 'Guerreiro Implacável'],
      B: ['Indomável', 'Determinação Férrea', 'Espírito Inquebrável'],
      C: ['Persistente', 'Conquistador', 'Disciplinado'],
      D: ['Novato Promissor', 'Ascendendo', 'Em Evolução'],
      E: ['Iniciante', 'Primeiro Passo', 'Despertar'],
    };
    
    const descriptions = {
      S: ['Poder que transcende os limites mortais.', 'Apenas os escolhidos alcançam tal feito.', 'O impossível tornou-se realidade.'],
      A: ['Uma conquista extraordinária, reservada para poucos.', 'Sua dedicação atingiu patamares excepcionais.', 'Um marco na sua jornada de poder.'],
      B: ['Superou desafios significativos em sua jornada.', 'Provou seu valor em campos de batalha extraordinários.', 'Sua força impressiona aos que o observam.'],
      C: ['Sua determinação começa a mostrar resultados.', 'Um passo importante em sua evolução.', 'Suas habilidades estão se desenvolvendo notavelmente.'],
      D: ['Progredindo no caminho da força.', 'Seus esforços estão dando frutos.', 'Uma pequena conquista, mas significativa.'],
      E: ['O primeiro passo de muitos.', 'Sua jornada apenas começou.', 'Uma semente de potencial plantada.'],
    };
    
    const rankRewards = {
      S: { min: 500, max: 1000 },
      A: { min: 300, max: 500 },
      B: { min: 150, max: 300 },
      C: { min: 75, max: 150 },
      D: { min: 25, max: 75 },
      E: { min: 10, max: 25 },
    };
    
    const bonusTexts = [
      'Força aumentada temporariamente',
      'Chance de obter recompensas raras',
      'Resistência aprimorada',
      'Acesso a novos desafios',
    ];
    
    const rankKey = rank as keyof typeof titles;
    const randomTitle = titles[rankKey][Math.floor(Math.random() * titles[rankKey].length)];
    const randomDescription = descriptions[rankKey][Math.floor(Math.random() * descriptions[rankKey].length)];
    const reward = Math.floor(Math.random() * (rankRewards[rankKey].max - rankRewards[rankKey].min)) + rankRewards[rankKey].min;
    const points = Math.floor(reward / 10);
    const hasBonusText = rank === 'S' || rank === 'A' || (rank === 'B' && Math.random() > 0.5);
    const bonusText = hasBonusText ? bonusTexts[Math.floor(Math.random() * bonusTexts.length)] : undefined;
    
    return {
      id: `test-${Date.now()}`,
      title: randomTitle,
      description: randomDescription,
      xpReward: reward,
      rank,
      points,
      bonusText,
      iconName: 'trophy',
      timestamp: new Date().toISOString(),
    } as AchievementNotification;
  };
  
  const triggerRandomAchievement = () => {
    const randomRank = testAchievementRanks[Math.floor(Math.random() * testAchievementRanks.length)];
    const achievement = generateRandomAchievement(randomRank);
    addNotification(achievement);
  };
  
  const triggerMultipleAchievements = () => {
    // Create 3 random achievements of different ranks
    const usedRanks = new Set<AchievementRank>();
    for (let i = 0; i < 3; i++) {
      let randomRank: AchievementRank;
      do {
        randomRank = testAchievementRanks[Math.floor(Math.random() * testAchievementRanks.length)];
      } while (usedRanks.has(randomRank));
      
      usedRanks.add(randomRank);
      const achievement = generateRandomAchievement(randomRank);
      addNotification(achievement);
    }
  };
  
  const triggerSpecificRank = (rank: string) => {
    // Make sure rank is a valid AchievementRank
    const validRank = (testAchievementRanks.includes(rank as any) ? rank : 'E') as AchievementRank;
    const achievement = generateRandomAchievement(validRank);
    addNotification(achievement);
  };
  
  return (
    <div className="space-y-4 p-4">
      <h3 className="text-lg font-orbitron font-bold text-text-primary">Teste de Notificações</h3>
      
      <div className="grid grid-cols-2 gap-2">
        <Button 
          variant="outline" 
          className="w-full"
          onClick={triggerRandomAchievement}
        >
          Conquista Aleatória
        </Button>
        
        <Button 
          variant="outline" 
          className="w-full"
          onClick={triggerMultipleAchievements}
        >
          Múltiplas Conquistas
        </Button>
      </div>
      
      <div className="grid grid-cols-3 gap-2">
        {testAchievementRanks.map(rank => (
          <Button 
            key={rank}
            variant="outline" 
            className={`w-full ${
              rank === 'S' ? 'border-achievement text-achievement' :
              rank === 'A' ? 'border-achievement-60 text-achievement-60' :
              rank === 'B' ? 'border-valor text-valor' :
              rank === 'C' ? 'border-arcane-60 text-arcane-60' :
              rank === 'D' ? 'border-arcane text-arcane' :
              'border-arcane-30 text-arcane-30'
            }`}
            onClick={() => triggerSpecificRank(rank)}
          >
            Rank {rank}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default AchievementNotificationTester;
