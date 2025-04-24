
import React from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Upload } from "lucide-react";

import { GuildService } from '@/services/rpg/guild/GuildService';
import { useAuth } from '@/hooks/useAuth';

// Form schema validation
const guildFormSchema = z.object({
  name: z.string()
    .min(3, "Nome precisa ter no mínimo 3 caracteres")
    .max(50, "Nome não pode ter mais de 50 caracteres"),
  description: z.string()
    .max(500, "Descrição não pode ter mais de 500 caracteres")
    .optional(),
  avatarUrl: z.string().optional(),
});

type GuildFormValues = z.infer<typeof guildFormSchema>;

interface GuildCreationFormProps {
  onSuccess?: (guildId: string) => void;
  onCancel?: () => void;
}

const GuildCreationForm: React.FC<GuildCreationFormProps> = ({ onSuccess, onCancel }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isUploading, setIsUploading] = React.useState(false);
  
  // Initialize form with default values
  const form = useForm<GuildFormValues>({
    resolver: zodResolver(guildFormSchema),
    defaultValues: {
      name: "",
      description: "",
      avatarUrl: "",
    }
  });
  
  // Get form state
  const isSubmitting = form.formState.isSubmitting;
  
  // Handle avatar upload
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      setIsUploading(true);
      
      // Here you would upload the file to Supabase or another storage provider
      // For now, let's simulate an upload with a timeout and use a placeholder URL
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real implementation, you would get the URL from the storage provider
      const uploadedUrl = "/lovable-uploads/71073810-f05a-4adc-a860-636599324c62.png"; 
      
      form.setValue("avatarUrl", uploadedUrl);
      toast.success("Avatar enviado com sucesso!");
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast.error("Erro ao enviar avatar");
    } finally {
      setIsUploading(false);
    }
  };
  
  // Handle form submission
  const onSubmit = async (values: GuildFormValues) => {
    if (!user?.id) {
      toast.error("Você precisa estar logado para criar uma guilda");
      return;
    }
    
    try {
      const guildId = await GuildService.createGuild(user.id, {
        name: values.name,
        description: values.description,
        avatarUrl: values.avatarUrl
      });
      
      if (guildId) {
        toast.success("Guilda criada com sucesso!");
        
        if (onSuccess) {
          onSuccess(guildId);
        } else {
          navigate(`/guilds/${guildId}/leaderboard`);
        }
      }
    } catch (error) {
      console.error("Error creating guild:", error);
      toast.error("Erro ao criar guilda", {
        description: "Ocorreu um erro ao criar sua guilda. Tente novamente."
      });
    }
  };

  return (
    <div className="bg-midnight-card border border-divider rounded-lg p-5 shadow-subtle">
      <h2 className="text-xl font-orbitron font-bold mb-4 text-text-primary">Criar Nova Guilda</h2>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Guild Avatar */}
          <div className="flex flex-col items-center mb-6">
            <Avatar className="w-24 h-24 border-2 border-arcane-30 shadow-glow-subtle">
              <AvatarImage 
                src={form.watch("avatarUrl") || ""} 
                alt="Guild avatar" 
              />
              <AvatarFallback className="bg-midnight-elevated text-text-secondary">
                <Upload className="h-8 w-8" />
              </AvatarFallback>
            </Avatar>
            
            <div className="mt-3">
              <label 
                htmlFor="avatar-upload" 
                className={`inline-flex items-center px-3 py-1.5 cursor-pointer rounded-md text-sm font-sora 
                ${isUploading ? 'bg-arcane-15 text-arcane-60' : 'bg-midnight-elevated hover:bg-arcane-15 text-text-secondary hover:text-arcane'}
                border border-divider hover:border-arcane-30 transition-all duration-300`}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Enviar Avatar
                  </>
                )}
              </label>
              <input 
                id="avatar-upload" 
                type="file" 
                accept="image/*" 
                onChange={handleAvatarUpload}
                disabled={isUploading}
                className="hidden" 
              />
            </div>
          </div>
          
          {/* Guild Name */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-text-primary font-sora">Nome da Guilda</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Digite o nome da sua guilda"
                    className="bg-midnight-elevated border-divider text-text-primary"
                    {...field} 
                  />
                </FormControl>
                <FormMessage className="text-valor" />
              </FormItem>
            )}
          />
          
          {/* Guild Description */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-text-primary font-sora">Descrição</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Descreva o propósito da sua guilda"
                    className="bg-midnight-elevated border-divider text-text-primary resize-none h-24"
                    {...field} 
                    value={field.value || ''}
                  />
                </FormControl>
                <FormMessage className="text-valor" />
              </FormItem>
            )}
          />
          
          {/* Form Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            {onCancel && (
              <Button 
                type="button" 
                variant="outline" 
                onClick={onCancel}
                disabled={isSubmitting}
                className="font-sora bg-midnight-elevated border-divider hover:bg-arcane-15/20"
              >
                Cancelar
              </Button>
            )}
            
            <Button 
              type="submit" 
              variant="arcane" 
              disabled={isSubmitting}
              className="font-sora transition-all duration-300"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Criando...
                </>
              ) : (
                <>Criar Guilda</>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default GuildCreationForm;
