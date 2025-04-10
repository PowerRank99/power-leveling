
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '@/components/ui/PageHeader';
import BottomNavBar from '@/components/navigation/BottomNavBar';
import { useAuth } from '@/hooks/useAuth';
import { useClass } from '@/contexts/ClassContext';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';
import ClassCarousel from '@/components/class/ClassCarousel';
import ClassCooldownNotice from '@/components/class/ClassCooldownNotice';
import ClassInstructionCard from '@/components/class/ClassInstructionCard';
import ClassSelectButton from '@/components/class/ClassSelectButton';

const ClassSelectionPage = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const { classes, userClass, isOnCooldown, cooldownText, loading, selectClass } = useClass();
  const [selectedClass, setSelectedClass] = useState<string | null>(userClass);
  const [isSelecting, setIsSelecting] = useState(false);
  
  const handleSelectClass = async () => {
    if (!user || !selectedClass) return;
    
    if (selectedClass === userClass) {
      toast.info("Essa já é sua classe atual");
      return;
    }
    
    if (isOnCooldown && selectedClass !== userClass) {
      toast.error("Mudança de classe em cooldown", {
        description: cooldownText
      });
      return;
    }
    
    setIsSelecting(true);
    const success = await selectClass(selectedClass);
    setIsSelecting(false);
    
    if (success) {
      toast.success(`Você agora é um ${selectedClass}!`);
      navigate('/perfil');
    }
  };
  
  const handleClassSelect = (className: string) => {
    setSelectedClass(className);
  };
  
  return (
    <div className="pb-20 min-h-screen bg-gradient-to-b from-midnight to-midnight-100">
      <PageHeader 
        title="Seleção de Classe"
        showBackButton={true}
        rightContent={null}
      />
      
      <div className="px-4 mb-6">
        <ClassInstructionCard />
        
        <ClassCooldownNotice 
          isOnCooldown={isOnCooldown} 
          cooldownText={cooldownText} 
        />
        
        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" message="Carregando classes..." subMessage="Preparando bônus e habilidades" />
          </div>
        ) : (
          <>
            <h3 className="text-xl font-display mb-4 text-arcane-100 tracking-wide">Classes Disponíveis</h3>
            
            <ClassCarousel
              classes={classes}
              selectedClass={selectedClass}
              userClass={userClass}
              isOnCooldown={isOnCooldown}
              onClassSelect={handleClassSelect}
            />
            
            <ClassSelectButton
              selectedClass={selectedClass}
              userClass={userClass}
              isSelecting={isSelecting}
              isOnCooldown={isOnCooldown}
              onClick={handleSelectClass}
            />
          </>
        )}
      </div>
      
      <BottomNavBar />
    </div>
  );
};

export default ClassSelectionPage;
