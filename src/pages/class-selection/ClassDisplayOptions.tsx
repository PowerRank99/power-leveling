
import React from 'react';
import { motion } from 'framer-motion';
import { Separator } from '@/components/ui/separator';
import { ClassInfo } from '@/services/rpg/ClassService';
import ClassInstructionCard from '@/components/class/ClassInstructionCard';
import ClassCooldownNotice from '@/components/class/ClassCooldownNotice';
import ClassCarousel from '@/components/class/ClassCarousel';
import ClassDesktopGrid from '@/components/class/ClassDesktopGrid';

interface ClassDisplayOptionsProps {
  isOnCooldown: boolean;
  cooldownText: string;
  classes: ClassInfo[];
  selectedClass: string | null;
  userClass: string | null;
  focusedIndex: number;
  onClassSelect: (className: string, index?: number) => void;
  itemVariants: any;
}

const ClassDisplayOptions: React.FC<ClassDisplayOptionsProps> = ({
  isOnCooldown,
  cooldownText,
  classes,
  selectedClass,
  userClass,
  focusedIndex,
  onClassSelect,
  itemVariants
}) => {
  return (
    <>
      <motion.div variants={itemVariants}>
        <ClassInstructionCard />
      </motion.div>
      
      {isOnCooldown && (
        <motion.div variants={itemVariants}>
          <ClassCooldownNotice 
            isOnCooldown={isOnCooldown} 
            cooldownText={cooldownText} 
          />
        </motion.div>
      )}
      
      <motion.div variants={itemVariants} className="mb-4">
        <h3 className="text-lg font-semibold mb-2 text-text-primary font-orbitron tracking-wide">Classes Disponíveis</h3>
        <Separator className="bg-divider opacity-30" />
      </motion.div>
      
      <motion.div variants={itemVariants} className="premium-card p-4 mb-6 bg-midnight-elevated/80 backdrop-blur-md border border-white/10 rounded-xl shadow-elevated">
        {/* Mobile view: Carousel */}
        <div className="block lg:hidden">
          <ClassCarousel
            classes={classes}
            selectedClass={selectedClass}
            userClass={userClass}
            isOnCooldown={isOnCooldown}
            onClassSelect={onClassSelect}
          />
        </div>
        
        {/* Desktop view: Grid */}
        <ClassDesktopGrid
          classes={classes}
          selectedClass={selectedClass}
          userClass={userClass}
          isOnCooldown={isOnCooldown}
          focusedIndex={focusedIndex}
          onClassSelect={onClassSelect}
        />
      </motion.div>
    </>
  );
};

export default ClassDisplayOptions;
