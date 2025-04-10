
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
  
  // Play a subtle feedback sound when switching classes
  const playSelectSound = () => {
    try {
      const audio = new Audio('/sounds/class-select.mp3');
      audio.volume = 0.2;
      audio.play();
    } catch (error) {
      // Silent fail if audio not available or browser blocks autoplay
    }
  };
  
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
    
    try {
      // Play confirmation sound
      const audio = new Audio('/sounds/class-confirm.mp3');
      audio.volume = 0.3;
      audio.play();
    } catch (error) {
      // Silent fail if audio not available
    }
    
    setIsSelecting(true);
    const success = await selectClass(selectedClass);
    setIsSelecting(false);
    
    if (success) {
      toast.success(`Você agora é um ${selectedClass}!`, {
        description: "Os bônus da sua nova classe já estão ativos"
      });
      
      // Add vibration feedback if available
      if (navigator.vibrate) {
        navigator.vibrate(200);
      }
      
      navigate('/perfil');
    }
  };
  
  const handleClassSelect = (className: string, index?: number) => {
    if (className !== selectedClass) {
      setSelectedClass(className);
      playSelectSound();
      
      // Add subtle vibration if available
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
    }
    
    if (index !== undefined) {
      setFocusedIndex(index);
    }
  };
  
  // Animation variants
  const pageVariants = {
    initial: { opacity: 0 },
    animate: { 
      opacity: 1,
      transition: { 
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.4 }
    }
  };
  
  return (
    <div className="pb-20 min-h-screen bg-gradient-to-b from-midnight-deep via-midnight-base to-midnight-base">
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
        variants={pageVariants}
        initial="initial"
        animate="animate"
      >
        <motion.div variants={itemVariants}>
          <ClassInstructionCard />
        </motion.div>
        
        {isOnCooldown && (
          <motion.div variants={itemVariants}>
            <ClassCooldownNotice 
              isOnCooldown={isOnCooldown} 
              cooldownText={cooldownText} 
            />
          </motion.div>
        )}
        
        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" message="Carregando classes..." subMessage="Preparando bônus e habilidades" />
          </div>
        ) : (
          <>
            <motion.div variants={itemVariants} className="mb-4">
              <h3 className="text-lg font-semibold mb-2 text-text-primary font-orbitron tracking-wide">Classes Disponíveis</h3>
              <Separator className="bg-divider opacity-30" />
            </motion.div>
            
            <motion.div variants={itemVariants} className="premium-card p-4 mb-6 bg-midnight-elevated/80 backdrop-blur-md border border-white/10 rounded-xl shadow-elevated">
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
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <ClassSelectButton
                selectedClass={selectedClass}
                userClass={userClass}
                isSelecting={isSelecting}
                isOnCooldown={isOnCooldown}
                onClick={handleSelectClass}
              />
            </motion.div>
          </>
        )}
      </motion.div>
      
      <BottomNavBar />
      <Toaster />
    </div>
  );
};

export default ClassSelectionPage;
