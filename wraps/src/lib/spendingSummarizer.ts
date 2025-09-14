import { 
  Transaction, 
  Product, 
  SpendingSummary, 
  MerchantSummary, 
  CategoryBreakdown, 
  ProductSummary,
  PaymentMethodBreakdown,
  MonthlySpending 
} from '@/types/spending';
import { MerchantData } from './dataLoader';
import { categorizeUncategorizedProducts } from './aiCategorizer';
import { globalCategorizationCache } from './globalCache';

export class SpendingSummarizer {
  private useAIFallback: boolean;
  private apiKey?: string;

  constructor(options?: { useAIFallback?: boolean; apiKey?: string }) {
    this.useAIFallback = options?.useAIFallback ?? true;
    this.apiKey = options?.apiKey || process.env.ANTHROPIC_API_KEY;
  }
  
  /**
   * Categorize products based on their names
   */
  private categorizeProduct(productName: string): string {
    return this.getCategoryForProduct(productName);
  }

  /**
   * Summarize spending for a single merchant
   */
  private summarizeMerchant(merchantData: MerchantData): MerchantSummary {
    const { merchantId, merchantName, transactions } = merchantData;
    
    const totalSpent = transactions.reduce((sum, tx) => sum + tx.price.total, 0);
    const transactionCount = transactions.length;
    const averageOrderValue = totalSpent / transactionCount;

    // Category breakdown
    const categoryMap = new Map<string, {
      totalSpent: number;
      itemCount: number;
      products: Map<string, { totalSpent: number; quantity: number; prices: number[] }>;
    }>();

    // Payment method breakdown
    const paymentMap = new Map<string, { totalSpent: number; count: number; lastFour: string }>();

    // Monthly spending
    const monthlyMap = new Map<string, { totalSpent: number; count: number }>();

    transactions.forEach(transaction => {
      // Process payment methods (skip unknown brands)
      transaction.paymentMethods.forEach(payment => {
        const brand = payment.brand;
        const lastFour = payment.lastFour;
        
        // Skip payments with unknown/missing brand or lastFour
        if (!brand || brand === 'Unknown' || !lastFour || lastFour === 'Unknown') {
          return;
        }
        
        const key = `${brand}-${lastFour}`;
        const amount = parseFloat(payment.transactionAmount) || 0;
        const existing = paymentMap.get(key) || { totalSpent: 0, count: 0, lastFour };
        paymentMap.set(key, {
          totalSpent: existing.totalSpent + amount,
          count: existing.count + 1,
          lastFour
        });
      });

      // Process monthly spending
      try {
        let date: Date;
        
        // Handle different date formats
        if (typeof transaction.dateTime === 'number') {
          // Unix timestamp in milliseconds
          date = new Date(transaction.dateTime);
        } else if (typeof transaction.dateTime === 'string') {
          // Check if it's a numeric string (timestamp)
          const numericValue = Number(transaction.dateTime);
          if (!isNaN(numericValue) && numericValue > 1000000000000) {
            // Looks like a timestamp in milliseconds
            date = new Date(numericValue);
          } else {
            // Regular date string
            date = new Date(transaction.dateTime);
          }
        } else {
          date = new Date(transaction.dateTime);
        }

        if (!isNaN(date.getTime())) {
          const month = date.toISOString().slice(0, 7); // YYYY-MM
          const monthlyExisting = monthlyMap.get(month) || { totalSpent: 0, count: 0 };
          monthlyMap.set(month, {
            totalSpent: monthlyExisting.totalSpent + transaction.price.total,
            count: monthlyExisting.count + 1
          });
        }
      } catch (error) {
        // Silently skip invalid dates to avoid console spam
      }

      // Process products
      transaction.products.forEach(product => {
        const category = this.categorizeProduct(product.name);
        const categoryData = categoryMap.get(category) || {
          totalSpent: 0,
          itemCount: 0,
          products: new Map()
        };

        // Handle null/undefined values safely
        const productTotal = product.price?.total || 0;
        const productQuantity = product.quantity || 0;
        
        categoryData.totalSpent += productTotal;
        categoryData.itemCount += productQuantity;

        const productData = categoryData.products.get(product.name) || {
          totalSpent: 0,
          quantity: 0,
          prices: []
        };

        productData.totalSpent += productTotal;
        productData.quantity += productQuantity;
        
        // Only add unit price if it's valid
        if (product.price?.unitPrice && !isNaN(product.price.unitPrice)) {
          productData.prices.push(product.price.unitPrice);
        }

        categoryData.products.set(product.name, productData);
        categoryMap.set(category, categoryData);
      });
    });

    // Convert category map to CategoryBreakdown
    const categoryBreakdown: CategoryBreakdown[] = Array.from(categoryMap.entries()).map(([category, data]) => {
      const topProducts: ProductSummary[] = Array.from(data.products.entries())
        .map(([name, productData]) => ({
          name,
          totalSpent: productData.totalSpent,
          quantity: productData.quantity,
          averagePrice: productData.prices.length > 0 
            ? productData.prices.reduce((sum, price) => sum + price, 0) / productData.prices.length 
            : 0
        }))
        .sort((a, b) => b.totalSpent - a.totalSpent)
        .slice(0, 5);

      return {
        category,
        totalSpent: data.totalSpent,
        itemCount: data.itemCount,
        averagePrice: data.itemCount > 0 ? data.totalSpent / data.itemCount : 0,
        topProducts
      };
    }).sort((a, b) => b.totalSpent - a.totalSpent);

    // Convert payment map to PaymentMethodBreakdown
    const paymentMethodBreakdown: PaymentMethodBreakdown[] = Array.from(paymentMap.entries()).map(([key, data]) => {
      const brand = key.split('-')[0];
      return {
        brand,
        totalSpent: data.totalSpent,
        transactionCount: data.count,
        lastFour: data.lastFour
      };
    }).sort((a, b) => b.totalSpent - a.totalSpent);

    // Convert monthly map to MonthlySpending
    const monthlySpending: MonthlySpending[] = Array.from(monthlyMap.entries()).map(([month, data]) => ({
      month,
      totalSpent: data.totalSpent,
      transactionCount: data.count
    })).sort((a, b) => a.month.localeCompare(b.month));

    return {
      merchantId,
      merchantName,
      totalSpent,
      transactionCount,
      averageOrderValue,
      categoryBreakdown,
      paymentMethodBreakdown,
      monthlySpending
    };
  }

