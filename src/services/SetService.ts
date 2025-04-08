
import { SetData, DatabaseResult } from '@/types/workoutTypes';
import { SetCreationService } from './set/SetCreationService';
import { SetUpdateService } from './set/SetUpdateService';
import { SetDeleteService } from './set/SetDeleteService';
import { SetQueryService } from './set/SetQueryService';
import { SetErrorService } from './set/SetErrorService';
import { SetVerificationService } from './set/SetVerificationService';
import { SetOrderingService } from './set/SetOrderingService';

/**
 * SetService acts as a facade for all set-related operations
 * by delegating to specialized service classes
 */
export class SetService {
  // Creation operations
  static createSet = SetCreationService.createSet;
  static verifySet = SetCreationService.verifySet;
  
  // Update operations
  static updateSet = SetUpdateService.updateSet;
  static updateRoutineExerciseSetsCount = SetUpdateService.updateRoutineExerciseSetsCount;
  static verifyRoutineExerciseSetsCount = SetUpdateService.verifyRoutineExerciseSetsCount;
  
  // Delete operations
  static deleteSet = SetDeleteService.deleteSet;
  static reorderSets = SetDeleteService.reorderSets;
  
  // Query operations
  static getSetsForExercise = SetQueryService.getSetsForExercise;
  static countSetsForExercise = SetQueryService.countSetsForExercise;
  
  // Verification operations
  static verifySetCount = SetVerificationService.verifySetCount;
  static reconcileSetCount = SetVerificationService.reconcileSetCount;
  
  // Set ordering operations
  static normalizeSetOrders = SetOrderingService.normalizeSetOrders;
  
  // Error handling
  static displayError = SetErrorService.displayError;
}
