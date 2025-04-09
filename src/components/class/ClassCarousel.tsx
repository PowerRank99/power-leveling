
import React, { useState, useEffect } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { ClassInfo } from '@/services/rpg/ClassService';
import ClassSelectionCard from './ClassSelectionCard';

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
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: 'center',
    skipSnaps: false
  });
  
  // When the carousel scrolls, update the focused index
  useEffect(() => {
    if (!emblaApi) return;
    
    const onSelect = () => {
      setFocusedIndex(emblaApi.selectedScrollSnap());
      // Also update the selected class based on the carousel position
      const currentClass = classes[emblaApi.selectedScrollSnap()];
      if (currentClass) {
        onClassSelect(currentClass.class_name);
      }
    };
    
    emblaApi.on('select', onSelect);
    // Call once to initialize
    onSelect();
    
    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi, classes, onClassSelect]);
  
  // Select specific class and scroll carousel to it
  useEffect(() => {
    if (!emblaApi || !classes.length || !selectedClass) return;
    
    const classIndex = classes.findIndex(cls => cls.class_name === selectedClass);
    if (classIndex !== -1 && classIndex !== focusedIndex) {
      emblaApi.scrollTo(classIndex);
    }
  }, [emblaApi, classes, selectedClass, focusedIndex]);
  
  // Initialize: if user has a class, scroll to it
  useEffect(() => {
    if (!emblaApi || !classes.length || !userClass) return;
    
    const classIndex = classes.findIndex(cls => cls.class_name === userClass);
    if (classIndex !== -1) {
      emblaApi.scrollTo(classIndex);
    }
  }, [emblaApi, classes, userClass]);
  
  return (
    <div className="relative mb-8 mx-auto max-w-xl">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex py-8">
          {classes.map((classInfo, index) => (
            <div key={classInfo.class_name} className="flex-[0_0_100%] min-w-0 pl-4 md:flex-[0_0_80%]">
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
      
      <div className="flex justify-center mt-4">
        <div className="flex gap-2">
          {classes.map((classInfo, index) => (
            <button
              key={`dot-${classInfo.class_name}`}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === focusedIndex ? 'bg-fitblue w-4' : 'bg-gray-300'
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