  /**
   * Get category from global cache or keyword-based categorization
   */
  private getCategoryForProduct(productName: string): string {
    // Check global cache first
    if (globalCategorizationCache.has(productName)) {
      return globalCategorizationCache.get(productName)!;
    }

    // Use keyword-based categorization
    return this.categorizeProductKeywords(productName);
  }

  /**
   * Original keyword-based categorization (renamed)
   */
  private categorizeProductKeywords(productName: string): string {
    const name = productName.toLowerCase();
    
    // Define category keywords
    const categories = {
      'Electronics': ['smart', 'phone', 'laptop', 'computer', 'headphones', 'speaker', 'camera', 'tablet', 'tv', 'monitor', 'charger', 'cable', 'bluetooth', 'wireless', 'gaming', 'xbox', 'playstation', 'nintendo', 'gpu', 'cpu', 'memory card', 'usb', 'hdmi'],
      'Food & Beverages': ['organic', 'milk', 'bread', 'cheese', 'meat', 'chicken', 'beef', 'pork', 'fish', 'salmon', 'vegetables', 'fruits', 'apple', 'banana', 'orange', 'coffee', 'tea', 'juice', 'water', 'soda', 'beer', 'wine', 'snack', 'chips', 'cookie', 'candy', 'chocolate'],
      'Health & Beauty': ['vitamins', 'supplement', 'skincare', 'lotion', 'shampoo', 'conditioner', 'toothpaste', 'deodorant', 'perfume', 'makeup', 'lipstick', 'mascara', 'foundation', 'sunscreen', 'moisturizer', 'serum', 'face wash', 'body wash'],
      'Household': ['detergent', 'soap', 'toilet paper', 'paper towel', 'cleaning', 'vacuum', 'trash bag', 'dish soap', 'laundry', 'fabric softener', 'air freshener', 'candle'],
      'Clothing': ['shirt', 'pants', 'dress', 'shoes', 'boots', 'sneakers', 'jacket', 'coat', 'sweater', 'jeans', 'shorts', 'underwear', 'socks', 'hat', 'gloves', 'scarf'],
      'Home & Garden': ['furniture', 'pillow', 'blanket', 'curtain', 'lamp', 'mirror', 'plant', 'garden', 'tool', 'hardware', 'paint', 'light bulb'],
      'Sports & Outdoors': ['fitness', 'exercise', 'yoga', 'bike', 'bicycle', 'camping', 'hiking', 'fishing', 'golf', 'tennis', 'basketball', 'football', 'soccer'],
      'Books & Media': ['book', 'novel', 'magazine', 'dvd', 'blu-ray', 'cd', 'vinyl', 'record'],
      'Baby & Kids': ['baby', 'infant', 'toddler', 'diaper', 'formula', 'toy', 'puzzle', 'game', 'stroller', 'car seat'],
      'Pet Supplies': ['dog', 'cat', 'pet', 'food', 'treat', 'toy', 'leash', 'collar', 'bed', 'litter']
    };
    
    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => name.includes(keyword))) {
        return category;
      }
    }
    
    return 'Other';
  }

  /**
   * Process "Other" products with AI categorization
   */
  private async processOtherProducts(otherProducts: string[]): Promise<void> {
    if (!this.useAIFallback || !this.apiKey || otherProducts.length === 0) {
      return;
    }

    try {
      console.log(`🤖 Claude categorizing ${otherProducts.length} "Other" products...`);
      
      const aiResults = await categorizeUncategorizedProducts(otherProducts, this.apiKey);
      
      // Cache the results in global cache
      globalCategorizationCache.setMultiple(aiResults);
      
      console.log(`✅ Claude categorized ${Object.keys(aiResults).length} products`);
    } catch (error) {
      console.warn('⚠️ Claude categorization failed, falling back to "Other":', error);
    }
  }

  /**
   * Create comprehensive spending summary from all merchant data
   */
  public async summarizeSpending(merchantDataArray: MerchantData[]): Promise<SpendingSummary> {
    // First pass: collect products that would be categorized as "Other" and aren't cached
    const uncachedOtherProducts = new Set<string>();
    
    if (this.useAIFallback && this.apiKey) {
      for (const merchantData of merchantDataArray) {
        for (const transaction of merchantData.transactions) {
          for (const product of transaction.products) {
            // Skip if already in global cache
            if (globalCategorizationCache.has(product.name)) {
              continue;
            }
            
            const keywordCategory = this.categorizeProductKeywords(product.name);
            if (keywordCategory === 'Other') {
              uncachedOtherProducts.add(product.name);
            }
          }
        }
      }

      // AI categorization for uncached "Other" products only
      if (uncachedOtherProducts.size > 0) {
        console.log(`🔄 Found ${uncachedOtherProducts.size} uncached "Other" products`);
        await this.processOtherProducts(Array.from(uncachedOtherProducts));
      } else {
        console.log(`✅ All products already cached, skipping AI categorization`);
      }
    }

    // Second pass: generate summaries with AI-enhanced categorization
    const merchantSummaries = merchantDataArray.map(data => this.summarizeMerchant(data));
    
    const totalSpent = merchantSummaries.reduce((sum, merchant) => sum + merchant.totalSpent, 0);
    const totalTransactions = merchantSummaries.reduce((sum, merchant) => sum + merchant.transactionCount, 0);
    const averageOrderValue = totalSpent / totalTransactions;

    // Aggregate top categories across all merchants
    const allCategories = new Map<string, { totalSpent: number; itemCount: number }>();
    merchantSummaries.forEach(merchant => {
      merchant.categoryBreakdown.forEach(category => {
        const existing = allCategories.get(category.category) || { totalSpent: 0, itemCount: 0 };
        allCategories.set(category.category, {
          totalSpent: existing.totalSpent + category.totalSpent,
          itemCount: existing.itemCount + category.itemCount
        });
      });
    });

    const topCategories: CategoryBreakdown[] = Array.from(allCategories.entries()).map(([category, data]) => ({
      category,
      totalSpent: data.totalSpent,
      itemCount: data.itemCount,
      averagePrice: data.totalSpent / data.itemCount,
      topProducts: [] // Simplified for overall summary
    })).sort((a, b) => b.totalSpent - a.totalSpent).slice(0, 10);

    // Aggregate monthly trends
    const allMonths = new Map<string, { totalSpent: number; transactionCount: number }>();
    merchantSummaries.forEach(merchant => {
      merchant.monthlySpending.forEach(month => {
        const existing = allMonths.get(month.month) || { totalSpent: 0, transactionCount: 0 };
        allMonths.set(month.month, {
          totalSpent: existing.totalSpent + month.totalSpent,
          transactionCount: existing.transactionCount + month.transactionCount
        });
      });
    });

    const monthlyTrends: MonthlySpending[] = Array.from(allMonths.entries()).map(([month, data]) => ({
      month,
      totalSpent: data.totalSpent,
      transactionCount: data.transactionCount
    })).sort((a, b) => a.month.localeCompare(b.month));

    // Aggregate payment methods
    const allPaymentMethods = new Map<string, { totalSpent: number; transactionCount: number; lastFour: string }>();
    merchantSummaries.forEach(merchant => {
      merchant.paymentMethodBreakdown.forEach(payment => {
        const key = `${payment.brand}-${payment.lastFour}`;
        const existing = allPaymentMethods.get(key) || { totalSpent: 0, transactionCount: 0, lastFour: payment.lastFour };
        allPaymentMethods.set(key, {
          totalSpent: existing.totalSpent + payment.totalSpent,
          transactionCount: existing.transactionCount + payment.transactionCount,
          lastFour: payment.lastFour
        });
      });
    });

    const paymentMethodSummary: PaymentMethodBreakdown[] = Array.from(allPaymentMethods.entries()).map(([key, data]) => {
      const brand = key.split('-')[0];
      return {
        brand,
        totalSpent: data.totalSpent,
        transactionCount: data.transactionCount,
        lastFour: data.lastFour
      };
    }).sort((a, b) => b.totalSpent - a.totalSpent);

    return {
      totalSpent,
      totalTransactions,
      averageOrderValue,
      merchantSummaries: merchantSummaries.sort((a, b) => b.totalSpent - a.totalSpent),
      topCategories,
      monthlyTrends,
      paymentMethodSummary
    };
  }

  getTopMerchants(
    summary: any, 
    orderBy: 'averageSpend' | 'totalSpend' = 'averageSpend', 
    limit: number = 5
  ) {
    // Calculate average spend per transaction for each merchant
    const merchantsWithAverage = summary.merchantSummaries.map((merchant: any) => {
      const averageSpend = merchant.transactionCount > 0 
        ? merchant.totalSpent / merchant.transactionCount 
        : 0;

      return {
        merchantName: merchant.merchantName,
        merchantId: merchant.merchantId,
        totalSpent: merchant.totalSpent,
        transactionCount: merchant.transactionCount,
        averageSpend: Math.round(averageSpend * 100) / 100,
        topCategory: merchant.categoryBreakdown.length > 0 
          ? merchant.categoryBreakdown[0].category 
          : 'Unknown',
        topCategorySpent: merchant.categoryBreakdown.length > 0 
          ? merchant.categoryBreakdown[0].totalSpent 
          : 0
      };
    });

    // Sort based on the orderBy parameter
    const sortedMerchants = orderBy === 'totalSpend'
      ? merchantsWithAverage.sort((a: any, b: any) => b.totalSpent - a.totalSpent)
      : merchantsWithAverage.sort((a: any, b: any) => b.averageSpend - a.averageSpend);

    // Get top N merchants
    const topMerchants = sortedMerchants.slice(0, limit);

    // Calculate overall stats
    const totalMerchants = merchantsWithAverage.length;
    const overallAverageSpend = summary.totalSpent / summary.totalTransactions;
    const aboveAverage = merchantsWithAverage.filter((m: any) => m.averageSpend > overallAverageSpend).length;
    const belowAverage = totalMerchants - aboveAverage;

    return {
      topMerchants,
      metadata: {
        orderBy,
        limit,
        totalMerchants,
        overallAverageSpend: Math.round(overallAverageSpend * 100) / 100,
        merchantsAboveAverage: aboveAverage,
        merchantsBelowAverage: belowAverage
      },
      insights: {
        highestAverageSpend: topMerchants[0]?.averageSpend || 0,
        lowestAverageSpend: topMerchants[topMerchants.length - 1]?.averageSpend || 0,
        averageSpendRange: topMerchants.length > 1 
          ? (topMerchants[0]?.averageSpend || 0) - (topMerchants[topMerchants.length - 1]?.averageSpend || 0)
          : 0
      }
    };
  }
}
