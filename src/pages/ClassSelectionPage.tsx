
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Dumbbell, Wind, Sparkles, Sword, ArrowLeft, Timer } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import BottomNavBar from '@/components/navigation/BottomNavBar';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useClass } from '@/contexts/ClassContext';
import { Card, CardContent } from '@/components/ui/card';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const ClassSelectionPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { classes, userClass, isOnCooldown, cooldownText, loading, selectClass } = useClass();
  
  const handleSelectClass = async (className: string) => {
    if (!user) return;
    
    const success = await selectClass(className);
    if (success) {
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
  
  return (
    <div className="pb-20 min-h-screen bg-gray-50">
      <PageHeader 
        title="Seleção de Classe"
        showBackButton={true}
        rightContent={
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
        }
      />
      
      <div className="px-4 mb-4">
        {isOnCooldown && (
          <div className="mb-4 bg-amber-50 p-4 rounded-lg border border-amber-200 flex items-center gap-3">
            <Timer className="h-5 w-5 text-amber-500 flex-shrink-0" />
            <div>
              <p className="text-amber-800 font-medium">Mudança de classe em cooldown</p>
              <p className="text-amber-600 text-sm">Próxima mudança disponível em: {cooldownText}</p>
            </div>
          </div>
        )}
        
        <Card className="bg-white border-none shadow-sm mb-4">
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
        
        {loading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <div className="space-y-4">
            {classes.map((classInfo) => (
              <div 
                key={classInfo.class_name}
                className={`rounded-xl overflow-hidden shadow-sm transition-all ${
                  userClass === classInfo.class_name ? 'ring-2 ring-fitblue ring-offset-2' : ''
                }`}
              >
                <div className={`bg-gradient-to-r ${classInfo.color} text-white p-4`}>
                  <div className="flex items-start">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center mr-3 shadow-inner">
                      {getClassIcon(classInfo.icon)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-xl">{classInfo.class_name}</h3>
                      <p className="text-blue-100">{classInfo.description}</p>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <p className="text-sm text-blue-200 mb-2 flex items-center">
                      <span className="bg-white/20 rounded-full p-1 mr-2">🔍</span> 
                      Bônus Passivo
                    </p>
                    
                    {classInfo.bonuses.map((bonus, idx) => (
                      <div 
                        key={idx} 
                        className="mb-2 bg-white/10 backdrop-blur-sm rounded-lg p-3 shadow-inner"
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
                  
                  <Button
                    className="mt-3 w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm"
                    disabled={isOnCooldown && userClass !== classInfo.class_name}
                    onClick={() => handleSelectClass(classInfo.class_name)}
                  >
                    {userClass === classInfo.class_name
                      ? 'Classe Atual'
                      : 'Selecionar Classe'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <BottomNavBar />
    </div>
  );
};

export default ClassSelectionPage;
