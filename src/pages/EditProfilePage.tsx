
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '@/components/ui/PageHeader';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Camera } from 'lucide-react';

const EditProfilePage = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  
  useEffect(() => {
    if (profile) {
      setName(profile.name || '');
      setBio(profile.bio || '');
      setAvatarUrl(profile.avatar_url);
    }
  }, [profile]);
  
  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    try {
      setLoading(true);
      
      const updates = {
        id: user.id,
        name,
        bio,
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      };
      
      const { error } = await (supabase as any)
        .from('profiles')
        .upsert(updates);
        
      if (error) throw error;
      
      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram salvas com sucesso.",
      });
      
      navigate('/perfil');
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar perfil",
        description: error.message || "Não foi possível salvar suas informações.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) {
      return;
    }
    
    try {
      setUploading(true);
      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `${user!.id}-${Math.random()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);
        
      if (uploadError) throw uploadError;
      
      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);
        
      setAvatarUrl(data.publicUrl);
      
      toast({
        title: "Avatar atualizado",
        description: "Sua foto de perfil foi atualizada com sucesso.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao fazer upload",
        description: error.message || "Não foi possível fazer upload da imagem.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };
  
  return (
    <div className="min-h-screen pb-20 bg-midnight-base">
      <PageHeader title="Editar Perfil" showBackButton={true} />
      
      <div className="p-4">
        <div className="premium-card p-4 shadow-subtle">
          <form onSubmit={updateProfile}>
            <div className="flex flex-col items-center mb-6">
              <div className="w-24 h-24 rounded-lg overflow-hidden mb-2 relative">
                <img 
                  src={avatarUrl || "/lovable-uploads/c6066df0-70c1-48cf-b017-126e8f7e850a.png"} 
                  alt="Avatar" 
                  className="w-full h-full object-cover"
                />
                
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <label 
                    htmlFor="avatar-upload" 
                    className="cursor-pointer text-text-primary flex flex-col items-center"
                  >
                    <Camera size={20} />
                    <span className="text-xs mt-1 font-sora">Alterar</span>
                  </label>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={uploadAvatar}
                    className="hidden"
                    disabled={uploading}
                  />
                </div>
              </div>
              {uploading && <p className="text-sm text-text-tertiary font-sora">Enviando...</p>}
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-text-primary font-sora">Nome</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu nome"
                  className="bg-midnight-elevated border-divider text-text-primary placeholder:text-text-tertiary font-sora mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="bio" className="text-text-primary font-sora">Sobre mim</Label>
                <Input
                  id="bio"
                  type="text"
                  value={bio || ''}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Uma breve descrição sobre você"
                  className="bg-midnight-elevated border-divider text-text-primary placeholder:text-text-tertiary font-sora mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="email" className="text-text-primary font-sora">Email</Label>
                <Input
                  id="email"
                  type="text"
                  value={user?.email || ''}
                  disabled
                  className="bg-midnight-card border-divider text-text-tertiary font-sora mt-1"
                />
                <p className="text-xs text-text-tertiary font-sora mt-1">O email não pode ser alterado</p>
              </div>
              
              <div className="pt-4">
                <Button 
                  type="submit" 
                  className="w-full bg-arcane hover:bg-arcane-60 text-text-primary shadow-glow-subtle font-sora"
                  disabled={loading}
                >
                  {loading ? 'Salvando...' : 'Salvar alterações'}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProfilePage;
