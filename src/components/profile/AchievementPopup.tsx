
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
      <DialogContent className="p-0 rounded-xl shadow-xl border-0 max-w-sm mx-auto overflow-hidden bg-midnight-card animate-scale-in">
        <div className="flex flex-col items-center p-6 pb-8">
          {/* Trophy icon with circle */}
          <div className="mb-4 rounded-full bg-gradient-to-br from-valor to-achievement p-6 -mt-12 border-4 border-midnight-card shadow-glow-gold pulse">
            <Trophy className="h-12 w-12 text-midnight-card" strokeWidth={1.5} />
          </div>
          
          {/* Title */}
          <h3 className="text-achievement text-xl font-semibold mt-2 mb-1 font-orbitron">Nova Conquista!</h3>
          <h2 className="text-2xl font-bold mb-1 text-center text-text-primary">{achievement.title}</h2>
          <p className="text-text-secondary text-center mb-6">{achievement.description}</p>
          
          {/* XP Reward */}
          <div className="bg-achievement-15 w-full py-3 px-4 rounded-lg mb-3 border border-achievement-30">
            <div className="flex justify-center items-center">
              <span className="text-xl font-bold text-achievement">+{achievement.xpReward} XP</span>
            </div>
          </div>
          
          {/* Achievement Points */}
          {achievement.bonusText && (
            <div className="bg-valor-15 w-full py-3 px-4 rounded-lg mb-6 border border-valor-30">
              <div className="text-center text-sm text-valor font-medium">{achievement.bonusText}</div>
            </div>
          )}
          
          {/* Button */}
          <Button 
            className="w-full bg-gradient-to-r from-valor to-achievement hover:from-valor-60 hover:to-achievement-60 text-midnight-card py-6 font-medium"
            onClick={hideAchievement}
          >
            Fantástico!
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AchievementPopup;
