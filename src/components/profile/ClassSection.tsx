
import React from 'react';
import { ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import ClassCard from '@/components/profile/ClassCard';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useClass } from '@/contexts/ClassContext';
import { ClassService } from '@/services/rpg/ClassService';

interface ClassSectionProps {
  className: string;
  classDescription?: string;
  icon?: React.ReactNode;
  bonuses?: { description: string; value: string }[];
}

const ClassSection: React.FC<ClassSectionProps> = ({
  className,
  classDescription,
  icon,
  bonuses = []
}) => {
  const navigate = useNavigate();
  const { isOnCooldown, cooldownText, userClass } = useClass();
  
  // Use the class from context if available, otherwise use the prop
  const actualClassName = userClass || className;
  const actualDescription = classDescription || ClassService.getClassDescription(actualClassName);
  
  // Format bonuses for display
  const displayBonuses = bonuses.length > 0 ? bonuses : [
    { description: <span className="loading-text">Carregando bonificações...</span>, value: '' }
  ];
  
  // Class flavor text based on class
  const getClassFlavorText = (className: string) => {
    const flavorTextMap: Record<string, string> = {
      'Guerreiro': 'Especialista em força bruta. Domina os compostos.',
      'Monge': 'Mestre do próprio corpo. Flui como água, forte como pedra.',
      'Ninja': 'Veloz e eficiente. Treinos curtos, resultados extraordinários.',
      'Bruxo': 'Manipula energias sutis. Domina flexibilidade e recuperação.',
      'Paladino': 'Defensor da consistência. Resiste onde outros desistem.'
    };
    
    return flavorTextMap[className] || 'Escolha uma classe para iniciar sua jornada.';
  };
  
  const getHeaderAccentColor = () => {
    switch(actualClassName?.toLowerCase()) {
      case 'guerreiro': return 'border-red-500/30';
      case 'monge': return 'border-amber-500/30';
      case 'ninja': return 'border-emerald-500/30';
      case 'bruxo': return 'border-blue-500/30';
      case 'paladino': return 'border-yellow-500/30';
      default: return 'border-divider/30';
    }
  };
  
  const getHeaderTextColor = () => {
    switch(actualClassName?.toLowerCase()) {
      case 'guerreiro': return 'text-red-500';
      case 'monge': return 'text-amber-500';
      case 'ninja': return 'text-emerald-500';
      case 'bruxo': return 'text-blue-500';
      case 'paladino': return 'text-yellow-500';
      default: return 'text-text-primary';
    }
  };
  
  return (
    <Card className="mt-3 premium-card hover:premium-card-elevated transition-all duration-300">
      <CardHeader className={`px-4 py-3 flex flex-row justify-between items-center bg-midnight-card bg-opacity-50 backdrop-blur-sm rounded-t-lg border-b ${getHeaderAccentColor()}`}>
        <div className="flex items-center">
          <h3 className={`orbitron-text font-bold text-lg ${getHeaderTextColor()}`}>Classe</h3>
        </div>
        <Button 
          variant="ghost" 
          className="text-arcane flex items-center text-sm h-auto p-0 hover:bg-arcane-15 hover:text-arcane font-sora" 
          onClick={() => navigate('/classes')}
        >
          {actualClassName ? 'Trocar Classe' : 'Selecionar Classe'} <ChevronRight className="w-4 h-4" />
        </Button>
      </CardHeader>
      
      <CardContent className="p-4 pt-0">
        <ClassCard 
          className={actualClassName || 'Sem Classe'}
          description={actualDescription}
          icon={icon}
          bonuses={displayBonuses}
          showAvatar={true}
        />
      </CardContent>
    </Card>
  );
};

export default ClassSection;
