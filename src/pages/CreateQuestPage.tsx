
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CalendarIcon, ArrowLeft, Plus, Trophy } from 'lucide-react';
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
  FormMessage 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import BottomNavBar from '@/components/navigation/BottomNavBar';

// Define form schema
const formSchema = z.object({
  title: z.string().min(3, {
    message: "O nome deve ter pelo menos 3 caracteres",
  }),
  daysRequired: z.number().min(1, {
    message: "Necessário pelo menos 1 dia",
  }).max(30, {
    message: "Máximo de 30 dias",
  }),
  totalDays: z.number().min(1, {
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
      daysRequired: 5,
      totalDays: 7,
      startDate: new Date(),
      endDate: new Date(new Date().setDate(new Date().getDate() + 7)),
      xpReward: 500,
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
      <div className="p-4 flex items-center gap-2 border-b">
        <Button variant="ghost" size="icon" onClick={handleBackClick} className="text-black">
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-2xl font-bold">Criar Quest</h1>
      </div>
      
      <div className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="bg-white rounded-lg p-6 space-y-6">
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
              
              <div className="bg-blue-50 rounded-lg p-4 space-y-4">
                <h3 className="text-lg font-medium text-gray-700">Período da Quest</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel className="text-gray-500 mb-1">Início</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className="h-14 w-full pl-3 text-left font-normal bg-white flex justify-start"
                              >
                                <CalendarIcon className="mr-2 h-5 w-5 text-gray-400" />
                                {field.value ? (
                                  format(field.value, "d MMM, yyyy", { locale: ptBR })
                                ) : (
                                  <span>Selecione uma data</span>
                                )}
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
                              className="pointer-events-auto"
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel className="text-gray-500 mb-1">Término</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className="h-14 w-full pl-3 text-left font-normal bg-white flex justify-start"
                              >
                                <CalendarIcon className="mr-2 h-5 w-5 text-gray-400" />
                                {field.value ? (
                                  format(field.value, "d MMM, yyyy", { locale: ptBR })
                                ) : (
                                  <span>Selecione uma data</span>
                                )}
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
                              className="pointer-events-auto"
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-700 mb-4">Recompensas</h3>
                
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="bg-green-500 rounded-full p-3 mr-4">
                      <Trophy className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <FormField
                        control={form.control}
                        name="xpReward"
                        render={({ field }) => (
                          <FormItem>
                            <p className="text-xl font-semibold text-green-600">+{field.value} XP</p>
                            <p className="text-gray-600">Ao completar a quest</p>
                            <input 
                              type="hidden" 
                              {...field}
                            />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full h-14 text-lg bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-5 w-5 mr-2" /> Criar Quest
            </Button>
          </form>
        </Form>
      </div>
      
      <BottomNavBar />
    </div>
  );
};

export default CreateQuestPage;
