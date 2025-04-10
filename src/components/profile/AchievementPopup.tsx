
import React, { useEffect } from 'react';
import { Trophy, Star, Sparkles, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { achievementPopupStore } from '@/stores/achievementPopupStore';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import '../../styles/timer-animations.css';

const AchievementPopup: React.FC = () => {
  const { isVisible, achievement, hideAchievement } = achievementPopupStore();
  
  useEffect(() => {
    if (isVisible) {
      // Placeholder for sound effect
      // const audio = new Audio('/sounds/achievement.mp3');
      // audio.volume = 0.5;
      // audio.play().catch(e => console.log('Audio play failed', e));
      
      // Create subtle particle effects
      if (document.querySelector('.achievement-popup-container')) {
        createMagicParticles();
      }
    }
  }, [isVisible]);

  const createMagicParticles = () => {
    const container = document.querySelector('.achievement-popup-container');
    if (!container) return;
    
    // Create fewer particles with smaller sizes for a more subtle effect
    for (let i = 0; i < 8; i++) {
      const particle = document.createElement('div');
      const size = 0.5 + Math.random() * 1.5;
      const colors = ['#FACC15', '#EF4444', '#7C3AED', '#06B6D4'];
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      particle.className = 'absolute rounded-full animate-magic-particles';
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      particle.style.backgroundColor = color;
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
      <DialogContent className="p-0 rounded-xl shadow-md border-0 max-w-sm mx-auto overflow-hidden bg-midnight-light/70 backdrop-blur-md animate-scale-in achievement-popup-container">
        <div className="relative bg-gradient-to-br from-midnight-deep/90 via-arcane-muted/30 to-xp-gold-muted/20 p-6 pb-8 flex flex-col items-center overflow-hidden">
          {/* Subtle background effects */}
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <div className="absolute w-60 h-60 bg-arcane/10 rounded-full blur-xl top-20 -left-20"></div>
            <div className="absolute w-80 h-80 bg-xp-gold/10 rounded-full blur-xl -bottom-40 -right-40"></div>
          </div>
          
          {/* Trophy icon with circle */}
          <div className="relative mb-4 rounded-full bg-gradient-to-br from-valor-muted/90 to-xp-gold-muted/90 p-5 -mt-10 border border-white/10 shadow-md z-10">
            <Trophy className="h-10 w-10 text-white/95" strokeWidth={1.5} />
            <div className="absolute -top-2 -right-2 w-6 h-6">
              <Star className="h-6 w-6 text-xp-gold" fill="#FACC15" />
            </div>
          </div>
          
          {/* Title */}
          <div className="text-xp-gold-muted text-base font-space-grotesk font-medium mt-2 mb-1 relative z-10 flex items-center">
            <Award className="w-4 h-4 mr-2" />
            Nova Conquista
            <Award className="w-4 h-4 ml-2" />
          </div>
          <h2 className="text-xl font-orbitron font-bold mb-1 text-center text-ghostwhite/95 tracking-wide relative z-10">{achievement.title}</h2>
          <p className="text-gray-300/90 text-center mb-6 font-sora text-sm relative z-10">{achievement.description}</p>
          
          {/* XP Reward */}
          <div className="bg-arcane/10 w-full py-2.5 px-4 rounded-lg mb-6 backdrop-blur-sm border border-arcane/20 relative overflow-hidden shadow-sm z-10">
            <div className="absolute inset-0 opacity-10 pointer-events-none">
              <div className="absolute w-20 h-20 bg-xp-gold rounded-full blur-xl top-5 -left-10"></div>
              <div className="absolute w-30 h-30 bg-xp-gold rounded-full blur-xl -bottom-10 -right-10"></div>
            </div>
            <div className="flex justify-center items-center relative">
              <span className="text-lg font-medium text-xp-gold-muted font-space-grotesk tracking-wider flex items-center">
                <Sparkles className="w-4 h-4 mr-2" /> +{achievement.xpReward} XP Bônus
              </span>
            </div>
            <div className="text-center text-xs text-arcane-light/80 relative">{achievement.bonusText}</div>
          </div>
          
          {/* Button */}
          <Button 
            className="w-full bg-gradient-to-r from-arcane-muted/90 to-valor-muted/90 hover:from-arcane hover:to-valor text-white/95 py-5 transition-all duration-300 transform hover:scale-[1.02] font-orbitron tracking-wide relative z-10"
            onClick={hideAchievement}
          >
            <Sparkles className="w-4 h-4 mr-2" /> Incrível! <Sparkles className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AchievementPopup;
