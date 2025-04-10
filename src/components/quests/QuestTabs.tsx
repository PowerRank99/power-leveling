
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import QuestCard, { Quest } from '@/components/guilds/QuestCard';
import { Button } from '@/components/ui/button';
import { Plus, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';

interface QuestTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  filteredQuests: Quest[];
  guildId: string;
  isGuildMaster: boolean;
  handleQuestClick: (questId: string) => void;
}

const QuestTabs: React.FC<QuestTabsProps> = ({
  activeTab,
  setActiveTab,
  filteredQuests,
  guildId,
  isGuildMaster,
  handleQuestClick
}) => {
  const navigate = useNavigate();
  
  const handleCreateQuest = () => {
    navigate(`/guilds/${guildId}/quests/criar`);
  };
  
  return (
    <div>
      <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 mb-4 bg-midnight-elevated border border-divider">
          <TabsTrigger value="active" className="font-orbitron text-sm data-[state=active]:text-arcane data-[state=active]:shadow-glow-subtle">
            Ativas
          </TabsTrigger>
          <TabsTrigger value="completed" className="font-orbitron text-sm data-[state=active]:text-achievement data-[state=active]:shadow-glow-subtle">
            Completas
          </TabsTrigger>
          <TabsTrigger value="failed" className="font-orbitron text-sm data-[state=active]:text-valor data-[state=active]:shadow-glow-subtle">
            Falhas
          </TabsTrigger>
          <TabsTrigger value="all" className="font-orbitron text-sm data-[state=active]:text-text-primary data-[state=active]:shadow-glow-subtle">
            Todas
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab} className="space-y-4 mt-4">
          {filteredQuests.length > 0 ? (
            filteredQuests.map(quest => (
              <div key={quest.id} onClick={() => handleQuestClick(quest.id)} className="cursor-pointer">
                <Card className="bg-midnight-elevated border border-divider hover:border-arcane-30 hover:shadow-glow-subtle transition-all duration-300">
                  <CardContent className="p-4">
                    <QuestCard quest={quest} />
                  </CardContent>
                </Card>
              </div>
            ))
          ) : (
            <div className="bg-midnight-elevated border border-divider text-center py-10 px-4 rounded-lg">
              <ShieldAlert className="w-12 h-12 mx-auto mb-3 text-text-tertiary" />
              <h3 className="text-lg font-orbitron mb-1 text-text-primary">
                Nenhuma quest {activeTab === 'active' ? 'ativa' : activeTab === 'completed' ? 'completa' : activeTab === 'failed' ? 'falha' : ''} encontrada
              </h3>
              <p className="text-text-secondary font-sora mb-6">
                {activeTab === 'active' 
                  ? 'Não há quests ativas no momento.' 
                  : activeTab === 'completed' 
                  ? 'Sua guilda ainda não completou nenhuma quest.' 
                  : activeTab === 'failed' 
                  ? 'Parabéns! Sua guilda não falhou em nenhuma quest.'
                  : 'Não há quests disponíveis.'}
              </p>
              
              {isGuildMaster && activeTab === 'active' && (
                <Button 
                  onClick={handleCreateQuest}
                  className="bg-arcane hover:bg-arcane-60 text-text-primary shadow-glow-subtle"
                >
                  <Plus className="w-4 h-4 mr-2" /> Criar Nova Quest
                </Button>
              )}
            </div>
          )}
          
          {isGuildMaster && filteredQuests.length > 0 && activeTab === 'active' && (
            <div className="flex justify-center pt-4">
              <Button 
                onClick={handleCreateQuest}
                className="bg-arcane hover:bg-arcane-60 text-text-primary shadow-glow-subtle"
              >
                <Plus className="w-4 h-4 mr-2" /> Criar Nova Quest
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default QuestTabs;
