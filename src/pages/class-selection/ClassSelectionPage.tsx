
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useClass } from '@/contexts/ClassContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { motion } from 'framer-motion';
import { Toaster } from '@/components/ui/toaster';
import { pageVariants, itemVariants } from './animations';

import PageHeader from '@/components/ui/PageHeader';
import BottomNavBar from '@/components/navigation/BottomNavBar';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Separator } from '@/components/ui/separator';
import ClassStatusContent from './ClassStatusContent';
import ClassDisplayOptions from './ClassDisplayOptions';
import ClassSelectButtonContainer from './ClassSelectButtonContainer';

const ClassSelectionPage = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { user, profile } = useAuth();
  const { classes, userClass, isOnCooldown, cooldownText, loading, selectClass } = useClass();
  const [selectedClass, setSelectedClass] = React.useState<string | null>(userClass);
  const [isSelecting, setIsSelecting] = React.useState(false);
  const [focusedIndex, setFocusedIndex] = React.useState(0);
  
  React.useEffect(() => {
    // Set the selected class from context if available
    if (userClass && !selectedClass) {
      setSelectedClass(userClass);
    }
  }, [userClass, selectedClass]);
  
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
      return;
    }
    
    if (isOnCooldown && selectedClass !== userClass) {
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
  
  return (
    <div className="pb-20 min-h-screen bg-gradient-to-b from-midnight-deep via-midnight-base to-midnight-base">
      <ClassStatusContent 
        profile={profile}
        showBackButton={true}
      />
      
      <motion.div 
        className="px-4 py-2 mb-6"
        variants={pageVariants}
        initial="initial"
        animate="animate"
      >
        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" message="Carregando classes..." subMessage="Preparando bônus e habilidades" />
          </div>
        ) : (
          <ClassDisplayOptions
            isOnCooldown={isOnCooldown}
            cooldownText={cooldownText}
            classes={classes}
            selectedClass={selectedClass}
            userClass={userClass}
            focusedIndex={focusedIndex}
            onClassSelect={handleClassSelect}
            itemVariants={itemVariants}
          />
        )}
      </motion.div>
      
      <ClassSelectButtonContainer
        selectedClass={selectedClass}
        userClass={userClass}
        isSelecting={isSelecting}
        isOnCooldown={isOnCooldown}
        onSelectClass={handleSelectClass}
      />
      
      <BottomNavBar />
      <Toaster />
    </div>
  );
};

export default ClassSelectionPage;
