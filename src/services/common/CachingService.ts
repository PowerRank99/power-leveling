
type CacheEntry<T> = {
  data: T;
  timestamp: number;
};

export class CachingService {
  private static caches: Map<string, CacheEntry<any>> = new Map();
  
  static set<T>(key: string, data: T, duration: number): void {
    this.caches.set(key, {
      data,
      timestamp: Date.now() + duration
    });
  }
  
  static get<T>(key: string): T | null {
    const entry = this.caches.get(key);
    if (!entry) return null;
    
    if (Date.now() > entry.timestamp) {
      this.caches.delete(key);
      return null;
    }
    
    return entry.data as T;
  }
  
  static clear(key?: string): void {
    if (key) {
      this.caches.delete(key);
    } else {
      this.caches.clear();
    }
  }
}
