
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import BottomNavBar from '@/components/navigation/BottomNavBar';
import QuestFormHeader from '@/components/quests/QuestFormHeader';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import QuestTemplate, { QuestTemplateProps } from '@/components/quests/QuestTemplate';
import QuestConfirmationDialog from '@/components/quests/QuestConfirmationDialog';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

const CreateQuestPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [selectedQuestId, setSelectedQuestId] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  
  // Predefined quest templates
  const questTemplates: QuestTemplateProps[] = [
    {
      id: '1',
      title: 'Consistência Diária',
      description: 'Complete treinos 5 dias em uma semana para demonstrar sua consistência.',
      daysRequired: 5,
      totalDays: 7,
      xpReward: 500,
      category: 'medium',
      onSelect: () => {},
    },
    {
      id: '2',
      title: 'Desafio Intenso',
      description: 'Complete 3 treinos de alta intensidade durante a semana.',
      daysRequired: 3,
      totalDays: 7,
      xpReward: 350,
      category: 'hard',
      onSelect: () => {},
    },
    {
      id: '3',
      title: 'Iniciante',
      description: 'Complete 3 treinos em uma semana para começar sua jornada fitness.',
      daysRequired: 3,
      totalDays: 7,
      xpReward: 250,
      category: 'easy',
      onSelect: () => {},
    },
    {
      id: '4',
      title: 'Maratona Fitness',
      description: 'Complete 14 treinos em 21 dias para provar sua resistência.',
      daysRequired: 14,
      totalDays: 21,
      xpReward: 1000,
      category: 'hard',
      onSelect: () => {},
    },
    {
      id: '5',
      title: 'Fim de Semana Ativo',
      description: 'Complete treinos tanto no sábado quanto no domingo.',
      daysRequired: 2,
      totalDays: 2,
      xpReward: 200,
      category: 'easy',
      onSelect: () => {},
    },
    {
      id: '6',
      title: 'Semana Completa',
      description: 'Complete um treino todos os dias da semana.',
      daysRequired: 7,
      totalDays: 7,
      xpReward: 700,
      category: 'hard',
      onSelect: () => {},
    }
  ];
  
  const handleQuestSelect = (templateId: string) => {
    setSelectedQuestId(templateId);
    setShowConfirmation(true);
  };
  
  const handleConfirmQuest = () => {
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success('Missão criada com sucesso!');
      navigate(`/guilds/${id}/quests`);
    }, 800);
  };
  
  const handleBackClick = () => {
    navigate(`/guilds/${id}/quests`);
  };
  
  // Filter quests based on search query and category
  const filteredQuests = questTemplates.filter(quest => {
    const matchesSearch = quest.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          quest.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'all' || quest.category === activeCategory;
    
    return matchesSearch && matchesCategory;
  });
  
  const selectedQuest = selectedQuestId ? 
    questTemplates.find(q => q.id === selectedQuestId) || null : 
    null;
  
  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <QuestFormHeader 
        title="Escolher Quest" 
        onBackClick={handleBackClick}
      />
      
      <div className="p-4">
        <div className="bg-white rounded-lg p-4 mb-4 shadow-sm">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar quests..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Tabs defaultValue="all" value={activeCategory} onValueChange={setActiveCategory}>
            <TabsList className="w-full grid grid-cols-4 mb-4">
              <TabsTrigger value="all">Todas</TabsTrigger>
              <TabsTrigger value="easy">Fácil</TabsTrigger>
              <TabsTrigger value="medium">Média</TabsTrigger>
              <TabsTrigger value="hard">Difícil</TabsTrigger>
            </TabsList>
            
            <TabsContent value={activeCategory} className="mt-0">
              <ScrollArea className="h-[calc(100vh-260px)]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4">
                  {filteredQuests.map(quest => (
                    <QuestTemplate
                      key={quest.id}
                      {...quest}
                      onSelect={handleQuestSelect}
                      selected={selectedQuestId === quest.id}
                    />
                  ))}
                  
                  {filteredQuests.length === 0 && (
                    <div className="col-span-full flex flex-col items-center justify-center p-8 text-center text-gray-500">
                      <p>Nenhuma quest encontrada.</p>
                      <p className="text-sm">Tente uma busca diferente ou mude a categoria.</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      <QuestConfirmationDialog
        open={showConfirmation}
        onOpenChange={setShowConfirmation}
        selectedQuest={selectedQuest}
        onConfirm={handleConfirmQuest}
        isSubmitting={isSubmitting}
      />
      
      <BottomNavBar />
    </div>
  );
};

export default CreateQuestPage;
