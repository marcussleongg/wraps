import { NextResponse } from 'next/server';
import { DataLoader } from '@/lib/dataLoader';
import { SpendingSummarizer } from '@/lib/spendingSummarizer';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const merchantId = searchParams.get('merchantId');
    const topN = parseInt(searchParams.get('limit') || '8'); // Show top 8, group rest as "Other"

    const dataLoader = new DataLoader();
    const summarizer = new SpendingSummarizer({
      useAIFallback: true,  // Enable to read from cache
      apiKey: undefined     // No API key = won't trigger Claude calls
    });

    let data;
    if (merchantId) {
      // Single merchant data
      const merchantData = dataLoader.loadMerchantData(parseInt(merchantId));
      if (!merchantData) {
        return NextResponse.json(
          { error: 'Merchant not found' },
          { status: 404 }
        );
      }
      data = [merchantData];
    } else {
      // All merchant data
      data = dataLoader.loadAllMerchantData();
    }

    const summary = await summarizer.summarizeSpending(data);

    // Pie chart for category spending
    const categories = summary.topCategories;
    const topCategories = categories.slice(0, topN);
    const otherCategories = categories.slice(topN);
    
    const otherTotal = otherCategories.reduce((sum, cat) => sum + cat.totalSpent, 0);
    const otherItemCount = otherCategories.reduce((sum, cat) => sum + cat.itemCount, 0);
    
    const pieData = topCategories.map(category => ({
      name: category.category,
      value: Math.round(category.totalSpent * 100) / 100,
      percentage: Math.round((category.totalSpent / summary.totalSpent) * 100 * 100) / 100,
      itemCount: category.itemCount,
      averagePrice: Math.round(category.averagePrice * 100) / 100,
      color: getCategoryColor(category.category)
    }));

    // Add "Other" slice if there are remaining categories
    if (otherTotal > 0) {
      pieData.push({
        name: `Other Categories (${otherCategories.length})`,
        value: Math.round(otherTotal * 100) / 100,
        percentage: Math.round((otherTotal / summary.totalSpent) * 100 * 100) / 100,
        itemCount: otherItemCount,
        averagePrice: otherItemCount > 0 ? Math.round((otherTotal / otherItemCount) * 100) / 100 : 0,
        color: '#94a3b8' // Gray for "Other"
      });
    }

    return NextResponse.json({
      data: pieData,
      total: summary.totalSpent,
      totalItems: pieData.reduce((sum, item) => sum + item.itemCount, 0),
      metadata: {
        merchantId: merchantId || 'all',
        topN,
        totalCategories: summary.topCategories.length
      }
    });

  } catch (error) {
    console.error('Error generating pie chart data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to get predefined category colors
function getCategoryColor(category: string): string {
  const categoryColors: { [key: string]: string } = {
    'Electronics': '#3b82f6',      // Blue
    'Food & Beverages': '#10b981', // Green
    'Health & Beauty': '#ec4899',  // Pink
    'Household': '#f59e0b',        // Amber
    'Clothing': '#8b5cf6',         // Purple
    'Home & Garden': '#84cc16',    // Lime
    'Sports & Outdoors': '#06b6d4', // Cyan
    'Books & Media': '#6366f1',    // Indigo
    'Baby & Kids': '#f97316',      // Orange
    'Pet Supplies': '#14b8a6',     // Teal
    'Other': '#6b7280'             // Gray
  };
  
  return categoryColors[category] || '#9ca3af'; // Default gray
}
