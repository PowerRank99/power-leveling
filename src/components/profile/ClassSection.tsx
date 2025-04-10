
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
    { description: 'Carregando bonificações...', value: '' }
  ];
  
  return (
    <Card className="mt-3 shadow-sm border-none hover:shadow-md transition-shadow dark:bg-card dark:border dark:border-arcane/20">
      <CardHeader className="px-4 py-3 flex flex-row justify-between items-center bg-gray-50 dark:bg-midnight/50 rounded-t-lg">
        <div className="flex items-center">
          <h3 className="font-cinzel font-bold text-lg text-gray-800 dark:text-white">Classe</h3>
          {isOnCooldown && (
            <span className="ml-2 text-xs bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded-full font-ibm-plex animate-pulse">
              {cooldownText}
            </span>
          )}
        </div>
        <Button 
          variant="ghost" 
          className="text-arcane flex items-center text-sm h-auto p-0 hover:bg-arcane/10 font-cinzel" 
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
