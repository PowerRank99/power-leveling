
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CalendarIcon, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

import { useAuth } from '@/hooks/useAuth';
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';

// Define form schema
const formSchema = z.object({
  title: z.string().min(3, {
    message: "O título deve ter pelo menos 3 caracteres",
  }),
  description: z.string().min(10, {
    message: "A descrição deve ter pelo menos 10 caracteres",
  }),
  daysRequired: z.number().min(1, {
    message: "Necessário pelo menos 1 dia",
  }).max(30, {
    message: "Máximo de 30 dias",
  }),
  startDate: z.date(),
  endDate: z.date(),
  xpReward: z.number().min(50, {
    message: "A recompensa mínima é de 50 XP",
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
      daysRequired: 5,
      startDate: new Date(),
      endDate: new Date(new Date().setDate(new Date().getDate() + 7)),
      xpReward: 200,
    },
  });
  
  const onSubmit = (data: FormData) => {
    console.log('Form data:', data);
    
    // Here you would send the data to your API
    toast.success('Missão criada com sucesso!');
    
    // Navigate back to quests page
    navigate(`/guilds/${id}/quests`);
  };
  
  const handleBackClick = () => {
    navigate(`/guilds/${id}/quests`);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <div className="p-4 flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={handleBackClick}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">Criar Nova Missão</h1>
      </div>
      
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
                    <Input placeholder="Ex: Treino Intenso" {...field} />
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
                      placeholder="Complete treinos na academia por vários dias consecutivos"
                      className="min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Explique o que os membros precisam fazer para completar a missão
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="daysRequired"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dias Necessários</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min="1"
                      max="30"
                      {...field}
                      onChange={e => field.onChange(parseInt(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription>
                    Número de dias que os membros precisam completar treinos
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
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
                            className="w-full pl-3 text-left font-normal"
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
                            className="w-full pl-3 text-left font-normal"
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
            
            <FormField
              control={form.control}
              name="xpReward"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Recompensa de XP</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min="50"
                      {...field}
                      onChange={e => field.onChange(parseInt(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription>
                    Quantidade de XP que os membros recebem ao completar a missão
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-end gap-3 pt-4">
              <Button 
                type="button" 
                variant="outline"
                onClick={() => navigate(`/guilds/${id}/quests`)}
              >
                Cancelar
              </Button>
              <Button type="submit" className="bg-blue-500 hover:bg-blue-600">
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
