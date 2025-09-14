import { DataLoader } from './dataLoader';
import { SpendingSummarizer } from './spendingSummarizer';
import { globalCategorizationCache } from './globalCache';

let isPreloading = false;
let preloadPromise: Promise<void> | null = null;

/**
 * Pre-load AI categorization in the background
 * This ensures categories are ready for all APIs
 */
async function preloadCategorization(): Promise<void> {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.log('⚠️ No API key found, skipping AI categorization preload');
    return;
  }

  try {
    console.log('🚀 Starting background AI categorization...');
    
    const dataLoader = new DataLoader();
    const summarizer = new SpendingSummarizer({
      useAIFallback: true,
      apiKey: process.env.ANTHROPIC_API_KEY
    });

    const allMerchantData = dataLoader.loadAllMerchantData();
    
    // This will run Claude categorization and populate the global cache
    await summarizer.summarizeSpending(allMerchantData);
    
    console.log(`✅ Background AI categorization completed! Cached ${globalCategorizationCache.size()} products`);
  } catch (error) {
    console.error('❌ Background AI categorization failed:', error);
  }
}

/**
 * Start background categorization if not already running
 * Can be called multiple times safely
 */
export function ensureCategorization(): Promise<void> {
  if (!isPreloading && !preloadPromise) {
    isPreloading = true;
    preloadPromise = preloadCategorization().finally(() => {
      isPreloading = false;
    });
  }
  
  return preloadPromise || Promise.resolve();
}

/**
 * Start categorization in fire-and-forget mode
 * Returns immediately, categorization happens in background
 */
export function startBackgroundCategorization(): void {
  if (!isPreloading && globalCategorizationCache.size() === 0) {
    ensureCategorization(); // Fire and forget
  }
}
