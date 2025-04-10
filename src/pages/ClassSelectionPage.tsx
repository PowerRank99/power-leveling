
import React, { useState, useEffect } from 'react';
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
import { motion } from 'framer-motion';
import { Separator } from '@/components/ui/separator';
import ClassDesktopGrid from '@/components/class/ClassDesktopGrid';
import { Toaster } from '@/components/ui/toaster';
import { Trophy } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const ClassSelectionPage = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { user, profile } = useAuth();
  const { classes, userClass, isOnCooldown, cooldownText, loading, selectClass } = useClass();
  const [selectedClass, setSelectedClass] = useState<string | null>(userClass);
  const [isSelecting, setIsSelecting] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(0);
  
  useEffect(() => {
    // Set the selected class from context if available
    if (userClass && !selectedClass) {
      setSelectedClass(userClass);
    }
  }, [userClass]);
  
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
      toast.success(`Você agora é um ${selectedClass}!`, {
        description: "Os bônus da sua nova classe já estão ativos"
      });
      navigate('/perfil');
    }
  };
  
  const handleClassSelect = (className: string, index?: number) => {
    setSelectedClass(className);
    if (index !== undefined) {
      setFocusedIndex(index);
    }
  };
  
  return (
    <div className="pb-20 min-h-screen bg-midnight-base">
      <PageHeader 
        title="Seleção de Classe"
        showBackButton={true}
        rightContent={
          profile?.level ? (
            <Badge variant="level" className="flex items-center gap-1">
              <Trophy size={14} className="text-arcane" />
              <span>Nível {profile.level}</span>
            </Badge>
          ) : null
        }
      />
      
      <motion.div 
        className="px-4 py-2 mb-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <ClassInstructionCard />
        
        {isOnCooldown && (
          <ClassCooldownNotice 
            isOnCooldown={isOnCooldown} 
            cooldownText={cooldownText} 
          />
        )}
        
        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" message="Carregando classes..." subMessage="Preparando bônus e habilidades" />
          </div>
        ) : (
          <>
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2 text-text-primary font-orbitron tracking-wide">Classes Disponíveis</h3>
              <Separator className="bg-divider opacity-30" />
            </div>
            
            <div className="premium-card p-4 mb-6 shadow-elevated">
              {/* Mobile view: Carousel */}
              <div className="block lg:hidden">
                <ClassCarousel
                  classes={classes}
                  selectedClass={selectedClass}
                  userClass={userClass}
                  isOnCooldown={isOnCooldown}
                  onClassSelect={handleClassSelect}
                />
              </div>
              
              {/* Desktop view: Grid */}
              <ClassDesktopGrid
                classes={classes}
                selectedClass={selectedClass}
                userClass={userClass}
                isOnCooldown={isOnCooldown}
                focusedIndex={focusedIndex}
                onClassSelect={handleClassSelect}
              />
            </div>
            
            <ClassSelectButton
              selectedClass={selectedClass}
              userClass={userClass}
              isSelecting={isSelecting}
              isOnCooldown={isOnCooldown}
              onClick={handleSelectClass}
            />
          </>
        )}
      </motion.div>
      
      <BottomNavBar />
      <Toaster />
    </div>
  );
};

export default ClassSelectionPage;
