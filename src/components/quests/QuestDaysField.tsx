
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

interface FormData {
  title: string;
  daysRequired: number;
  totalDays: number;
  startDate: Date;
  endDate: Date;
  xpReward: number;
}

interface QuestDaysFieldProps {
  form: UseFormReturn<FormData>;
}

const QuestDaysField: React.FC<QuestDaysFieldProps> = ({ form }) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <FormField
        control={form.control}
        name="daysRequired"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-lg font-medium text-gray-700">Dias Necessários</FormLabel>
            <FormControl>
              <Input 
                type="number" 
                min="1"
                max="30"
                className="text-lg p-4 h-14 text-center"
                {...field}
                onChange={e => field.onChange(parseInt(e.target.value))}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="totalDays"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-lg font-medium text-gray-700">Dias Totais</FormLabel>
            <FormControl>
              <Input 
                type="number" 
                min="1"
                max="30"
                className="text-lg p-4 h-14 text-center"
                {...field}
                onChange={e => field.onChange(parseInt(e.target.value))}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default QuestDaysField;
