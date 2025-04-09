
import React from 'react';
import { ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import ClassCard from '@/components/profile/ClassCard';

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
    <div className="bg-white p-5 mt-3 rounded-xl shadow-sm">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-bold text-lg text-gray-800">Classe</h3>
        <Button 
          variant="ghost" 
          className="text-fitblue flex items-center text-sm h-auto p-0" 
          onClick={() => navigate('/classes')}
        >
          Trocar Classe <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
      
      <ClassCard 
        className={className}
        description={classDescription}
        icon={icon}
        bonuses={bonuses}
      />
    </div>
  );
};

export default ClassSection;
