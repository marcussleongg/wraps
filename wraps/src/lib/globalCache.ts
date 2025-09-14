/**
 * Global in-memory cache for AI categorizations
 * Persists across API requests within the same Node.js process
 */
class GlobalCategorizationCache {
  private static instance: GlobalCategorizationCache;
  private cache: Map<string, string> = new Map();

  private constructor() {}

  static getInstance(): GlobalCategorizationCache {
    if (!GlobalCategorizationCache.instance) {
      GlobalCategorizationCache.instance = new GlobalCategorizationCache();
    }
    return GlobalCategorizationCache.instance;
  }

  set(productName: string, category: string): void {
    this.cache.set(productName, category);
  }

  get(productName: string): string | undefined {
    return this.cache.get(productName);
  }

  has(productName: string): boolean {
    return this.cache.has(productName);
  }

  setMultiple(categorizations: Record<string, string>): void {
    for (const [productName, category] of Object.entries(categorizations)) {
      this.cache.set(productName, category);
    }
  }

  size(): number {
    return this.cache.size;
  }

  clear(): void {
    this.cache.clear();
  }

  // Get all cached categorizations
  getAll(): Record<string, string> {
    const result: Record<string, string> = {};
    for (const [key, value] of this.cache.entries()) {
      result[key] = value;
    }
    return result;
  }
}

// Export singleton instance
export const globalCategorizationCache = GlobalCategorizationCache.getInstance();
