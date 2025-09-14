import { Product } from '@/types/spending';

interface CategoryRule {
  category: string;
  keywords: string[];
  priority: number; // Higher priority wins conflicts
}

export class SmartProductCategorizer {
  private rules: CategoryRule[] = [
    // High-priority specific rules
    { category: 'Electronics', keywords: ['iphone', 'samsung galaxy', 'macbook', 'ipad', 'airpods', 'nintendo switch', 'playstation', 'xbox'], priority: 10 },
    { category: 'Food & Beverages', keywords: ['coca cola', 'pepsi', 'starbucks', 'dunkin', 'pizza', 'burger', 'sandwich'], priority: 10 },
    
    // Medium-priority brand rules
    { category: 'Electronics', keywords: ['apple', 'samsung', 'sony', 'lg', 'dell', 'hp', 'microsoft', 'google', 'amazon echo', 'alexa'], priority: 8 },
    { category: 'Health & Beauty', keywords: ['loreal', 'maybelline', 'revlon', 'neutrogena', 'olay', 'dove', 'pantene'], priority: 8 },
    { category: 'Baby & Kids', keywords: ['pampers', 'huggies', 'gerber', 'fisher price', 'lego', 'barbie', 'hot wheels'], priority: 8 },
    
    // Standard keyword rules (your existing ones)
    { category: 'Electronics', keywords: ['smart', 'phone', 'laptop', 'computer', 'headphones', 'speaker', 'camera', 'tablet', 'tv', 'monitor', 'charger', 'cable', 'bluetooth', 'wireless', 'gaming', 'gpu', 'cpu', 'memory card', 'usb', 'hdmi'], priority: 5 },
    { category: 'Food & Beverages', keywords: ['organic', 'milk', 'bread', 'cheese', 'meat', 'chicken', 'beef', 'pork', 'fish', 'salmon', 'vegetables', 'fruits', 'apple', 'banana', 'orange', 'coffee', 'tea', 'juice', 'water', 'soda', 'beer', 'wine', 'snack', 'chips', 'cookie', 'candy', 'chocolate'], priority: 5 },
    { category: 'Health & Beauty', keywords: ['vitamins', 'supplement', 'skincare', 'lotion', 'shampoo', 'conditioner', 'toothpaste', 'deodorant', 'perfume', 'makeup', 'lipstick', 'mascara', 'foundation', 'sunscreen', 'moisturizer', 'serum', 'face wash', 'body wash'], priority: 5 },
    { category: 'Household', keywords: ['detergent', 'soap', 'toilet paper', 'paper towel', 'cleaning', 'vacuum', 'trash bag', 'dish soap', 'laundry', 'fabric softener', 'air freshener', 'candle'], priority: 5 },
    { category: 'Clothing', keywords: ['shirt', 'pants', 'dress', 'shoes', 'boots', 'sneakers', 'jacket', 'coat', 'sweater', 'jeans', 'shorts', 'underwear', 'socks', 'hat', 'gloves', 'scarf'], priority: 5 },
    { category: 'Home & Garden', keywords: ['furniture', 'pillow', 'blanket', 'curtain', 'lamp', 'mirror', 'plant', 'garden', 'tool', 'hardware', 'paint', 'light bulb'], priority: 5 },
    { category: 'Sports & Outdoors', keywords: ['fitness', 'exercise', 'yoga', 'bike', 'bicycle', 'camping', 'hiking', 'fishing', 'golf', 'tennis', 'basketball', 'football', 'soccer'], priority: 5 },
    { category: 'Books & Media', keywords: ['book', 'novel', 'magazine', 'dvd', 'blu-ray', 'cd', 'vinyl', 'record'], priority: 5 },
    { category: 'Baby & Kids', keywords: ['baby', 'infant', 'toddler', 'diaper', 'formula', 'toy', 'puzzle', 'game', 'stroller', 'car seat'], priority: 5 },
    { category: 'Pet Supplies', keywords: ['dog', 'cat', 'pet', 'food', 'treat', 'toy', 'leash', 'collar', 'bed', 'litter'], priority: 5 },
    
    // Low-priority generic rules
    { category: 'Food & Beverages', keywords: ['oz', 'lb', 'pack', 'count', 'bottle', 'can'], priority: 1 },
  ];

