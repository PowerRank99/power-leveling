
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Dumbbell, Wind, Sparkles, Sword, ArrowLeft, Timer, Check } from 'lucide-react';
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

const ClassSelectionPage = () => {
  const navigate = useNavigate();
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
  
  // Render a class card
  const renderClassCard = (classInfo: ClassInfo) => {
    const isCurrentClass = userClass === classInfo.class_name;
    const isSelected = selectedClass === classInfo.class_name;
    
    return (
      <div 
        key={classInfo.class_name}
        className={`h-full rounded-xl overflow-hidden shadow-sm transition-all 
          ${isSelected ? 'ring-2 ring-fitblue ring-offset-2' : ''}
          ${isOnCooldown && !isCurrentClass ? 'opacity-60' : ''}
        `}
        onClick={() => {
          if (!isOnCooldown || isCurrentClass) {
            setSelectedClass(classInfo.class_name);
          }
        }}
      >
        <div className={`bg-gradient-to-r ${classInfo.color} text-white p-4 h-full flex flex-col`}>
          <div className="flex items-start mb-2">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center mr-3 shadow-inner">
              {getClassIcon(classInfo.icon)}
            </div>
            <div className="flex-1">
              <div className="flex items-center">
                <h3 className="font-bold text-xl">{classInfo.class_name}</h3>
                {isCurrentClass && (
                  <span className="ml-2 bg-white/30 text-white text-xs px-2 py-0.5 rounded-full flex items-center">
                    <Check className="w-3 h-3 mr-1" /> Atual
                  </span>
                )}
              </div>
              <p className="text-blue-100">{classInfo.description}</p>
            </div>
          </div>
          
          <div className="flex-1">
            <p className="text-sm text-blue-200 mb-2 flex items-center">
              <span className="bg-white/20 rounded-full p-1 mr-2">🔍</span> 
              Bônus Passivo
            </p>
            
            <div className="space-y-2 mb-3">
              {classInfo.bonuses.map((bonus, idx) => (
                <div 
                  key={idx} 
                  className="bg-white/10 backdrop-blur-sm rounded-lg p-3 shadow-inner"
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
          <div className="mb-6 bg-amber-50 p-4 rounded-lg border border-amber-200 flex items-center gap-3">
            <Timer className="h-5 w-5 text-amber-500 flex-shrink-0" />
            <div>
              <p className="text-amber-800 font-medium">Mudança de classe em cooldown</p>
              <p className="text-amber-600 text-sm">Próxima mudança disponível em: {cooldownText}</p>
            </div>
          </div>
        )}
        
        {loading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <>
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Classes Disponíveis</h3>
            
            {/* Desktop and Tablet View */}
            <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {classes.map(classInfo => (
                <div key={classInfo.class_name} className="h-full">
                  {renderClassCard(classInfo)}
                </div>
              ))}
            </div>
            
            {/* Mobile View - Carousel */}
            <div className="md:hidden mb-6">
              <Carousel className="w-full">
                <CarouselContent className="-ml-2">
                  {classes.map(classInfo => (
                    <CarouselItem key={classInfo.class_name} className="pl-2 basis-full">
                      {renderClassCard(classInfo)}
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <div className="flex justify-center mt-4">
                  <CarouselPrevious className="static relative transform-none translate-y-0 mr-2" />
                  <CarouselNext className="static relative transform-none translate-y-0" />
                </div>
              </Carousel>
            </div>
            
            <Button
              onClick={handleSelectClass}
              disabled={!selectedClass || isSelecting || (isOnCooldown && selectedClass !== userClass)}
              className="w-full"
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
