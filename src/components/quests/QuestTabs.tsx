
import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import QuestCard, { Quest } from '@/components/guilds/QuestCard';
import { motion } from 'framer-motion';
import { Clock, CheckCircle, XCircle, List } from 'lucide-react';

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
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };
  
  // Get active quests
  const activeQuests = filteredQuests.filter(quest => quest.status === 'active');
  
  // Get completed quests
  const completedQuests = filteredQuests.filter(quest => quest.status === 'completed');
  
  // Get failed quests
  const failedQuests = filteredQuests.filter(quest => quest.status === 'failed');
  
  // Empty state component
  const EmptyState = ({ label }: { label: string }) => (
    <div className="flex flex-col items-center justify-center p-8">
      <p className="text-text-tertiary text-sm">{label}</p>
    </div>
  );
  
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="w-full grid grid-cols-4 mb-4 bg-midnight-elevated">
        <TabsTrigger 
          value="all" 
          className="data-[state=active]:bg-arcane-15 data-[state=active]:text-arcane data-[state=active]:shadow-glow-subtle"
        >
          <List className="w-4 h-4 mr-1 sm:mr-2" />
          <span className="hidden sm:inline">Todas</span>
        </TabsTrigger>
        <TabsTrigger 
          value="active" 
          className="data-[state=active]:bg-arcane-15 data-[state=active]:text-arcane data-[state=active]:shadow-glow-subtle"
        >
          <Clock className="w-4 h-4 mr-1 sm:mr-2" />
          <span className="hidden sm:inline">Ativas</span>
        </TabsTrigger>
        <TabsTrigger 
          value="completed" 
          className="data-[state=active]:bg-achievement-15 data-[state=active]:text-achievement data-[state=active]:shadow-glow-subtle"
        >
          <CheckCircle className="w-4 h-4 mr-1 sm:mr-2" />
          <span className="hidden sm:inline">Concluídas</span>
        </TabsTrigger>
        <TabsTrigger 
          value="failed" 
          className="data-[state=active]:bg-valor-15 data-[state=active]:text-valor data-[state=active]:shadow-glow-subtle"
        >
          <XCircle className="w-4 h-4 mr-1 sm:mr-2" />
          <span className="hidden sm:inline">Falhas</span>
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="all">
        <ScrollArea className="h-[60vh]">
          {filteredQuests.length > 0 ? (
            <motion.div 
              className="space-y-3 pr-4"
              variants={containerVariants}
              initial="hidden"
              animate="show"
            >
              {filteredQuests.map(quest => (
                <motion.div key={quest.id} variants={itemVariants}>
                  <QuestCard quest={quest} onClick={handleQuestClick} />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <EmptyState label="Nenhuma missão encontrada" />
          )}
        </ScrollArea>
      </TabsContent>
      
      <TabsContent value="active">
        <ScrollArea className="h-[60vh]">
          {activeQuests.length > 0 ? (
            <motion.div 
              className="space-y-3 pr-4"
              variants={containerVariants}
              initial="hidden"
              animate="show"
            >
              {activeQuests.map(quest => (
                <motion.div key={quest.id} variants={itemVariants}>
                  <QuestCard quest={quest} onClick={handleQuestClick} />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <EmptyState label="Nenhuma missão ativa encontrada" />
          )}
        </ScrollArea>
      </TabsContent>
      
      <TabsContent value="completed">
        <ScrollArea className="h-[60vh]">
          {completedQuests.length > 0 ? (
            <motion.div 
              className="space-y-3 pr-4"
              variants={containerVariants}
              initial="hidden"
              animate="show"
            >
              {completedQuests.map(quest => (
                <motion.div key={quest.id} variants={itemVariants}>
                  <QuestCard quest={quest} onClick={handleQuestClick} />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <EmptyState label="Nenhuma missão concluída encontrada" />
          )}
        </ScrollArea>
      </TabsContent>
      
      <TabsContent value="failed">
        <ScrollArea className="h-[60vh]">
          {failedQuests.length > 0 ? (
            <motion.div 
              className="space-y-3 pr-4"
              variants={containerVariants}
              initial="hidden"
              animate="show"
            >
              {failedQuests.map(quest => (
                <motion.div key={quest.id} variants={itemVariants}>
                  <QuestCard quest={quest} onClick={handleQuestClick} />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <EmptyState label="Nenhuma missão falha encontrada" />
          )}
        </ScrollArea>
      </TabsContent>
    </Tabs>
  );
};

export default QuestTabs;
