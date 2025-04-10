
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
    <Card className="mt-3 shadow-md border-arcane-purple-30 bg-card-alt/30 rpg-card">
      <CardHeader className="px-4 py-3 flex flex-row justify-between items-center bg-bg-card-alt/20 dark:bg-bg-deep/40 rounded-t-lg border-b border-arcane-purple-30/20">
        <div className="flex items-center">
          <h3 className="font-orbitron font-medium text-base text-gray-800 dark:text-ghost-white-95 flex items-center">
            <Sparkles className="w-3.5 h-3.5 mr-2 text-arcane-purple-60 opacity-80" /> Classe
          </h3>
          {isOnCooldown && (
            <span className="ml-2 text-xs bg-amber-100/10 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300/90 px-2 py-0.5 rounded-full font-space-grotesk text-[10px]">
              {cooldownText}
            </span>
          )}
        </div>
        <Button 
          variant="ghost" 
          className="text-arcane-purple-60/90 flex items-center text-xs h-auto p-0 hover:bg-arcane-purple-30/5 transition-premium font-orbitron" 
          onClick={() => navigate('/classes')}
        >
          {actualClassName ? 'Trocar Classe' : 'Selecionar Classe'} <ChevronRight className="w-3.5 h-3.5" />
        </Button>
      </CardHeader>
      
      <CardContent className="p-4 pt-3">
        <div className="bg-gradient-to-br from-arcane-purple-30/20 to-arcane-purple-30/30 rounded-lg overflow-hidden border border-arcane-purple-30/30 shadow-md">
          <ClassCard 
            className={actualClassName || 'Sem Classe'}
            description={actualDescription}
            icon={icon}
            bonuses={displayBonuses}
            showAvatar={true}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default ClassSection;
