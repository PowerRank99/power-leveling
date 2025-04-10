
import React from 'react';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  FormField, 
  FormItem, 
  FormLabel, 
  FormControl, 
  FormMessage 
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { UseFormReturn } from 'react-hook-form';
import { QuestFormData } from './QuestForm';

interface QuestDateRangeFieldProps {
  form: UseFormReturn<QuestFormData>;
}

const QuestDateRangeField: React.FC<QuestDateRangeFieldProps> = ({ form }) => {
  return (
    <div className="bg-arcane-15 rounded-lg border border-arcane-30 p-4 space-y-4">
      <h3 className="text-lg font-orbitron text-text-primary">Período da Quest</h3>
      
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="startDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel className="text-text-secondary mb-1 font-sora">Início</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className="h-14 w-full pl-3 text-left font-normal bg-midnight-elevated border-divider text-text-primary hover:bg-arcane-15 hover:border-arcane-30 flex justify-start"
                    >
                      <CalendarIcon className="mr-2 h-5 w-5 text-arcane" />
                      {field.value ? (
                        format(field.value, "d MMM, yyyy", { locale: ptBR })
                      ) : (
                        <span className="text-text-tertiary">Selecione uma data</span>
                      )}
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-midnight-elevated border-divider" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) =>
                      date < new Date(new Date().setHours(0, 0, 0, 0))
                    }
                    initialFocus
                    className="bg-midnight-elevated text-text-primary"
                  />
                </PopoverContent>
              </Popover>
              <FormMessage className="text-valor" />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="endDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel className="text-text-secondary mb-1 font-sora">Término</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className="h-14 w-full pl-3 text-left font-normal bg-midnight-elevated border-divider text-text-primary hover:bg-arcane-15 hover:border-arcane-30 flex justify-start"
                    >
                      <CalendarIcon className="mr-2 h-5 w-5 text-arcane" />
                      {field.value ? (
                        format(field.value, "d MMM, yyyy", { locale: ptBR })
                      ) : (
                        <span className="text-text-tertiary">Selecione uma data</span>
                      )}
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-midnight-elevated border-divider" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) =>
                      date <= form.getValues("startDate")
                    }
                    initialFocus
                    className="bg-midnight-elevated text-text-primary"
                  />
                </PopoverContent>
              </Popover>
              <FormMessage className="text-valor" />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};

export default QuestDateRangeField;
