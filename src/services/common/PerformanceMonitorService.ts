
export class PerformanceMonitorService {
  private static metrics: Map<string, number[]> = new Map();

  static startMeasure(key: string) {
    const startTime = performance.now();
    this.metrics.set(key, [startTime]);
  }

  static endMeasure(key: string) {
    const times = this.metrics.get(key);
    if (!times || times.length === 0) return;

    const startTime = times[0];
    const endTime = performance.now();
    const duration = endTime - startTime;

    if (duration > 100) {
      console.warn(`Slow operation: ${key} took ${duration.toFixed(2)}ms`);
    }

    this.metrics.delete(key);
  }
}
