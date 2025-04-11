
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Camera, X } from 'lucide-react';
import { toast } from 'sonner';

interface PhotoUploaderProps {
  previewUrl: string | null;
  onImageChange: (file: File | null) => void;
}

const PhotoUploader: React.FC<PhotoUploaderProps> = ({ previewUrl, onImageChange }) => {
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Imagem muito grande', {
        description: 'O tamanho máximo permitido é 5MB'
      });
      return;
    }
    
    onImageChange(file);
  };
  
  const clearImage = () => {
    onImageChange(null);
  };

  return (
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
  );
};

export default PhotoUploader;
