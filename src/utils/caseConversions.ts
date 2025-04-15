
/**
 * Normalizes a snake_case object to camelCase
 */
export function normalizeObjectKeys<T>(obj: any): T {
  if (!obj || typeof obj !== 'object') return obj;
  
  const result: any = {};
  
  Object.keys(obj).forEach(key => {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    result[camelKey] = obj[key];
  });
  
  return result as T;
}

/**
 * Normalize personal record data to ensure consistent property names
 */
export function normalizePersonalRecord(record: any): { weight: number; previousWeight: number; exerciseId: string } {
  return {
    weight: record.weight || 0,
    previousWeight: record.previous_weight || record.previousWeight || 0,
    exerciseId: record.exercise_id || record.exerciseId
  };
}
