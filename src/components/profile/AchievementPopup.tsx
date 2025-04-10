
import React, { useEffect } from 'react';
import { Trophy, Star, Sparkles } from 'lucide-react';
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
      
      // Create magic particles effect
      if (document.querySelector('.achievement-popup-container')) {
        createMagicParticles();
      }
    }
  }, [isVisible]);

  const createMagicParticles = () => {
    const container = document.querySelector('.achievement-popup-container');
    if (!container) return;
    
    // Create 20 particles
    for (let i = 0; i < 20; i++) {
      const particle = document.createElement('div');
      particle.className = 'absolute w-2 h-2 rounded-full bg-xpgold animate-magic-particles';
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.top = `${Math.random() * 100}%`;
      particle.style.opacity = '0';
      particle.style.animationDelay = `${Math.random() * 1}s`;
      container.appendChild(particle);
      
      // Remove particle after animation
      setTimeout(() => {
        particle.remove();
      }, 1500);
    }
  };

  if (!isVisible || !achievement) return null;

  return (
    <Dialog open={isVisible} onOpenChange={(open) => !open && hideAchievement()}>
      <DialogContent className="p-0 rounded-xl shadow-xl border-0 max-w-sm mx-auto overflow-hidden bg-midnight-light animate-scale-in achievement-popup-container">
        <div className="relative bg-gradient-midnight-arcane-xpgold p-6 pb-8 flex flex-col items-center overflow-hidden">
          {/* Background effects */}
          <div className="absolute inset-0">
            <div className="absolute w-40 h-40 bg-arcane/20 rounded-full blur-xl top-20 -left-20 animate-pulse"></div>
            <div className="absolute w-80 h-80 bg-xpgold/10 rounded-full blur-xl -bottom-40 -right-40 animate-pulse"></div>
          </div>
          
          {/* Trophy icon with circle */}
          <div className="relative mb-4 rounded-full bg-gradient-valor-xpgold p-6 -mt-12 border-4 border-white/20 shadow-lg z-10 animate-trophy-bounce">
            <Trophy className="h-12 w-12 text-white" strokeWidth={1.5} />
            <div className="absolute -top-2 -right-2 w-8 h-8">
              <Star className="h-8 w-8 text-xpgold animate-pulse" fill="#FACC15" />
            </div>
          </div>
          
          {/* Title */}
          <h3 className="text-xpgold text-xl font-space-grotesk font-bold mt-2 mb-1 animate-glow-pulse relative z-10">Nova Conquista!</h3>
          <h2 className="text-2xl font-orbitron font-bold mb-1 text-center text-ghostwhite tracking-wide relative z-10">{achievement.title}</h2>
          <p className="text-gray-300 text-center mb-6 font-sora relative z-10">{achievement.description}</p>
          
          {/* XP Reward */}
          <div className="bg-arcane/20 w-full py-3 px-4 rounded-lg mb-6 backdrop-blur-sm border border-arcane/30 relative overflow-hidden shadow-glow-md z-10">
            <div className="absolute inset-0 opacity-20">
              <div className="absolute w-20 h-20 bg-xpgold rounded-full blur-xl top-5 -left-10 animate-pulse"></div>
              <div className="absolute w-30 h-30 bg-xpgold rounded-full blur-xl -bottom-10 -right-10 animate-pulse"></div>
            </div>
            <div className="flex justify-center items-center relative">
              <span className="text-xl font-bold text-xpgold font-space-grotesk tracking-wider flex items-center">
                <Sparkles className="w-5 h-5 mr-2 animate-pulse" /> +{achievement.xpReward} XP Bônus!
              </span>
            </div>
            <div className="text-center text-sm text-arcane-light relative">{achievement.bonusText}</div>
          </div>
          
          {/* Button */}
          <Button 
            className="w-full bg-gradient-arcane-valor hover:bg-gradient-valor-xpgold text-white py-6 transition-all duration-300 font-orbitron tracking-wide relative z-10"
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
