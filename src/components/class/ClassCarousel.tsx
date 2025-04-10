
import React, { useState, useEffect } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { ClassInfo } from '@/services/rpg/ClassService';
import ClassSelectionCard from './ClassSelectionCard';
import { ChevronLeft, ChevronRight, SwipeHorizontal } from 'lucide-react';
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
        onClassSelect(currentClass.class_name);
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
    
    const classIndex = classes.findIndex(cls => cls.class_name === selectedClass);
    if (classIndex !== -1 && classIndex !== focusedIndex) {
      emblaApi.scrollTo(classIndex);
    }
  }, [emblaApi, classes, selectedClass, focusedIndex]);
  
  useEffect(() => {
    if (!emblaApi || !classes.length || !userClass) return;
    
    const classIndex = classes.findIndex(cls => cls.class_name === userClass);
    if (classIndex !== -1) {
      emblaApi.scrollTo(classIndex);
    }
  }, [emblaApi, classes, userClass]);
  
  const scrollPrev = () => emblaApi?.scrollPrev();
  const scrollNext = () => emblaApi?.scrollNext();
  
  return (
    <div className="relative mb-8 mx-auto max-w-xl">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex py-8">
          {classes.map((classInfo, index) => (
            <div 
              key={classInfo.class_name} 
              className="flex-[0_0_100%] min-w-0 pl-4 md:flex-[0_0_80%] transition-all duration-300"
            >
              <ClassSelectionCard
                classInfo={classInfo}
                isCurrentClass={userClass === classInfo.class_name}
                isSelected={selectedClass === classInfo.class_name}
                isFocused={index === focusedIndex}
                isOnCooldown={isOnCooldown}
                onClick={() => {
                  if (!isOnCooldown || userClass === classInfo.class_name) {
                    onClassSelect(classInfo.class_name);
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
        <Button
          onClick={scrollPrev}
          disabled={!canScrollPrev}
          size="icon"
          variant="ghost"
          className="h-12 w-12 rounded-full bg-white/70 shadow-md text-gray-700 hover:bg-white/90 hover:text-black transition-all duration-200"
          aria-label="Previous class"
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>
      </div>
      
      <div className="absolute inset-y-0 right-0 flex items-center">
        <Button
          onClick={scrollNext}
          disabled={!canScrollNext}
          size="icon"
          variant="ghost"
          className="h-12 w-12 rounded-full bg-white/70 shadow-md text-gray-700 hover:bg-white/90 hover:text-black transition-all duration-200"
          aria-label="Next class"
        >
          <ChevronRight className="h-6 w-6" />
        </Button>
      </div>
      
      {/* Swipe hint animation */}
      <AnimatePresence>
        {showSwipeHint && (
          <motion.div 
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/50 text-white px-4 py-2 rounded-full flex items-center gap-2 z-20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <SwipeHorizontal className="w-5 h-5" />
            <span className="text-sm font-medium">Deslize para ver mais</span>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Carousel indicators */}
      <div className="flex justify-center mt-4">
        <div className="flex gap-2">
          {classes.map((classInfo, index) => (
            <button
              key={`dot-${classInfo.class_name}`}
              className={`w-3 h-3 rounded-full transition-all duration-300 ease-in-out flex items-center justify-center ${
                index === focusedIndex ? 'bg-fitblue w-7 shadow-glow-purple' : 'bg-gray-300 hover:bg-gray-400'
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
