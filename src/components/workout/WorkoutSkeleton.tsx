
import React from 'react';
import { Skeleton } from "@/components/ui/skeleton";

const WorkoutSkeleton = () => {
  return (
    <div className="p-4">
      <div className="flex justify-between items-center border-b pb-4 mb-4">
        <div>
          <p className="text-gray-500">Tempo de Treino</p>
          <Skeleton className="h-8 w-16 mt-1" />
        </div>
        <Skeleton className="h-10 w-40" />
      </div>

      <div className="mb-6">
        <Skeleton className="h-7 w-48 mb-4" />

        <div className="grid grid-cols-12 gap-2 mb-2 text-sm font-medium text-gray-500">
          <div className="col-span-1">SET</div>
          <div className="col-span-3">ANTERIOR</div>
          <div className="col-span-3">KG</div>
          <div className="col-span-3">REPS</div>
          <div className="col-span-2"></div>
        </div>

        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="grid grid-cols-12 gap-2 mb-4 items-center">
            <div className="col-span-1 font-medium">{index + 1}</div>
            <div className="col-span-3">
              <Skeleton className="h-6 w-full" />
            </div>
            <div className="col-span-3">
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="col-span-3">
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="col-span-2 flex justify-center">
              <Skeleton className="h-10 w-10 rounded-full" />
            </div>
          </div>
        ))}
      </div>

      <Skeleton className="h-10 w-full mt-4" />
      
      <div className="mt-6">
        <Skeleton className="h-6 w-40 mb-2" />
        <div className="flex justify-between items-center mt-4">
          <div>
            <Skeleton className="h-6 w-32 mb-1" />
            <Skeleton className="h-4 w-20" />
          </div>
          <Skeleton className="h-6 w-16" />
        </div>
      </div>
    </div>
  );
};

export default WorkoutSkeleton;
