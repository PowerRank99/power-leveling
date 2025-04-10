
import React, { useEffect } from 'react';
import { Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { achievementPopupStore } from '@/stores/achievementPopupStore';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import '../../styles/timer-animations.css';

const AchievementPopup: React.FC = () => {
  const { isVisible, achievement, hideAchievement } = achievementPopupStore();
  
  useEffect(() => {
    // Add sound effect or haptic feedback could be implemented here
    if (isVisible) {
      // Play sound effect or vibration
      const audio = new Audio('/sounds/achievement.mp3');
      audio.volume = 0.5;
      // Uncomment below to add sound when implemented
      // audio.play().catch(e => console.log('Audio play failed', e));
    }
  }, [isVisible]);

  if (!isVisible || !achievement) return null;

  return (
    <Dialog open={isVisible} onOpenChange={(open) => !open && hideAchievement()}>
      <DialogContent className="p-0 rounded-xl shadow-xl border-0 max-w-sm mx-auto overflow-hidden bg-white animate-scale-in">
        <div className="flex flex-col items-center p-6 pb-8">
          {/* Trophy icon with circle */}
          <div className="mb-4 rounded-full bg-purple-500 p-6 -mt-12 border-4 border-white shadow-lg pulse">
            <Trophy className="h-12 w-12 text-white" strokeWidth={1.5} />
          </div>
          
          {/* Title */}
          <h3 className="text-purple-500 text-xl font-semibold mt-2 mb-1">Nova Conquista!</h3>
          <h2 className="text-2xl font-bold mb-1 text-center">{achievement.title}</h2>
          <p className="text-gray-600 text-center mb-6">{achievement.description}</p>
          
          {/* XP Reward */}
          <div className="bg-purple-100 w-full py-3 px-4 rounded-lg mb-6">
            <div className="flex justify-center items-center">
              <span className="text-xl font-bold text-purple-600">+{achievement.xpReward} XP Bônus!</span>
            </div>
            <div className="text-center text-sm text-purple-500">{achievement.bonusText}</div>
          </div>
          
          {/* Button */}
          <Button 
            className="w-full bg-purple-500 hover:bg-purple-600 text-white py-6"
            onClick={hideAchievement}
          >
            Incrível!
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AchievementPopup;
