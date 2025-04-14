
import React, { useState, useEffect } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { ClassInfo } from '@/services/rpg/ClassService';
import ClassSelectionCard from './ClassSelectionCard';
import { ChevronLeft, ChevronRight, MoveHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

interface ClassCarouselProps {
  classes: ClassInfo[];
  selectedClass: string | null;
  userClass: string | null;
  isOnCooldown: boolean;
  onClassSelect: (className: string) => void;
}

const ClassCarousel: React.FC<ClassCarouselProps> = ({
  classes,
  selectedClass,
  userClass,
  isOnCooldown,
  onClassSelect,
}) => {
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [showSwipeHint, setShowSwipeHint] = useState(true);
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: 'center',
    skipSnaps: false,
  });
  
  useEffect(() => {
    if (!emblaApi) return;
    
    const onSelect = () => {
      setFocusedIndex(emblaApi.selectedScrollSnap());
      const currentClass = classes[emblaApi.selectedScrollSnap()];
      if (currentClass) {
        onClassSelect(currentClass.className);
      }
      
      setCanScrollPrev(emblaApi.canScrollPrev());
      setCanScrollNext(emblaApi.canScrollNext());
      
      // Hide swipe hint after first interaction
      setShowSwipeHint(false);
    };
    
    emblaApi.on('select', onSelect);
    onSelect();
    
    // Auto-hide swipe hint after 3 seconds
    const timer = setTimeout(() => {
      setShowSwipeHint(false);
    }, 3000);
    
    return () => {
      emblaApi.off('select', onSelect);
      clearTimeout(timer);
    };
  }, [emblaApi, classes, onClassSelect]);
  
  useEffect(() => {
    if (!emblaApi || !classes.length || !selectedClass) return;
    
    const classIndex = classes.findIndex(cls => cls.className === selectedClass);
    if (classIndex !== -1 && classIndex !== focusedIndex) {
      emblaApi.scrollTo(classIndex);
    }
  }, [emblaApi, classes, selectedClass, focusedIndex]);
  
  useEffect(() => {
    if (!emblaApi || !classes.length || !userClass) return;
    
    const classIndex = classes.findIndex(cls => cls.className === userClass);
    if (classIndex !== -1) {
      emblaApi.scrollTo(classIndex);
    }
  }, [emblaApi, classes, userClass]);
  
  const scrollPrev = () => emblaApi?.scrollPrev();
  const scrollNext = () => emblaApi?.scrollNext();
  
  // Animation variants
  const buttonVariants = {
    initial: { opacity: 0.7, scale: 1 },
    hover: { opacity: 1, scale: 1.1 },
    tap: { scale: 0.95 }
  };
  
  const indicatorVariants = {
    inactive: { width: "0.75rem", opacity: 0.5 },
    active: { 
      width: "2rem", 
      opacity: 1,
      transition: { type: "spring", stiffness: 500, damping: 30 }
    }
  };
  
  return (
    <div className="relative mb-8 mx-auto max-w-xl">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex py-8">
          {classes.map((classInfo, index) => (
            <div 
              key={classInfo.className} 
              className="flex-[0_0_100%] min-w-0 pl-4 md:flex-[0_0_85%] transition-all duration-300"
            >
              <ClassSelectionCard
                classInfo={classInfo}
                isCurrentClass={userClass === classInfo.className}
                isSelected={selectedClass === classInfo.className}
                isFocused={index === focusedIndex}
                isOnCooldown={isOnCooldown}
                onClick={() => {
                  if (!isOnCooldown || userClass === classInfo.className) {
                    onClassSelect(classInfo.className);
                    if (emblaApi) emblaApi.scrollTo(index);
                  }
                }}
              />
            </div>
          ))}
        </div>
      </div>
      
      {/* Navigation buttons */}
      <div className="absolute inset-y-0 left-0 flex items-center">
        <motion.div
          variants={buttonVariants}
          initial="initial"
          whileHover="hover"
          whileTap="tap"
        >
          <Button
            onClick={scrollPrev}
            disabled={!canScrollPrev}
            size="icon"
            variant="ghost"
            className="h-12 w-12 rounded-full bg-black/40 backdrop-blur-md border border-white/20 shadow-lg text-white hover:bg-black/60 hover:text-white transition-all duration-200"
            aria-label="Previous class"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
        </motion.div>
      </div>
      
      <div className="absolute inset-y-0 right-0 flex items-center">
        <motion.div
          variants={buttonVariants}
          initial="initial"
          whileHover="hover"
          whileTap="tap"
        >
          <Button
            onClick={scrollNext}
            disabled={!canScrollNext}
            size="icon"
            variant="ghost"
            className="h-12 w-12 rounded-full bg-black/40 backdrop-blur-md border border-white/20 shadow-lg text-white hover:bg-black/60 hover:text-white transition-all duration-200"
            aria-label="Next class"
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </motion.div>
      </div>
      
      {/* Swipe hint animation */}
      <AnimatePresence>
        {showSwipeHint && (
          <motion.div 
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/70 backdrop-blur-md text-white px-4 py-2 rounded-full flex items-center gap-2 z-20 border border-white/20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <MoveHorizontal className="w-5 h-5" />
            <span className="text-sm font-medium">Deslize para ver classes</span>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Carousel indicators */}
      <div className="flex justify-center mt-4">
        <div className="flex gap-2">
          {classes.map((classInfo, index) => (
            <motion.button
              key={`dot-${classInfo.className}`}
              variants={indicatorVariants}
              initial="inactive"
              animate={index === focusedIndex ? "active" : "inactive"}
              className={`h-2 rounded-full transition-all duration-300 ease-in-out flex items-center justify-center bg-white backdrop-blur-sm ${
                index === focusedIndex ? 'shadow-glow-purple' : 'opacity-50'
              }`}
              onClick={() => {
                if (emblaApi) emblaApi.scrollTo(index);
              }}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ClassCarousel;
