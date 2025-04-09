
import React from 'react';
import { Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AchievementPopupProps {
  title: string;
  description: string;
  xpReward: number;
  bonusText?: string;
  onClose: () => void;
  isOpen: boolean;
}

const AchievementPopup: React.FC<AchievementPopupProps> = ({
  title,
  description,
  xpReward,
  bonusText = "Excede o limite diário",
  onClose,
  isOpen
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-70 animate-fade-in">
      <div className="bg-white rounded-lg shadow-lg max-w-sm w-full animate-scale-in">
        <div className="flex flex-col items-center p-6">
          {/* Trophy icon with circle */}
          <div className="mb-4 rounded-full bg-fitpurple p-6 -mt-12 border-4 border-white">
            <Trophy className="h-10 w-10 text-white" />
          </div>
          
          {/* Title */}
          <h3 className="text-fitpurple text-xl mb-1">Nova Conquista!</h3>
          <h2 className="text-2xl font-bold mb-1 text-center">{title}</h2>
          <p className="text-gray-600 text-center mb-6">{description}</p>
          
          {/* XP Reward */}
          <div className="bg-fitpurple-100 w-full py-3 px-4 rounded-lg mb-6">
            <div className="flex justify-center items-center">
              <span className="text-xl font-bold text-fitpurple">+{xpReward} EXP Bônus!</span>
            </div>
            <div className="text-center text-sm text-fitpurple-600">{bonusText}</div>
          </div>
          
          {/* Button */}
          <Button 
            className="w-full bg-fitpurple hover:bg-fitpurple-700"
            onClick={onClose}
          >
            Incrível!
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AchievementPopup;
