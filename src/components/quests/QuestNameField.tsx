
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
import { QuestFormData } from './QuestForm';

interface QuestNameFieldProps {
  form: UseFormReturn<QuestFormData>;
}

const QuestNameField: React.FC<QuestNameFieldProps> = ({ form }) => {
  return (
    <FormField
      control={form.control}
      name="title"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-lg font-orbitron text-text-primary">Nome da Quest</FormLabel>
          <FormControl>
            <Input 
              placeholder="Ex: Treinar 5 dias em 7" 
              {...field} 
              className="text-lg p-4 h-14 bg-midnight-elevated border-divider text-text-primary placeholder:text-text-tertiary"
            />
          </FormControl>
          <FormMessage className="text-valor" />
        </FormItem>
      )}
    />
  );
};

export default QuestNameField;
