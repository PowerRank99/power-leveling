
import React from 'react';
import PageHeader from '@/components/ui/PageHeader';
import { Badge } from '@/components/ui/badge';
import { Trophy } from 'lucide-react';

interface ClassStatusContentProps {
  profile: any;
  showBackButton?: boolean;
}

const ClassStatusContent: React.FC<ClassStatusContentProps> = ({ profile, showBackButton = true }) => {
  return (
    <PageHeader 
      title="Seleção de Classe"
      showBackButton={showBackButton}
      rightContent={
        profile?.level ? (
          <Badge variant="level" className="flex items-center gap-1">
            <Trophy size={14} className="text-arcane" />
            <span>Nível {profile.level}</span>
          </Badge>
        ) : null
      }
    />
  );
};

export default ClassStatusContent;
