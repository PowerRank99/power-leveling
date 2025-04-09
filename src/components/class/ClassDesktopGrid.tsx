
import React from 'react';
import { ClassInfo } from '@/services/rpg/ClassService';
import ClassSelectionCard from './ClassSelectionCard';

interface ClassDesktopGridProps {
  classes: ClassInfo[];
  selectedClass: string | null;
  userClass: string | null;
  isOnCooldown: boolean;
  focusedIndex: number;
  onClassSelect: (className: string, index: number) => void;
}

const ClassDesktopGrid: React.FC<ClassDesktopGridProps> = ({
  classes,
  selectedClass,
  userClass,
  isOnCooldown,
  focusedIndex,
  onClassSelect,
}) => {
  return (
    <div className="hidden lg:grid lg:grid-cols-3 gap-6 mb-8 mt-12">
      {classes.map((classInfo, index) => (
        <div key={`grid-${classInfo.class_name}`} className="h-full">
          <ClassSelectionCard
            classInfo={classInfo}
            isCurrentClass={userClass === classInfo.class_name}
            isSelected={selectedClass === classInfo.class_name}
            isFocused={index === focusedIndex}
            isOnCooldown={isOnCooldown}
            onClick={() => {
              if (!isOnCooldown || userClass === classInfo.class_name) {
                onClassSelect(classInfo.class_name, index);
              }
            }}
          />
        </div>
      ))}
    </div>
  );
};

export default ClassDesktopGrid;
