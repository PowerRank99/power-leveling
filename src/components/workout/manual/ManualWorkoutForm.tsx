
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { ManualWorkoutService } from '@/services/workout/manual/ManualWorkoutService';
import PhotoUploader from './PhotoUploader';
import DateSelector from './DateSelector';
import FormActions from './FormActions';
import ExerciseSelector from './ExerciseSelector';
import { Exercise } from '@/components/workout/types/Exercise';

type ManualWorkoutFormProps = {
  onSuccess: () => void;
  onCancel: () => void;
};

const ManualWorkoutForm: React.FC<ManualWorkoutFormProps> = ({ onSuccess, onCancel }) => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [description, setDescription] = useState('');
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  // Set default date to current date
  const today = new Date().toISOString().slice(0, 10);
  const [workoutDate, setWorkoutDate] = useState<string>(today);
  
  const handleImageChange = (file: File | null) => {
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setImageFile(null);
      setPreviewUrl(null);
    }
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
    
    if (!selectedExercise) {
      toast.error('Exercício obrigatório', {
        description: 'Por favor, selecione um exercício para o seu treino'
      });
      return;
    }
    
    // Validate date is not in the future
    const selectedDate = new Date(workoutDate);
    const now = new Date();
    if (selectedDate > now) {
      toast.error('Data inválida', {
        description: 'Não é possível registrar treinos futuros'
      });
      return;
    }
    
    // Validate date is not more than 24 hours in the past
    const timeDiff = now.getTime() - selectedDate.getTime();
    const hoursDiff = timeDiff / (1000 * 3600);
    
    if (hoursDiff > 24) {
      toast.error('Data inválida', {
        description: 'Não é possível registrar treinos com mais de 24 horas'
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
        selectedExercise.id,
        selectedExercise.name,
        selectedExercise.category,
        parsedDate
      );
      
      if (!result.success) {
        throw new Error(result.error || 'Erro ao registrar treino');
      }
      
      setDescription('');
      setSelectedExercise(null);
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
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4 pb-16 md:pb-4">
      <h2 className="text-xl font-orbitron font-bold text-text-primary mb-4">
        Registrar Treino Manualmente
      </h2>
      
      <div className="space-y-3">
        <ExerciseSelector 
          selectedExercise={selectedExercise} 
          onExerciseSelect={setSelectedExercise} 
        />
        
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
        
        <DateSelector 
          value={workoutDate} 
          onChange={setWorkoutDate} 
        />
        
        <PhotoUploader 
          previewUrl={previewUrl} 
          onImageChange={handleImageChange} 
        />
      </div>
      
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-midnight-base border-t border-divider md:static md:p-0 md:border-0 md:bg-transparent">
        <FormActions 
          isSubmitting={isSubmitting} 
          isSubmitDisabled={!imageFile || !selectedExercise} 
          onCancel={onCancel} 
        />
      </div>
    </form>
  );
};

export default ManualWorkoutForm;
