
type CacheEntry<T> = {
  data: T;
  timestamp: number;
};

export class CachingService {
  private static caches: Map<string, CacheEntry<any>> = new Map();
  private static logger: Console = console;
  
  static set<T>(key: string, data: T, duration: number): void {
    try {
      this.caches.set(key, {
        data,
        timestamp: Date.now() + duration
      });
      this.logger.debug(`Cache set: ${key}, duration: ${duration}ms`);
    } catch (error) {
      this.logger.error('Error setting cache', { key, error });
    }
  }
  
  static get<T>(key: string): T | null {
    const entry = this.caches.get(key);
    if (!entry) return null;
    
    if (Date.now() > entry.timestamp) {
      this.caches.delete(key);
      this.logger.debug(`Cache expired: ${key}`);
      return null;
    }
    
    return entry.data as T;
  }
  
  static clear(key?: string): void {
    if (key) {
      this.caches.delete(key);
      this.logger.debug(`Cache cleared for key: ${key}`);
    } else {
      this.caches.clear();
      this.logger.debug('All caches cleared');
    }
  }

  // New method to track cache size and performance
  static getCacheStats() {
    return {
      size: this.caches.size,
      keys: Array.from(this.caches.keys())
    };
  }
}
