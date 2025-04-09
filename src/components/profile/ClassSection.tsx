
import React from 'react';
import { ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import ClassCard from '@/components/profile/ClassCard';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

interface ClassBonus {
  description: string;
  value: string;
}

interface ClassSectionProps {
  className: string;
  classDescription: string;
  icon: React.ReactNode;
  bonuses: ClassBonus[];
}

const ClassSection: React.FC<ClassSectionProps> = ({
  className,
  classDescription,
  icon,
  bonuses
}) => {
  const navigate = useNavigate();
  
  return (
    <Card className="mt-3 shadow-sm border-none">
      <CardHeader className="px-4 py-3 flex flex-row justify-between items-center">
        <h3 className="font-bold text-lg text-gray-800">Classe</h3>
        <Button 
          variant="ghost" 
          className="text-fitblue flex items-center text-sm h-auto p-0" 
          onClick={() => navigate('/classes')}
        >
          Trocar Classe <ChevronRight className="w-4 h-4" />
        </Button>
      </CardHeader>
      
      <CardContent className="p-4 pt-0">
        <ClassCard 
          className={className}
          description={classDescription}
          icon={icon}
          bonuses={bonuses}
        />
      </CardContent>
    </Card>
  );
};

export default ClassSection;
