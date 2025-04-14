
/**
 * Utilities for converting between snake_case and camelCase
 */

/**
 * Convert a snake_case object to camelCase
 */
export function snakeToCamel<T>(obj: any): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(snakeToCamel) as any;
  }

  return Object.keys(obj).reduce((result, key) => {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    result[camelKey] = snakeToCamel(obj[key]);
    return result;
  }, {} as any);
}

/**
 * Convert a camelCase object to snake_case
 */
export function camelToSnake<T>(obj: any): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(camelToSnake) as any;
  }

  return Object.keys(obj).reduce((result, key) => {
    const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    result[snakeKey] = camelToSnake(obj[key]);
    return result;
  }, {} as any);
}

/**
 * Normalize a personal record object to use consistent camelCase properties
 */
export function normalizePersonalRecord(record: any): any {
  if (!record) return null;
  
  return {
    id: record.id,
    userId: record.userId || record.user_id,
    exerciseId: record.exerciseId || record.exercise_id,
    exerciseName: record.exerciseName || record.exercise_name,
    weight: record.weight,
    previousWeight: record.previousWeight || record.previous_weight,
    recordedAt: record.recordedAt || record.recorded_at
  };
}
