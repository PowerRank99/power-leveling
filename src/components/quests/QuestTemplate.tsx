
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Calendar, Award, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface QuestTemplateProps {
  id: string;
  title: string;
  description: string;
  daysRequired: number;
  totalDays: number;
  xpReward: number;
  category: string;
  onSelect: (templateId: string) => void;
  selected?: boolean;
}

const QuestTemplate: React.FC<QuestTemplateProps> = ({
  id,
  title,
  description,
  daysRequired,
  totalDays,
  xpReward,
  category,
  onSelect,
  selected = false,
}) => {
  return (
    <Card 
      className={`transition-all hover:shadow-md ${
        selected ? 'border-2 border-blue-500 bg-blue-50' : ''
      }`}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-bold">{title}</CardTitle>
          <Badge className={`${
            category === 'easy' ? 'bg-green-500' : 
            category === 'medium' ? 'bg-yellow-500' : 'bg-red-500'
          }`}>
            {category}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <p className="text-sm text-gray-600 mb-4">{description}</p>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center">
            <CheckCircle2 className="w-4 h-4 mr-1 text-gray-500" />
            <span>{daysRequired} dias necessários</span>
          </div>
          <div className="flex items-center">
            <Calendar className="w-4 h-4 mr-1 text-gray-500" />
            <span>{totalDays} dias totais</span>
          </div>
          <div className="flex items-center col-span-2">
            <Award className="w-4 h-4 mr-1 text-yellow-500" />
            <span className="font-medium">{xpReward} XP de recompensa</span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          className={`w-full ${selected ? 'bg-blue-600' : ''}`}
          variant={selected ? "default" : "outline"}
          onClick={() => onSelect(id)}
        >
          {selected ? "Selecionado" : "Selecionar"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default QuestTemplate;
