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
import ExerciseTypeSelector, { ExerciseType } from './ExerciseTypeSelector';
import { useIsMobile } from '@/hooks/use-mobile';

type ManualWorkoutFormProps = {
  onSuccess: () => void;
  onCancel: () => void;
};

const ManualWorkoutForm: React.FC<ManualWorkoutFormProps> = ({ onSuccess, onCancel }) => {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [description, setDescription] = useState('');
  const [selectedType, setSelectedType] = useState<ExerciseType | ''>('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
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
    
    if (!selectedType) {
      toast.error('Tipo de exercício obrigatório', {
        description: 'Por favor, selecione um tipo de exercício para o seu treino'
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Upload photo first
      const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(2)}`;
      console.log("Uploading photo with filename:", fileName);
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('workout-photos')
        .upload(fileName, imageFile, {
          cacheControl: '3600',
          upsert: false
        });
        
      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw new Error(`Erro ao fazer upload da imagem: ${uploadError.message}`);
      }
      
      console.log("Photo uploaded successfully:", uploadData);
      
      // Get public URL for the uploaded photo
      const { data: publicUrlData } = supabase.storage
        .from('workout-photos')
        .getPublicUrl(fileName);
        
      if (!publicUrlData?.publicUrl) {
        throw new Error('Erro ao obter URL pública da imagem');
      }
      
      // Use the workoutDate with noon time to avoid timezone issues
      const selectedDate = new Date(`${workoutDate}T12:00:00`);
      console.log("Submitting manual workout with date:", selectedDate);
      
      const result = await ManualWorkoutService.submitManualWorkout(
        user.id,
        publicUrlData.publicUrl,
        description,
        selectedType,
        selectedDate
      );
      
      if (!result.success) {
        throw new Error(result.error || 'Erro ao registrar treino');
      }
      
      toast.success('Treino registrado com sucesso!', {
        description: `Você ganhou ${result.data?.xp_awarded || 100} XP por este treino!`
      });
      
      // Reset form
      setDescription('');
      setSelectedType('');
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
    <div className={`h-full flex flex-col ${isMobile ? 'pb-16' : ''}`}>
      <h2 className="text-xl font-orbitron font-bold text-text-primary mb-4">
        Registrar Treino Manualmente
      </h2>
      
      <div className="flex-grow overflow-y-auto pr-1">
        <form id="manualWorkoutForm" onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3">
            <ExerciseTypeSelector 
              value={selectedType} 
              onChange={setSelectedType} 
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
        </form>
      </div>
      
      <div className={`${isMobile ? 'mt-4 border-t border-divider pt-4' : 'mt-4'}`}>
        <FormActions 
          formId="manualWorkoutForm"
          isSubmitting={isSubmitting} 
          isSubmitDisabled={!imageFile || !selectedType} 
          onCancel={onCancel} 
        />
      </div>
    </div>
  );
};

export default ManualWorkoutForm;
