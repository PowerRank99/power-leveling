import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Camera, Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { ManualWorkoutService } from '@/services/workout/manual/ManualWorkoutService';

type ManualWorkoutFormProps = {
  onSuccess: () => void;
  onCancel: () => void;
};

const ManualWorkoutForm: React.FC<ManualWorkoutFormProps> = ({ onSuccess, onCancel }) => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [description, setDescription] = useState('');
  const [activityType, setActivityType] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [workoutDate, setWorkoutDate] = useState<string>(new Date().toISOString().slice(0, 10));
  
  const activityTypes = [
    { value: 'strength', label: 'Musculação' },
    { value: 'cardio', label: 'Cardio' },
    { value: 'running', label: 'Corrida' },
    { value: 'yoga', label: 'Yoga' },
    { value: 'sports', label: 'Esportes' },
    { value: 'bodyweight', label: 'Calistenia' },
    { value: 'flexibility', label: 'Flexibilidade' },
    { value: 'other', label: 'Outro' }
  ];
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Imagem muito grande', {
        description: 'O tamanho máximo permitido é 5MB'
      });
      return;
    }
    
    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Usuário não autenticado');
      return;
    }
    
    if (!imageFile) {
      toast.error('Foto obrigatória', {
        description: 'Por favor, adicione uma foto do seu treino'
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const fileName = `manual-workout-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('workout-photos')
        .upload(fileName, imageFile);
        
      if (uploadError) {
        throw new Error(`Erro ao fazer upload da imagem: ${uploadError.message}`);
      }
      
      const { data: publicUrlData } = supabase.storage
        .from('workout-photos')
        .getPublicUrl(fileName);
        
      if (!publicUrlData.publicUrl) {
        throw new Error('Erro ao obter URL pública da imagem');
      }
      
      const parsedDate = new Date(workoutDate);
      
      const result = await ManualWorkoutService.submitManualWorkout(
        user.id,
        publicUrlData.publicUrl,
        description,
        activityType,
        parsedDate
      );
      
      if (!result.success) {
        throw new Error(result.error || 'Erro ao registrar treino');
      }
      
      setDescription('');
      setActivityType('');
      setImageFile(null);
      setPreviewUrl(null);
      onSuccess();
      
    } catch (error: any) {
      console.error('Error submitting manual workout:', error);
      toast.error('Erro ao registrar treino', {
        description: error.message || 'Ocorreu um erro ao registrar seu treino'
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const clearImage = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setImageFile(null);
    setPreviewUrl(null);
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-orbitron font-bold text-text-primary mb-4">
        Registrar Treino Manualmente
      </h2>
      
      <div className="space-y-3">
        <div>
          <Label htmlFor="activity-type">Tipo de Atividade</Label>
          <Select value={activityType} onValueChange={setActivityType}>
            <SelectTrigger className="w-full bg-midnight-elevated border-arcane/30">
              <SelectValue placeholder="Escolha o tipo de atividade" />
            </SelectTrigger>
            <SelectContent className="bg-midnight-elevated border-arcane/30">
              {activityTypes.map(type => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="description">Descrição (opcional)</Label>
          <Textarea
            id="description"
            placeholder="Descreva seu treino..."
            className="bg-midnight-elevated border-arcane/30 min-h-[100px]"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        
        <div>
          <Label htmlFor="workout-date">Data do Treino</Label>
          <Input
            id="workout-date"
            type="date"
            className="bg-midnight-elevated border-arcane/30"
            value={workoutDate}
            onChange={(e) => setWorkoutDate(e.target.value)}
            max={new Date().toISOString().slice(0, 10)}
          />
          <p className="text-xs text-text-tertiary mt-1">
            *Limite de 24 horas atrás
          </p>
        </div>
        
        <div>
          <Label htmlFor="workout-photo">Foto do Treino (obrigatório)</Label>
          
          {previewUrl ? (
            <div className="relative mt-2 rounded-md overflow-hidden">
              <img 
                src={previewUrl} 
                alt="Preview" 
                className="w-full h-auto max-h-[200px] object-cover rounded-md"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 h-8 w-8 rounded-full bg-valor-crimson/90"
                onClick={clearImage}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div 
              className="border-2 border-dashed border-arcane/30 rounded-md p-8 mt-2 text-center"
              onClick={() => document.getElementById('workout-photo')?.click()}
            >
              <Camera className="mx-auto h-12 w-12 text-arcane/60 mb-2" />
              <p className="text-text-secondary text-sm">
                Clique para adicionar uma foto
              </p>
              <p className="text-text-tertiary text-xs mt-1">
                JPG, PNG ou GIF (máx. 5MB)
              </p>
            </div>
          )}
          
          <Input
            id="workout-photo"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageChange}
          />
        </div>
      </div>
      
      <div className="flex space-x-2 justify-end mt-4">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={isSubmitting}
          className="bg-midnight-elevated border-arcane/30 text-text-primary hover:bg-arcane/10"
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting || !imageFile}
          className="bg-arcane hover:bg-arcane/80"
        >
          {isSubmitting ? (
            <>
              <div className="mr-2 h-4 w-4 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
              Registrando...
            </>
          ) : (
            'Registrar Treino'
          )}
        </Button>
      </div>
    </form>
  );
};

export default ManualWorkoutForm;
