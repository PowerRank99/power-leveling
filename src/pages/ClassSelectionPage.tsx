
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Dumbbell, Wind, Sparkles, Sword, Timer, Check } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import BottomNavBar from '@/components/navigation/BottomNavBar';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useClass } from '@/contexts/ClassContext';
import { Card, CardContent } from '@/components/ui/card';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  CarouselNext, 
  CarouselPrevious 
} from '@/components/ui/carousel';
import { ClassInfo } from '@/services/rpg/ClassService';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';
import useEmblaCarousel from 'embla-carousel-react';

const ClassSelectionPage = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const { classes, userClass, isOnCooldown, cooldownText, loading, selectClass } = useClass();
  const [selectedClass, setSelectedClass] = useState<string | null>(userClass);
  const [isSelecting, setIsSelecting] = useState(false);
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: 'center',
    skipSnaps: false
  });
  const [focusedIndex, setFocusedIndex] = useState(0);
  
  // When the carousel scrolls, update the focused index
  useEffect(() => {
    if (!emblaApi) return;
    
    const onSelect = () => {
      setFocusedIndex(emblaApi.selectedScrollSnap());
      // Also update the selected class based on the carousel position
      const currentClass = classes[emblaApi.selectedScrollSnap()];
      if (currentClass) {
        setSelectedClass(currentClass.class_name);
      }
    };
    
    emblaApi.on('select', onSelect);
    // Call once to initialize
    onSelect();
    
    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi, classes]);
  
  // Select specific class and scroll carousel to it
  useEffect(() => {
    if (!emblaApi || !classes.length || !selectedClass) return;
    
    const classIndex = classes.findIndex(cls => cls.class_name === selectedClass);
    if (classIndex !== -1 && classIndex !== focusedIndex) {
      emblaApi.scrollTo(classIndex);
    }
  }, [emblaApi, classes, selectedClass, focusedIndex]);
  
  // Initialize: if user has a class, scroll to it
  useEffect(() => {
    if (!emblaApi || !classes.length || !userClass) return;
    
    const classIndex = classes.findIndex(cls => cls.class_name === userClass);
    if (classIndex !== -1) {
      emblaApi.scrollTo(classIndex);
    }
  }, [emblaApi, classes, userClass]);
  
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
  
  // Function to get the appropriate icon for a class
  const getClassIcon = (iconName: string) => {
    switch (iconName) {
      case 'Sword': return <Sword className="h-6 w-6" />;
      case 'Dumbbell': return <Dumbbell className="h-6 w-6" />;
      case 'Wind': return <Wind className="h-6 w-6" />;
      case 'Sparkles': return <Sparkles className="h-6 w-6" />;
      case 'Shield': return <Shield className="h-6 w-6" />;
      default: return <Shield className="h-6 w-6" />;
    }
  };
  
  // Get class avatar image
  const getClassAvatarImage = (className: string) => {
    // Default images for each class
    const avatarMap: Record<string, string> = {
      'Guerreiro': '/lovable-uploads/71073810-f05a-4adc-a860-636599324c62.png',
      'Monge': '/lovable-uploads/38b244e2-15ad-44b7-8d2d-48eb9e4227a8.png',
      'Ninja': '/lovable-uploads/f018410c-9031-4726-b654-ec51c1bbd72b.png',
      'Bruxo': '/lovable-uploads/174ea5f4-db2b-4392-a948-5ec67969f043.png',
      'Paladino': '/lovable-uploads/7164b50e-55bc-43ae-9127-1c693ab31e70.png'
    };
    
    return avatarMap[className] || '/lovable-uploads/d84a92f5-828a-4ff9-a21b-3233e15d4276.png';
  };
  
  // Render a class card
  const renderClassCard = (classInfo: ClassInfo, index: number) => {
    const isCurrentClass = userClass === classInfo.class_name;
    const isSelected = selectedClass === classInfo.class_name;
    const isFocused = index === focusedIndex;
    
    return (
      <div 
        key={classInfo.class_name}
        className={`h-full rounded-xl overflow-hidden shadow-md transition-all duration-300 transform 
          ${isSelected ? 'ring-4 ring-fitblue ring-offset-2' : ''}
          ${isFocused ? 'scale-100 opacity-100 z-10' : 'scale-90 opacity-70'}
          ${isOnCooldown && !isCurrentClass ? 'opacity-60' : ''}
        `}
        onClick={() => {
          if (!isOnCooldown || isCurrentClass) {
            setSelectedClass(classInfo.class_name);
            if (emblaApi) emblaApi.scrollTo(index);
          }
        }}
      >
        <div className={`bg-gradient-to-br ${classInfo.color} text-white p-5 h-full flex flex-col`}>
          <div className="flex items-start mb-3">
            <div className="relative">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center mr-3 shadow-inner overflow-hidden">
                {/* Show class avatar image */}
                <img 
                  src={getClassAvatarImage(classInfo.class_name)} 
                  alt={classInfo.class_name}
                  className="w-full h-full object-cover object-center"
                />
              </div>
              <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center shadow-inner">
                {getClassIcon(classInfo.icon)}
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center">
                <h3 className="font-bold text-2xl">{classInfo.class_name}</h3>
                {isCurrentClass && (
                  <span className="ml-2 bg-white/30 text-white text-xs px-2 py-0.5 rounded-full flex items-center">
                    <Check className="w-3 h-3 mr-1" /> Atual
                  </span>
                )}
              </div>
              <p className="text-white/90">{classInfo.description}</p>
            </div>
          </div>
          
          <div className="flex-1">
            <p className="text-sm text-white/80 mb-2 flex items-center">
              <span className="bg-white/20 rounded-full p-1 mr-2">🔍</span> 
              Bônus Passivo
            </p>
            
            <div className="space-y-3 mb-3">
              {classInfo.bonuses.map((bonus, idx) => (
                <div 
                  key={idx} 
                  className="bg-white/10 backdrop-blur-sm rounded-lg p-3 shadow-inner hover:bg-white/15 transition-colors"
                >
                  <div className="flex items-center">
                    <span className="text-lg font-bold mr-2 whitespace-nowrap">
                      {`+${Math.round(bonus.bonus_value * 100)}%`}
                    </span>
                    <p className="text-sm">{bonus.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="pb-20 min-h-screen bg-gray-50">
      <PageHeader 
        title="Seleção de Classe"
        showBackButton={true}
        rightContent={null}
      />
      
      <div className="px-4 mb-6">
        <Card className="bg-white border-none shadow-sm mb-6">
          <CardContent className="p-4">
            <h2 className="text-lg font-bold text-gray-800 mb-2">Escolha sua Classe</h2>
            <p className="text-sm text-gray-600 mb-1">
              Cada classe oferece bônus de XP para diferentes tipos de exercícios.
            </p>
            <p className="text-xs text-gray-500">
              Após escolher uma classe, você precisará esperar 15 dias para poder trocar novamente.
            </p>
          </CardContent>
        </Card>
        
        {isOnCooldown && (
          <div className="mb-6 bg-amber-50 p-4 rounded-lg border border-amber-200 flex items-center gap-3 animate-pulse">
            <Timer className="h-5 w-5 text-amber-500 flex-shrink-0" />
            <div>
              <p className="text-amber-800 font-medium">Mudança de classe em cooldown</p>
              <p className="text-amber-600 text-sm">Próxima mudança disponível em: {cooldownText}</p>
            </div>
          </div>
        )}
        
        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" message="Carregando classes..." subMessage="Preparando bônus e habilidades" />
          </div>
        ) : (
          <>
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Classes Disponíveis</h3>
            
            {/* Enhanced Carousel with Focus Effect */}
            <div className="relative mb-8 mx-auto max-w-xl">
              <div className="overflow-hidden" ref={emblaRef}>
                <div className="flex py-8">
                  {classes.map((classInfo, index) => (
                    <div key={classInfo.class_name} className="flex-[0_0_100%] min-w-0 pl-4 md:flex-[0_0_80%]">
                      {renderClassCard(classInfo, index)}
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-center mt-4">
                <div className="flex gap-2">
                  {classes.map((classInfo, index) => (
                    <button
                      key={`dot-${classInfo.class_name}`}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        index === focusedIndex ? 'bg-fitblue w-4' : 'bg-gray-300'
                      }`}
                      onClick={() => {
                        if (emblaApi) emblaApi.scrollTo(index);
                      }}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
              
              {/* Large Screen Class Grid */}
              <div className="hidden lg:grid lg:grid-cols-3 gap-6 mb-8 mt-12">
                {classes.map((classInfo, index) => (
                  <div key={`grid-${classInfo.class_name}`} className="h-full">
                    {renderClassCard(classInfo, index)}
                  </div>
                ))}
              </div>
            </div>
            
            <Button
              onClick={handleSelectClass}
              disabled={!selectedClass || isSelecting || (isOnCooldown && selectedClass !== userClass)}
              className="w-full py-6 text-lg"
            >
              {isSelecting ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2 py-0" /> 
                  Selecionando...
                </>
              ) : userClass === selectedClass ? (
                'Manter Classe Atual'
              ) : (
                'Confirmar Seleção'
              )}
            </Button>
          </>
        )}
      </div>
      
      <BottomNavBar />
    </div>
  );
};

export default ClassSelectionPage;
