/**
 * Utility for monitoring and logging performance metrics
 */

interface PerformanceMetric {
  componentId: string;
  phase: string;
  actualDuration: number;
  baseDuration: number;
  startTime: number;
  commitTime: number;
  timestamp?: number;
}

interface TimingMetric {
  name: string;
  startTime: number;
  endTime: number;
  duration: number;
}

// Store recent performance metrics
const recentMetrics: PerformanceMetric[] = [];
const recentTimings: TimingMetric[] = [];

// Maximum number of metrics to store
const MAX_METRICS = 100;

// Threshold for slow renders (in milliseconds)
const SLOW_RENDER_THRESHOLD = 50;

/**
 * Log a React Profiler render metric
 */
export function logPerformanceMetric(metric: PerformanceMetric): void {
  // Add timestamp
  const enrichedMetric = {
    ...metric,
    timestamp: Date.now()
  };
  
  // Add to recent metrics, keeping only the latest MAX_METRICS
  recentMetrics.unshift(enrichedMetric);
  if (recentMetrics.length > MAX_METRICS) {
    recentMetrics.pop();
  }
  
  // Log slow renders to console in development
  if (import.meta.env.DEV && metric.actualDuration > SLOW_RENDER_THRESHOLD) {
    console.warn(
      `[Performance] Slow render detected: ${metric.componentId} took ${metric.actualDuration.toFixed(2)}ms`
    );
  }
}

/**
 * Start timing an operation
 */
export function startTiming(name: string): number {
  return performance.now();
}

/**
 * End timing an operation and log the result
 */
export function endTiming(name: string, startTime: number): number {
  const endTime = performance.now();
  const duration = endTime - startTime;
  
  const timingMetric = {
    name,
    startTime,
    endTime,
    duration
  };
  
  // Add to recent timings, keeping only the latest MAX_METRICS
  recentTimings.unshift(timingMetric);
  if (recentTimings.length > MAX_METRICS) {
    recentTimings.pop();
  }
  
  // Log slow operations to console in development
  if (import.meta.env.DEV && duration > 100) {
    console.warn(
      `[Performance] Slow operation: ${name} took ${duration.toFixed(2)}ms`
    );
  }
  
  return duration;
}

/**
 * Get recent performance metrics
 */
export function getRecentMetrics(): PerformanceMetric[] {
  return [...recentMetrics];
}

/**
 * Get recent timing metrics
 */
export function getRecentTimings(): TimingMetric[] {
  return [...recentTimings];
}

/**
 * Clear all stored metrics
 */
export function clearMetrics(): void {
  recentMetrics.length = 0;
  recentTimings.length = 0;
}
