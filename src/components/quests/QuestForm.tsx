
import React from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import QuestNameField from './QuestNameField';
import QuestDaysField from './QuestDaysField';
import QuestDateRangeField from './QuestDateRangeField';
import QuestRewardField from './QuestRewardField';

// Define form schema
const formSchema = z.object({
  title: z.string().min(3, {
    message: "Nome precisa ter pelo menos 3 caracteres",
  }),
  daysRequired: z.number().min(1, {
    message: "Pelo menos 1 dia é necessário",
  }).max(30, {
    message: "Máximo de 30 dias",
  }),
  totalDays: z.number().min(1, {
    message: "Pelo menos 1 dia é necessário",
  }).max(30, {
    message: "Máximo de 30 dias",
  }),
  startDate: z.date(),
  endDate: z.date(),
  xpReward: z.number().min(50, {
    message: "Recompensa mínima é 50 XP",
  }),
});

export type QuestFormData = z.infer<typeof formSchema>;

interface QuestFormProps {
  guildId: string;
}

const QuestForm: React.FC<QuestFormProps> = ({ guildId }) => {
  const navigate = useNavigate();
  
  // Initialize form with default values
  const form = useForm<QuestFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      daysRequired: 5,
      totalDays: 7,
      startDate: new Date(),
      endDate: new Date(new Date().setDate(new Date().getDate() + 7)),
      xpReward: 500,
    },
  });
  
  const onSubmit = (data: QuestFormData) => {
    console.log('Form data:', data);
    
    // Here you would send the data to your API
    toast.success('Quest criada com sucesso!', {
      description: `"${data.title}" foi adicionada às quests da guilda.`
    });
    
    // Navigate back to quests page
    navigate(`/guilds/${guildId}/quests`);
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="premium-card border border-divider rounded-xl p-6 space-y-6 shadow-subtle bg-midnight-card">
          <QuestNameField form={form} />
          <QuestDaysField form={form} />
          <QuestDateRangeField form={form} />
          <QuestRewardField form={form} />
        </div>
        
        <Button 
          type="submit" 
          className="w-full h-14 text-lg bg-arcane hover:bg-arcane-60 text-text-primary shadow-glow-subtle border border-arcane-30 font-orbitron"
        >
          <Plus className="h-5 w-5 mr-2" /> Criar Quest
        </Button>
      </form>
    </Form>
  );
};

export default QuestForm;
