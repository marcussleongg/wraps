import { DataLoader } from './dataLoader';
import { SpendingSummarizer } from './spendingSummarizer';
import { globalCategorizationCache } from './globalCache';

let initializationStarted = false;

/**
 * Initialize AI categorization immediately when the server starts
 * This ensures zero loading time for any API calls
 */
async function initializeAICategorization() {
  if (initializationStarted) return;
  initializationStarted = true;

  if (!process.env.ANTHROPIC_API_KEY) {
    console.log('⚠️ No ANTHROPIC_API_KEY found - AI categorization disabled');
    return;
  }

  try {
    console.log('🚀 STARTUP: Initializing AI categorization...');
    const startTime = Date.now();
    
    const dataLoader = new DataLoader();
    const summarizer = new SpendingSummarizer({
      useAIFallback: true,
      apiKey: process.env.ANTHROPIC_API_KEY
    });

    const allMerchantData = dataLoader.loadAllMerchantData();
    await summarizer.summarizeSpending(allMerchantData);
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`✅ STARTUP: AI categorization completed in ${duration}s! Cached ${globalCategorizationCache.size()} products`);
    console.log(`🎯 READY: All APIs will now respond instantly with enhanced categories`);
    
  } catch (error) {
    console.error('❌ STARTUP: AI categorization failed:', error);
  }
}

// Start initialization immediately when this module is imported
initializeAICategorization();

export { initializeAICategorization };
