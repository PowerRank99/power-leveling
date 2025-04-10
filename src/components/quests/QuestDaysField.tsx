
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

interface QuestDaysFieldProps {
  form: UseFormReturn<QuestFormData>;
}

const QuestDaysField: React.FC<QuestDaysFieldProps> = ({ form }) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <FormField
        control={form.control}
        name="daysRequired"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-lg font-orbitron text-text-primary">Dias Necessários</FormLabel>
            <FormControl>
              <Input 
                type="number" 
                min="1"
                max="30"
                className="text-lg p-4 h-14 text-center bg-midnight-elevated border-divider text-text-primary font-space"
                {...field}
                onChange={e => field.onChange(parseInt(e.target.value))}
              />
            </FormControl>
            <FormMessage className="text-valor" />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="totalDays"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-lg font-orbitron text-text-primary">Dias Totais</FormLabel>
            <FormControl>
              <Input 
                type="number" 
                min="1"
                max="30"
                className="text-lg p-4 h-14 text-center bg-midnight-elevated border-divider text-text-primary font-space"
                {...field}
                onChange={e => field.onChange(parseInt(e.target.value))}
              />
            </FormControl>
            <FormMessage className="text-valor" />
          </FormItem>
        )}
      />
    </div>
  );
};

export default QuestDaysField;
