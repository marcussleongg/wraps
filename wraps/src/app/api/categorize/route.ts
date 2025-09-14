import { NextRequest, NextResponse } from 'next/server';
import { DataLoader } from '@/lib/dataLoader';
import { AICategorizer, CategoryMapping } from '@/lib/aiCategorizer';
import { SpendingSummarizer } from '@/lib/spendingSummarizer';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { apiKey, dryRun = true } = body;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key is required' },
        { status: 400 }
      );
    }

    // Load all data and find uncategorized products
    const dataLoader = new DataLoader();
    const summarizer = new SpendingSummarizer();
    const allMerchantData = dataLoader.loadAllMerchantData();

    // Get products currently categorized as "Other"
    const otherProducts: string[] = [];
    
    for (const merchantData of allMerchantData) {
      for (const transaction of merchantData.transactions) {
        for (const product of transaction.products) {
          const category = (summarizer as any).categorizeProduct(product.name);
          if (category === 'Other') {
            otherProducts.push(product.name);
          }
        }
      }
    }

    // Remove duplicates
    const uniqueOtherProducts = [...new Set(otherProducts)];
    
    console.log(`Found ${uniqueOtherProducts.length} unique products in "Other" category`);

    if (dryRun) {
      // Return statistics without calling AI
      const costEstimate = AICategorizer.getCostEstimate(uniqueOtherProducts.length);
      
      return NextResponse.json({
        dryRun: true,
        stats: {
          totalProducts: uniqueOtherProducts.length,
          estimatedCost: costEstimate,
          provider: 'claude',
          batchSize: 50,
          estimatedBatches: Math.ceil(uniqueOtherProducts.length / 50)
        },
        sampleProducts: uniqueOtherProducts.slice(0, 10)
      });
    }

    // Actual Claude AI categorization
    const config = {
      apiKey,
      batchSize: 50,
      maxRetries: 3
    };

    const aiCategorizer = new AICategorizer(config);
    const results = await aiCategorizer.categorizeOtherProducts(uniqueOtherProducts);

    // Generate statistics
    const categoryStats: Record<string, number> = {};
    for (const category of Object.values(results)) {
      categoryStats[category] = (categoryStats[category] || 0) + 1;
    }

    return NextResponse.json({
      success: true,
      stats: {
        totalCategorized: Object.keys(results).length,
        categoryBreakdown: categoryStats,
        provider: 'claude',
        completedAt: new Date().toISOString()
      },
      results
    });

  } catch (error) {
    console.error('Error in AI categorization:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Get current "Other" category statistics
    const dataLoader = new DataLoader();
    const summarizer = new SpendingSummarizer();
    const allMerchantData = dataLoader.loadAllMerchantData();

    let otherCount = 0;
    let totalCount = 0;
    const sampleOtherProducts: string[] = [];

    for (const merchantData of allMerchantData) {
      for (const transaction of merchantData.transactions) {
        for (const product of transaction.products) {
          totalCount++;
          const category = (summarizer as any).categorizeProduct(product.name);
          if (category === 'Other') {
            otherCount++;
            if (sampleOtherProducts.length < 20) {
              sampleOtherProducts.push(product.name);
            }
          }
        }
      }
    }

    return NextResponse.json({
      currentStats: {
        totalProducts: totalCount,
        otherProducts: otherCount,
        categorizedProducts: totalCount - otherCount,
        otherPercentage: ((otherCount / totalCount) * 100).toFixed(1)
      },
      sampleOtherProducts,
      costEstimate: AICategorizer.getCostEstimate(otherCount)
    });

  } catch (error) {
    console.error('Error getting categorization stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
