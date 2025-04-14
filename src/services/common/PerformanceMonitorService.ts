export class PerformanceMonitorService {
  private static metrics: Map<string, number[]> = new Map();
  private static history: { key: string; duration: number; timestamp: number }[] = [];
  private static maxHistoryLength = 100;

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

    // Add to history
    this.history.unshift({
      key,
      duration,
      timestamp: Date.now()
    });

    // Keep history at reasonable size
    if (this.history.length > this.maxHistoryLength) {
      this.history.pop();
    }

    if (duration > 100) {
      console.warn(`Slow operation: ${key} took ${duration.toFixed(2)}ms`);
    }

    this.metrics.delete(key);
  }

  static getHistory() {
    return [...this.history];
  }

  static clearHistory() {
    this.history = [];
  }
}
