
import React from 'react';
import { ChevronRight, Sparkles } from 'lucide-react';
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
    <Card className="mt-3 shadow-lg border-none dark:bg-midnight-light/50 dark:border dark:border-arcane/20 rpg-card card-glow hover:shadow-glow-lg transition-shadow">
      <CardHeader className="px-4 py-3 flex flex-row justify-between items-center bg-midnight-light/50 dark:bg-midnight/80 rounded-t-lg border-b border-arcane/10">
        <div className="flex items-center">
          <h3 className="font-orbitron font-bold text-lg text-gray-800 dark:text-ghostwhite flex items-center">
            <Sparkles className="w-4 h-4 mr-2 text-arcane" /> Classe
          </h3>
          {isOnCooldown && (
            <span className="ml-2 text-xs bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded-full font-space-grotesk animate-pulse">
              {cooldownText}
            </span>
          )}
        </div>
        <Button 
          variant="ghost" 
          className="text-arcane flex items-center text-sm h-auto p-0 hover:bg-arcane/10 font-orbitron" 
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
