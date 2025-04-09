
import React from 'react';
import { 
  FormField, 
  FormItem, 
  FormLabel, 
  FormControl, 
  FormMessage 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { UseFormReturn } from 'react-hook-form';
import { z } from 'zod';

// We need to define the form schema shape here to match what's used in CreateQuestPage
interface FormData {
  title: string;
  daysRequired: number;
  totalDays: number;
  startDate: Date;
  endDate: Date;
  xpReward: number;
}

interface QuestNameFieldProps {
  form: UseFormReturn<FormData>;
}

const QuestNameField: React.FC<QuestNameFieldProps> = ({ form }) => {
  return (
    <FormField
      control={form.control}
      name="title"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-lg font-medium text-gray-700">Nome da Quest</FormLabel>
          <FormControl>
            <Input 
              placeholder="Ex: Treinar 5 dias em 7" 
              {...field} 
              className="text-lg p-4 h-14"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default QuestNameField;
