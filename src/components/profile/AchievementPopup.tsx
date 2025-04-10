
import React, { useEffect } from 'react';
import { Trophy, Sparkles } from 'lucide-react';
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
      <DialogContent className="p-0 rounded-xl shadow-xl border-0 max-w-sm mx-auto overflow-hidden bg-midnight-50/95 backdrop-blur-md animate-scale-in border border-arcane/30">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-arcane/10 to-xpgold/5 opacity-30"></div>
          <div className="flex flex-col items-center p-6 pb-8 relative z-10">
            {/* Trophy icon with circle */}
            <div className="mb-4 rounded-full bg-gradient-valor-xpgold p-6 -mt-12 border-4 border-ghost/30 shadow-glow-gold pulse">
              <Trophy className="h-12 w-12 text-ghost" strokeWidth={1.5} />
            </div>
            
            {/* Title */}
            <div className="flex items-center gap-1">
              <Sparkles className="h-5 w-5 text-xpgold animate-pulse" />
              <h3 className="text-xpgold text-xl font-display tracking-wide">Nova Conquista!</h3>
              <Sparkles className="h-5 w-5 text-xpgold animate-pulse" />
            </div>
            <h2 className="text-2xl font-display mb-1 text-center tracking-wide text-ghost mt-2">{achievement.title}</h2>
            <p className="text-ghost-400 text-center mb-6">{achievement.description}</p>
            
            {/* XP Reward */}
            <div className="bg-arcane/20 w-full py-3 px-4 rounded-lg mb-6 border border-arcane/30 relative overflow-hidden">
              <div className="absolute inset-0 bg-shimmer-gold bg-[length:200%_100%] animate-shimmer opacity-30"></div>
              <div className="flex justify-center items-center relative z-10">
                <span className="text-xl font-bold text-xpgold font-mono">+{achievement.xpReward} XP Bônus!</span>
              </div>
              <div className="text-center text-sm text-ghost-300 relative z-10">{achievement.bonusText}</div>
            </div>
            
            {/* Button */}
            <Button 
              variant="xp"
              className="w-full py-6 font-display tracking-wide text-lg relative"
              onClick={hideAchievement}
            >
              <span className="relative z-10">Incrível!</span>
              <div className="absolute inset-0 bg-shimmer-gold bg-[length:200%_100%] animate-shimmer opacity-40"></div>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AchievementPopup;
