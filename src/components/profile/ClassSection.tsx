
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
    <Card className="mt-3 shadow-md border-none dark:bg-midnight-light/30 dark:border dark:border-arcane/10 rpg-card">
      <CardHeader className="px-4 py-3 flex flex-row justify-between items-center bg-midnight-light/20 dark:bg-midnight/40 rounded-t-lg border-b border-arcane/5">
        <div className="flex items-center">
          <h3 className="font-orbitron font-medium text-base text-gray-800 dark:text-ghostwhite/90 flex items-center">
            <Sparkles className="w-3.5 h-3.5 mr-2 text-arcane-muted opacity-80" /> Classe
          </h3>
          {isOnCooldown && (
            <span className="ml-2 text-xs bg-amber-100/10 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300/90 px-2 py-0.5 rounded-full font-space-grotesk text-[10px]">
              {cooldownText}
            </span>
          )}
        </div>
        <Button 
          variant="ghost" 
          className="text-arcane-muted/90 flex items-center text-xs h-auto p-0 hover:bg-arcane/5 font-orbitron" 
          onClick={() => navigate('/classes')}
        >
          {actualClassName ? 'Trocar Classe' : 'Selecionar Classe'} <ChevronRight className="w-3.5 h-3.5" />
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
