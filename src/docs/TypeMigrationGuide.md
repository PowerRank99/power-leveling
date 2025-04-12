
# Type Migration Guide

This document outlines the plan for migrating to our consolidated type system for workouts.

## Overview of Changes

We've consolidated our workout-related types in `src/types/workout.ts` and marked `src/types/workoutTypes.ts` as deprecated. This resolves inconsistencies between various definitions of `WorkoutExercise` and related types.

## Key Changes

1. `WorkoutExercise` in `src/types/workout.ts` is now the primary interface with properties:
   - `id` and `name` for display
   - `exerciseId` for database references
   - `sets` as an array of `WorkoutSet` objects

2. For backward compatibility, we've:
   - Re-exported the previous `WorkoutExercise` interface as `WorkoutExerciseData`
   - Maintained the `SetData` interface structure
   - Ensured all components can use the new types with minimal changes

## Migration Steps

### 1. Update Import Statements

Change:
```typescript
import { WorkoutExercise } from '@/types/workoutTypes';
```

To:
```typescript
import { WorkoutExercise } from '@/types/workout';
```

### 2. Update Service Files

For services that work with workout exercises, ensure they're using the right properties.

Example update:
```typescript
// Before
const completedSets = exercise.sets || 0;

// After (ensuring sets is an array)
const completedSets = Array.isArray(exercise.sets) 
  ? exercise.sets.filter(set => set.completed).length 
  : 0;
```

### 3. Update Hook Files

For hooks that manage workout state, ensure they properly handle the `sets` property.

Example update:
```typescript
// Before
if (exercise.sets && exercise.sets > 0) { ... }

// After
if (Array.isArray(exercise.sets) && exercise.sets.length > 0) { ... }
```

### 4. Test the Application

After making updates:
1. Verify that all workout functionality works as expected
2. Check that personal records are correctly identified and stored
3. Ensure XP calculations handle the new types properly
4. Verify that set management (add/remove/update) works correctly

## Files Requiring Updates

Here's a list of files that need to be updated to use the new consolidated types:

### Services
- ✅ `src/services/rpg/XPCalculationService.ts`
- ✅ `src/services/rpg/PersonalRecordService.ts`
- ✅ `src/services/workout/SetReconciliationService.ts`
- ✅ `src/services/workout/WorkoutDataFormatter.ts`
- `src/services/rpg/XPService.ts`
- `src/services/workout/WorkoutDataService.ts`
- `src/services/workout/WorkoutCompletionService.ts`
- `src/services/SetService.ts`

### Hooks
- `src/hooks/workout/useSetAdder.tsx`
- `src/hooks/workout/useSetRemover.tsx`
- `src/hooks/workout/useSetUpdater.tsx`
- `src/hooks/workout/useSetSetsManagement.tsx`
- `src/hooks/useWorkoutManager.tsx`
- `src/hooks/useWorkoutExercises.tsx`
- `src/hooks/useWorkoutTimerController.tsx`

### Components
- ✅ `src/components/achievement-testing/WorkoutSimulation.tsx`
- `src/components/workout/set/SetRow.tsx`
- `src/components/workout/timer/WorkoutTimerControls.tsx`
- `src/components/workout/ActiveExercise.tsx`

## Next Steps

After completing the migration:
1. Add deprecation notices to any remaining files that use the old type definitions
2. Gradually migrate all remaining usages to the new system
3. Eventually remove the re-exports from `src/types/workoutTypes.ts`