  private uncategorizedProducts: string[] = [];

  /**
   * Categorize a single product using rule-based system
   */
  categorizeProduct(productName: string): string {
    const name = productName.toLowerCase();
    let bestMatch: { category: string; priority: number } | null = null;

    for (const rule of this.rules) {
      if (rule.keywords.some(keyword => name.includes(keyword))) {
        if (!bestMatch || rule.priority > bestMatch.priority) {
          bestMatch = { category: rule.category, priority: rule.priority };
        }
      }
    }

    if (bestMatch) {
      return bestMatch.category;
    }

    // Track uncategorized for later AI processing
    this.uncategorizedProducts.push(productName);
    return 'Other';
  }

  /**
   * Get products that couldn't be categorized
   */
  getUncategorizedProducts(): string[] {
    return [...this.uncategorizedProducts];
  }

  /**
   * Clear uncategorized list
   */
  clearUncategorized(): void {
    this.uncategorizedProducts = [];
  }

  /**
   * Add new rules from AI learning
   */
  addRule(category: string, keywords: string[], priority: number = 5): void {
    this.rules.push({ category, keywords, priority });
    // Sort by priority descending
    this.rules.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Batch categorize products with AI fallback
   */
  async batchCategorizeWithAI(
    products: Product[], 
    aiCategorizer?: (productNames: string[]) => Promise<Record<string, string>>
  ): Promise<Record<string, string>> {
    const results: Record<string, string> = {};
    
    // First pass: Rule-based categorization
    this.clearUncategorized();
    
    for (const product of products) {
      results[product.name] = this.categorizeProduct(product.name);
    }

    // Second pass: AI for uncategorized items
    if (aiCategorizer && this.uncategorizedProducts.length > 0) {
      console.log(`Using AI to categorize ${this.uncategorizedProducts.length} products`);
      
      const aiResults = await aiCategorizer(this.uncategorizedProducts);
      
      // Update results with AI categorization
      for (const [productName, category] of Object.entries(aiResults)) {
        results[productName] = category;
      }
    }

    return results;
  }

  /**
   * Generate statistics about categorization
   */
  getStats(results: Record<string, string>): Record<string, number> {
    const stats: Record<string, number> = {};
    
    for (const category of Object.values(results)) {
      stats[category] = (stats[category] || 0) + 1;
    }

    return stats;
  }
}

/**
 * Example AI categorizer function (can use OpenAI, Claude, or local models)
 */
export async function aiCategorizer(productNames: string[]): Promise<Record<string, string>> {
  // This would call your preferred AI service
  // For now, return empty object
  return {};
}

/**
 * Cost-effective batch processor for AI categorization
 */
export async function batchAICategorizer(
  productNames: string[], 
  batchSize: number = 50
): Promise<Record<string, string>> {
  const results: Record<string, string> = {};
  
  for (let i = 0; i < productNames.length; i += batchSize) {
    const batch = productNames.slice(i, i + batchSize);
    
    // Example prompt for batch processing
    const prompt = `Categorize these products into one of: Electronics, Food & Beverages, Health & Beauty, Household, Clothing, Home & Garden, Sports & Outdoors, Books & Media, Baby & Kids, Pet Supplies, Other.

Products:
${batch.map((name, idx) => `${idx + 1}. ${name}`).join('\n')}

Return as JSON: {"product_name": "category"}`;

    // Here you'd call your AI service
    // const response = await callAIService(prompt);
    
    // For now, simulate response
    for (const product of batch) {
      results[product] = 'Other';
    }
  }
  
  return results;
}
