// AI-powered categorization for products that don't match keyword rules

export interface AICategorizerConfig {
  apiKey: string;
  batchSize: number;
  maxRetries: number;
  model?: string;
}

export interface CategoryMapping {
  [productName: string]: string;
}

export class AICategorizer {
  private config: AICategorizerConfig;
  private availableCategories = [
    'Electronics',
    'Food & Beverages', 
    'Health & Beauty',
    'Household',
    'Clothing',
    'Home & Garden',
    'Sports & Outdoors',
    'Books & Media',
    'Baby & Kids',
    'Pet Supplies',
    'Automotive',
    'Office Supplies',
    'Jewelry & Accessories',
    'Other'
  ];

  constructor(config: AICategorizerConfig) {
    this.config = {
      ...config,
      model: config.model || 'claude-sonnet-4-20250514'
    };
  }

  /**
   * Categorize products that couldn't be classified by keyword rules
   */
  async categorizeOtherProducts(productNames: string[]): Promise<CategoryMapping> {
    console.log(`🤖 AI categorizing ${productNames.length} products...`);
    
    const results: CategoryMapping = {};
    const batches = this.createBatches(productNames);
    
    let processedCount = 0;
    
    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      console.log(`Processing batch ${i + 1}/${batches.length} (${batch.length} products)`);
      
      try {
        const batchResults = await this.categorizeBatch(batch);
        Object.assign(results, batchResults);
        processedCount += batch.length;
        
        console.log(`✅ Completed ${processedCount}/${productNames.length} products`);
        
        // Small delay to avoid rate limiting
        if (i < batches.length - 1) {
          await this.delay(1000);
        }
      } catch (error) {
        console.error(`❌ Error processing batch ${i + 1}:`, error);
        
        // Fallback: mark batch products as 'Other'
        for (const productName of batch) {
          results[productName] = 'Other';
        }
      }
    }
    
    return results;
  }

  /**
   * Create batches of products for processing
   */
  private createBatches(productNames: string[]): string[][] {
    const batches: string[][] = [];
    
    for (let i = 0; i < productNames.length; i += this.config.batchSize) {
      batches.push(productNames.slice(i, i + this.config.batchSize));
    }
    
    return batches;
  }

  /**
   * Categorize a single batch of products
   */
  private async categorizeBatch(productNames: string[]): Promise<CategoryMapping> {
    const prompt = this.buildPrompt(productNames);
    
    let attempt = 0;
    while (attempt < this.config.maxRetries) {
      try {
        return await this.callClaude(prompt);
      } catch (error) {
        attempt++;
        if (attempt >= this.config.maxRetries) {
          throw error;
        }
        
        console.warn(`Claude API attempt ${attempt} failed, retrying...`);
        await this.delay(2000 * attempt); // Exponential backoff
      }
    }
    
    throw new Error('Max retries exceeded');
  }

  /**
   * Build the categorization prompt
   */
  private buildPrompt(productNames: string[]): string {
    return `You are a product categorization expert. Categorize each product into the most appropriate category.

Available categories:
${this.availableCategories.join(', ')}

Products to categorize:
${productNames.map((name, idx) => `${idx + 1}. ${name}`).join('\n')}

Instructions:
- Return ONLY a valid JSON object
- Format: {"product_name": "category"}
- Use exact category names from the list above
- If uncertain, use "Other"
- Be consistent with similar products

JSON response:`;
  }

  /**
   * Call Claude API with latest format
   */
  private async callClaude(prompt: string): Promise<CategoryMapping> {
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.config.apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: this.config.model,
          max_tokens: 4096,
          temperature: 0.1,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ]
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Claude API error ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      
      // Handle the response format correctly
      if (!data.content || !Array.isArray(data.content) || data.content.length === 0) {
        throw new Error('Invalid response format from Claude API');
      }
      
      const content = data.content[0].text;
      return this.parseResponse(content);
      
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Claude API call failed: ${error.message}`);
      }
      throw new Error('Unknown error calling Claude API');
    }
  }


  /**
   * Parse AI response into category mapping
   */
  private parseResponse(content: string): CategoryMapping {
    try {
      // Extract JSON from response (handle cases where AI adds extra text)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }
      
      const parsed = JSON.parse(jsonMatch[0]);
      
      // Validate categories
      const validated: CategoryMapping = {};
      for (const [product, category] of Object.entries(parsed)) {
        if (typeof category === 'string' && this.availableCategories.includes(category)) {
          validated[product] = category;
        } else {
          console.warn(`Invalid category "${category}" for product "${product}", using "Other"`);
          validated[product] = 'Other';
        }
      }
      
      return validated;
    } catch (error) {
      console.error('Failed to parse AI response:', content);
      throw new Error('Invalid response format from AI');
    }
  }

  /**
   * Utility delay function
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get cost estimate for categorizing products with Claude
   */
  static getCostEstimate(productCount: number, batchSize: number = 50): string {
    const batches = Math.ceil(productCount / batchSize);
    
    // Claude 3.5 Sonnet pricing (as of 2024):
    // Input: $3.00 / million tokens
    // Output: $15.00 / million tokens
    // Estimate ~150 input tokens + 100 output tokens per batch
    const inputTokensPerBatch = 150;
    const outputTokensPerBatch = 100;
    
    const totalInputTokens = batches * inputTokensPerBatch;
    const totalOutputTokens = batches * outputTokensPerBatch;
    
    const inputCost = (totalInputTokens / 1000000) * 3.00;
    const outputCost = (totalOutputTokens / 1000000) * 15.00;
    const totalCost = inputCost + outputCost;
    
    return `$${totalCost.toFixed(2)} - $${(totalCost * 1.5).toFixed(2)}`;
  }
}

// Default configuration for Claude
export const defaultConfig: AICategorizerConfig = {
  apiKey: process.env.ANTHROPIC_API_KEY || '',
  batchSize: 50,
  maxRetries: 3,
  model: 'claude-sonnet-4-20250514'
};

/**
 * Quick setup function for Claude AI categorization
 */
export async function categorizeUncategorizedProducts(
  productNames: string[],
  apiKey: string,
  model: string = 'claude-sonnet-4-20250514'
): Promise<CategoryMapping> {
  const config: AICategorizerConfig = {
    apiKey,
    batchSize: 50,
    maxRetries: 3,
    model
  };
  
  const categorizer = new AICategorizer(config);
  return await categorizer.categorizeOtherProducts(productNames);
}
