
import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { format, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar as CalendarIcon, Loader2 } from 'lucide-react';

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

import { RaidService } from '@/services/rpg/guild/RaidService';
import { CreateRaidParams, GuildRaidType } from '@/services/rpg/guild/types';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface CreateRaidModalProps {
  guildId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (raidId: string) => void;
}

const raidFormSchema = z.object({
  name: z.string().min(3, "Nome precisa ter no mínimo 3 caracteres").max(50, "Nome não pode ter mais de 50 caracteres"),
  description: z.string().max(500, "Descrição não pode ter mais de 500 caracteres").optional(),
  endDate: z.date().refine(date => date > new Date(), {
    message: "A data de término deve ser no futuro"
  }),
  daysRequired: z.number().min(1, "Mínimo de 1 dia").max(30, "Máximo de 30 dias"),
  raidType: z.enum(['consistency', 'beast', 'elemental'] as const),
  xpReward: z.number().min(50, "Mínimo de 50 XP").max(1000, "Máximo de 1000 XP"),
  targetValue: z.number().optional(),
  elementalTypes: z.array(z.string()).optional(),
});

type RaidFormValues = z.infer<typeof raidFormSchema>;

const CreateRaidModal: React.FC<CreateRaidModalProps> = ({
  guildId,
  open,
  onOpenChange,
  onSuccess
}) => {
  const { user } = useAuth();
  const today = new Date();
  const minEndDate = addDays(today, 1);
  
  // Initialize form with default values
  const form = useForm<RaidFormValues>({
    resolver: zodResolver(raidFormSchema),
    defaultValues: {
      name: "",
      description: "",
      endDate: addDays(today, 7),
      daysRequired: 3,
      raidType: 'consistency',
      xpReward: 200,
      targetValue: 100,
      elementalTypes: ['cardio', 'strength', 'flexibility'],
    }
  });
  
  // Form submission handler
  const onSubmit = async (values: RaidFormValues) => {
    if (!user?.id) {
      toast.error("Você precisa estar logado para criar uma raid");
      return;
    }
    
    try {
      // Prepare raid details based on type
      let raidDetails: any = {
        description: values.description,
        xpReward: values.xpReward
      };
      
      if (values.raidType === 'beast') {
        raidDetails.targetValue = values.targetValue;
        raidDetails.bossName = "Behemoth";
      } else if (values.raidType === 'elemental') {
        raidDetails.elementalTypes = values.elementalTypes;
      }
      
      // Create the raid
      const createRaidParams: CreateRaidParams = {
        name: values.name,
        description: values.description,
        startDate: new Date(),
        endDate: values.endDate,
        daysRequired: values.daysRequired,
        raidType: values.raidType,
        raidDetails: raidDetails
      };
      
      const raidId = await RaidService.createRaid(guildId, user.id, createRaidParams);
      
      if (raidId) {
        onOpenChange(false);
        if (onSuccess) onSuccess(raidId);
      }
    } catch (error) {
      console.error("Error creating raid:", error);
      toast.error("Erro ao criar raid");
    }
  };
  
  // Get selected raid type to show conditional fields
  const raidType = form.watch('raidType');
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-midnight-card border-divider">
        <DialogHeader>
          <DialogTitle className="text-text-primary font-orbitron">Criar Nova Missão</DialogTitle>
          <DialogDescription className="text-text-secondary">
            Crie uma nova missão para a sua guilda e defina os objetivos e recompensas.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-text-primary">Nome da Missão</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Digite um nome para a missão"
                      className="bg-midnight-elevated border-divider text-text-primary"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage className="text-valor" />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-text-primary">Descrição</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Descreva o objetivo da missão"
                      className="bg-midnight-elevated border-divider text-text-primary h-20 resize-none"
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage className="text-valor" />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="raidType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-text-primary">Tipo de Missão</FormLabel>
                    <Select 
                      onValueChange={(value) => field.onChange(value as GuildRaidType)} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-midnight-elevated border-divider text-text-primary">
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-midnight-elevated border-divider text-text-primary">
                        <SelectItem value="consistency">Consistência</SelectItem>
                        <SelectItem value="beast">Fera Mitológica</SelectItem>
                        <SelectItem value="elemental">Desafio Elemental</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription className="text-text-tertiary text-xs">
                      {raidType === 'consistency' ? "Complete treinos em dias consecutivos" :
                       raidType === 'beast' ? "Acumule treinos para derrotar uma criatura mítica" :
                       "Complete diferentes tipos de treino"}
                    </FormDescription>
                    <FormMessage className="text-valor" />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="daysRequired"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-text-primary">
                      {raidType === 'consistency' ? "Dias Necessários" : 
                       raidType === 'beast' ? "Nível da Fera" : 
                       "Dias de Desafio"}
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        className="bg-midnight-elevated border-divider text-text-primary"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage className="text-valor" />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="text-text-primary">Data de Término</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "pl-3 text-left font-normal bg-midnight-elevated border-divider text-text-primary",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP", { locale: ptBR })
                            ) : (
                              <span>Escolha uma data</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-midnight-elevated border-divider" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={(date) => date && field.onChange(date)}
                          disabled={(date) => date < minEndDate}
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
                name="xpReward"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-text-primary">XP de Recompensa</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        className="bg-midnight-elevated border-divider text-text-primary"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage className="text-valor" />
                  </FormItem>
                )}
              />
            </div>
            
            {/* Conditional fields based on raid type */}
            {raidType === 'beast' && (
              <FormField
                control={form.control}
                name="targetValue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-text-primary">Total de Treinos Necessários</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        className="bg-midnight-elevated border-divider text-text-primary"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription className="text-text-tertiary text-xs">
                      Quantidade de treinos que a guilda precisa acumular para derrotar a fera
                    </FormDescription>
                    <FormMessage className="text-valor" />
                  </FormItem>
                )}
              />
            )}
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                className="bg-midnight-elevated border-divider hover:bg-arcane-15/20"
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={form.formState.isSubmitting}
                variant="arcane"
              >
                {form.formState.isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Criando...
                  </>
                ) : (
                  'Criar Missão'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateRaidModal;
