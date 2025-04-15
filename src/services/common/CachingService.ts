
const CACHE_PREFIX = 'achievement_cache:';
const DEFAULT_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

export class CachingService {
  private static cache = new Map<string, CacheEntry<any>>();

  static set<T>(key: string, value: T, duration: number = DEFAULT_CACHE_DURATION): void {
    const expiresAt = Date.now() + duration;
    this.cache.set(`${CACHE_PREFIX}${key}`, { value, expiresAt });
  }

  static get<T>(key: string): T | null {
    const entry = this.cache.get(`${CACHE_PREFIX}${key}`) as CacheEntry<T>;
    
    if (!entry) return null;
    
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(`${CACHE_PREFIX}${key}`);
      return null;
    }
    
    return entry.value;
  }

  static clear(key?: string): void {
    if (key) {
      this.cache.delete(`${CACHE_PREFIX}${key}`);
    } else {
      this.cache.clear();
    }
  }

  static clearCategory(categoryPrefix: string): void {
    const fullPrefix = `${CACHE_PREFIX}${categoryPrefix}`;
    for (const key of this.cache.keys()) {
      if (key.startsWith(fullPrefix)) {
        this.cache.delete(key);
      }
    }
  }

  static refreshTTL(key: string, duration: number = DEFAULT_CACHE_DURATION): void {
    const entry = this.cache.get(`${CACHE_PREFIX}${key}`);
    if (entry) {
      entry.expiresAt = Date.now() + duration;
    }
  }
}
