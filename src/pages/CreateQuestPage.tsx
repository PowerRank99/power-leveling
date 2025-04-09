
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CalendarIcon, PlusIcon, Trash2Icon } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

import { useAuth } from '@/hooks/useAuth';
import PageHeader from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/button';
import { 
  Form, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormControl, 
  FormDescription, 
  FormMessage 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';

// Define form schema
const formSchema = z.object({
  title: z.string().min(5, {
    message: "O título deve ter pelo menos 5 caracteres",
  }),
  description: z.string().min(10, {
    message: "A descrição deve ter pelo menos 10 caracteres",
  }),
  type: z.enum(['workout', 'attendance', 'challenge']),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  startDate: z.date(),
  endDate: z.date(),
  rewards: z.array(
    z.object({
      type: z.enum(['xp', 'item', 'badge']),
      amount: z.number().optional(),
      name: z.string().optional(),
      description: z.string().optional(),
    })
  ).min(1, {
    message: "Adicione pelo menos uma recompensa",
  }),
});

type FormData = z.infer<typeof formSchema>;

const CreateQuestPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Initialize form with default values
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      type: 'workout',
      difficulty: 'medium',
      startDate: new Date(),
      endDate: new Date(new Date().setDate(new Date().getDate() + 30)),
      rewards: [
        { type: 'xp', amount: 100 }
      ],
    },
  });
  
  const onSubmit = (data: FormData) => {
    console.log('Form data:', data);
    
    // Here you would send the data to your API
    toast.success('Missão criada com sucesso!');
    
    // Navigate back to quests page
    navigate(`/guilds/${id}/quests`);
  };
  
  // Helper function to add a new reward
  const addReward = () => {
    const currentRewards = form.getValues('rewards');
    form.setValue('rewards', [...currentRewards, { type: 'xp', amount: 100 }]);
  };
  
  // Helper function to remove a reward
  const removeReward = (index: number) => {
    const currentRewards = form.getValues('rewards');
    if (currentRewards.length > 1) {
      form.setValue('rewards', currentRewards.filter((_, i) => i !== index));
    } else {
      toast.error('É necessário pelo menos uma recompensa');
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <PageHeader title="Criar Nova Missão" />
      
      <div className="p-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título da Missão</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Desafio de 30 dias" {...field} />
                  </FormControl>
                  <FormDescription>
                    Dê um nome curto e descritivo para a missão
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Descreva os objetivos e regras da missão"
                      className="min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Explique detalhadamente o que os membros precisam fazer para completar a missão
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Missão</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="workout">Treino</SelectItem>
                        <SelectItem value="attendance">Presença</SelectItem>
                        <SelectItem value="challenge">Desafio</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      O tipo define como a missão será acompanhada
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="difficulty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dificuldade</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a dificuldade" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="easy">Fácil</SelectItem>
                        <SelectItem value="medium">Média</SelectItem>
                        <SelectItem value="hard">Difícil</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Nível de dificuldade da missão
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Data de Início</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={
                              "w-full pl-3 text-left font-normal"
                            }
                          >
                            {field.value ? (
                              format(field.value, "PPP", { locale: ptBR })
                            ) : (
                              <span>Selecione uma data</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date < new Date(new Date().setHours(0, 0, 0, 0))
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormDescription>
                      Data em que a missão começará
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Data de Término</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={
                              "w-full pl-3 text-left font-normal"
                            }
                          >
                            {field.value ? (
                              format(field.value, "PPP", { locale: ptBR })
                            ) : (
                              <span>Selecione uma data</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date <= form.getValues("startDate")
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormDescription>
                      Data em que a missão terminará
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <FormLabel className="text-base">Recompensas</FormLabel>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={addReward}
                >
                  <PlusIcon className="h-4 w-4 mr-1" />
                  Adicionar
                </Button>
              </div>
              
              <div className="space-y-4">
                {form.watch('rewards').map((_, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 border rounded-md bg-gray-50">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                      <FormField
                        control={form.control}
                        name={`rewards.${index}.type`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Tipo</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Tipo" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="xp">XP</SelectItem>
                                <SelectItem value="badge">Insígnia</SelectItem>
                                <SelectItem value="item">Item</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {form.watch(`rewards.${index}.type`) === 'xp' && (
                        <FormField
                          control={form.control}
                          name={`rewards.${index}.amount`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">Quantidade</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  min="1"
                                  {...field}
                                  onChange={e => field.onChange(parseInt(e.target.value))}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                      
                      {(form.watch(`rewards.${index}.type`) === 'badge' || form.watch(`rewards.${index}.type`) === 'item') && (
                        <FormField
                          control={form.control}
                          name={`rewards.${index}.name`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">Nome</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                      
                      {(form.watch(`rewards.${index}.type`) === 'badge' || form.watch(`rewards.${index}.type`) === 'item') && (
                        <FormField
                          control={form.control}
                          name={`rewards.${index}.description`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">Descrição</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                    </div>
                    
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon"
                      className="mt-6 text-gray-500 hover:text-red-500"
                      onClick={() => removeReward(index)}
                    >
                      <Trash2Icon className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              
              {form.formState.errors.rewards?.message && (
                <p className="text-sm font-medium text-destructive mt-2">
                  {form.formState.errors.rewards.message}
                </p>
              )}
            </div>
            
            <div className="flex justify-end gap-3 pt-4">
              <Button 
                type="button" 
                variant="outline"
                onClick={() => navigate(`/guilds/${id}/quests`)}
              >
                Cancelar
              </Button>
              <Button type="submit" className="bg-fitblue">
                Criar Missão
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default CreateQuestPage;
