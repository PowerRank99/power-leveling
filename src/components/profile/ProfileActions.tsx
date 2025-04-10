
import React from 'react';
import { Edit3, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface ProfileActionsProps {
  onSignOut: () => Promise<void>;
}

const ProfileActions: React.FC<ProfileActionsProps> = ({ onSignOut }) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      await onSignOut();
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado da sua conta.",
      });
      navigate('/auth');
    } catch (error: any) {
      toast({
        title: "Erro ao sair",
        description: error.message || "Não foi possível fazer logout.",
        variant: "destructive",
      });
    }
  };

  const handleEditProfile = () => {
    navigate('/perfil/editar');
  };

  return (
    <div className="flex gap-2">
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={handleEditProfile}
        title="Editar perfil"
        className="hover:bg-arcane-15 text-arcane hover:text-arcane"
      >
        <Edit3 className="h-5 w-5" />
      </Button>
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={handleSignOut}
        title="Sair da conta"
        className="hover:bg-valor-15 text-valor hover:text-valor"
      >
        <LogOut className="h-5 w-5" />
      </Button>
    </div>
  );
};

export default ProfileActions;
