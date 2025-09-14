interface ImagePrompt {
  category: string;
  prompt: string;
  style: string;
}

export interface GeneratedImage {
  url: string;
  alt: string;
  category: string;
}

export class ImageGenerationService {
  private static readonly GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
  private static readonly POLLINATIONS_API_URL = 'https://image.pollinations.ai/prompt';
  private static readonly CACHE_KEY = 'spending_story_images';

  // Generate image prompt using Groq
  static async generateImagePrompt(category: string, context: string): Promise<ImagePrompt> {
    try {
      const groqApiKey = process.env.GROQ_API_KEY;
      if (!groqApiKey) {
        throw new Error('GROQ_API_KEY not found in environment variables');
      }

      const systemPrompt = `You are a creative image prompt generator for a spending analytics app. 
      Generate a minimalistic, non-distracting background image prompt for spending categories.
      The image should be subtle, professional, and complement financial data visualization.
      Focus on abstract concepts, patterns, or subtle representations of the category.
      Keep descriptions under 50 words and avoid text, logos, or busy elements.`;

      const userPrompt = `Generate a minimalistic background image prompt for the spending category: "${category}" 
      in the context of: "${context}". 
      The image should be suitable as a subtle background for financial data display.`;

      const response = await fetch(this.GROQ_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${groqApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.1-70b-versatile',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          max_tokens: 100,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error(`Groq API error: ${response.statusText}`);
      }

      const data = await response.json();
      const generatedPrompt = data.choices[0]?.message?.content || '';

      return {
        category,
        prompt: generatedPrompt,
        style: 'minimalistic, abstract, financial'
      };
    } catch (error) {
      console.error('Error generating image prompt:', error);
      // Fallback to predefined prompts
      return this.getFallbackPrompt(category);
    }
  }

  // Get image from Pollinations.ai based on prompt
  static async getImageFromPrompt(prompt: ImagePrompt): Promise<GeneratedImage> {
    try {
      // Convert prompt to Pollinations.ai format
      const pollinationsPrompt = this.convertPromptToPollinationsFormat(prompt.prompt);
      
      // Pollinations.ai URL with parameters
      const imageUrl = `${this.POLLINATIONS_API_URL}/${encodeURIComponent(pollinationsPrompt)}?width=800&height=600&model=flux&nologo=true&dark=true`;

      // Test if the image URL is accessible
      const response = await fetch(imageUrl, { method: 'HEAD' });
      if (!response.ok) {
        throw new Error(`Pollinations.ai API error: ${response.statusText}`);
      }

      return {
        url: imageUrl,
        alt: `AI-generated background image for ${prompt.category}`,
        category: prompt.category
      };
    } catch (error) {
      console.error('Error fetching image from Pollinations.ai:', error);
      // Fallback to default background
      return this.getDefaultImage(prompt.category);
    }
  }

  // Convert AI prompt to Pollinations.ai format
  private static convertPromptToPollinationsFormat(prompt: string): string {
    // Clean and optimize prompt for Pollinations.ai
    const cleanedPrompt = prompt
      .toLowerCase()
      .replace(/[^\w\s,.-]/g, '') // Remove special chars except commas, dots, hyphens
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
    
    // Add style modifiers for better results
    const styleModifiers = ', minimalistic, abstract, professional, subtle, background, financial theme, dark tones, blue gradient';
    
    return cleanedPrompt + styleModifiers;
  }

  // Convert AI prompt to search-friendly query (legacy method)
  private static convertPromptToSearchQuery(prompt: string): string {
    // Extract key terms and convert to search-friendly format
    const keywords = prompt
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(' ')
      .filter(word => word.length > 3)
      .slice(0, 3)
      .join(' ');
    
    return keywords || 'abstract background';
  }

  // Get fallback prompt for categories
  private static getFallbackPrompt(category: string): ImagePrompt {
    const fallbackPrompts: Record<string, string> = {
      'Electronics': 'circuit board pattern, blue tones, abstract technology, minimalistic',
      'Food & Beverages': 'food texture, warm colors, organic patterns, subtle',
      'Health & Beauty': 'medical aesthetic, soft gradients, wellness theme, clean',
      'Household': 'geometric home patterns, neutral tones, domestic harmony',
      'Clothing': 'fabric texture patterns, fashion-inspired, elegant lines',
      'Home & Garden': 'plant textures, green tones, organic shapes, natural',
      'Sports & Outdoors': 'movement patterns, energetic colors, athletic, dynamic',
      'Books & Media': 'paper texture, knowledge theme, intellectual patterns',
      'Baby & Kids': 'pastel patterns, playful shapes, gentle colors, soft',
      'Pet Supplies': 'animal-inspired patterns, warm tones, caring theme',
      'Automotive': 'mechanical patterns, metallic tones, precision lines',
      'Office Supplies': 'professional patterns, business aesthetic, clean lines',
      'Jewelry & Accessories': 'luxury patterns, elegant curves, sophisticated',
      'Amazon': 'delivery theme, blue and orange tones, e-commerce, minimalistic',
      'Target': 'red and white patterns, retail aesthetic, shopping theme',
      'Doordash': 'food delivery theme, warm colors, restaurant patterns',
      'Uber Eats': 'food delivery theme, black and green tones, mobility',
      'Instacart': 'grocery theme, green tones, shopping cart patterns',
      'Walmart': 'blue and yellow patterns, retail theme, everyday shopping',
      'Costco': 'warehouse theme, red and white, bulk shopping patterns',
      'Financial Overview': 'financial charts, money patterns, professional, abstract',
      'Financial Analytics': 'data visualization, charts, graphs, analytical',
      'Monthly Spending': 'calendar patterns, time-based, monthly themes',
      'Biggest Purchase': 'luxury items, expensive products, premium quality',
      'Payment Methods': 'credit cards, payment systems, financial transactions'
    };

    return {
      category,
      prompt: fallbackPrompts[category] || 'abstract financial patterns, professional, minimalistic',
      style: 'minimalistic, abstract, financial'
    };
  }

  // Get default image when all else fails
  private static getDefaultImage(category: string): GeneratedImage {
    const defaultImages: Record<string, string> = {
      'Electronics': 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=600&fit=crop',
      'Food & Beverages': 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop',
      'Health & Beauty': 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&h=600&fit=crop',
      'Household': 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop',
      'Clothing': 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=600&fit=crop',
      'Home & Garden': 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&h=600&fit=crop',
      'Sports & Outdoors': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop',
      'Books & Media': 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=600&fit=crop',
      'Baby & Kids': 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800&h=600&fit=crop',
      'Pet Supplies': 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=800&h=600&fit=crop',
      'Automotive': 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&h=600&fit=crop',
      'Office Supplies': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop',
      'Jewelry & Accessories': 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&h=600&fit=crop',
      'Amazon': 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=600&fit=crop',
      'Target': 'https://images.unsplash.com/photo-1555529907-3a8c4c2e3b0b?w=800&h=600&fit=crop',
      'Doordash': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800&h=600&fit=crop',
      'Uber Eats': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800&h=600&fit=crop',
      'Instacart': 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&h=600&fit=crop',
      'Walmart': 'https://images.unsplash.com/photo-1555529907-3a8c4c2e3b0b?w=800&h=600&fit=crop',
      'Costco': 'https://images.unsplash.com/photo-1555529907-3a8c4c2e3b0b?w=800&h=600&fit=crop'
    };

    return {
      url: defaultImages[category] || 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop',
      alt: `Background image for ${category}`,
      category
    };
  }

  // Cache images in localStorage
  static cacheImage(category: string, image: GeneratedImage): void {
    try {
      const cached = this.getCachedImages();
      cached[category] = image;
      localStorage.setItem(this.CACHE_KEY, JSON.stringify(cached));
    } catch (error) {
      console.error('Error caching image:', error);
    }
  }

  // Get cached images
  static getCachedImages(): Record<string, GeneratedImage> {
    try {
      const cached = localStorage.getItem(this.CACHE_KEY);
      return cached ? JSON.parse(cached) : {};
    } catch (error) {
      console.error('Error getting cached images:', error);
      return {};
    }
  }

  // Get image for category (with caching)
  static async getImageForCategory(category: string, context: string): Promise<GeneratedImage> {
    // Check cache first
    const cached = this.getCachedImages();
    if (cached[category]) {
      return cached[category];
    }

    try {
      // Generate prompt and get image
      const prompt = await this.generateImagePrompt(category, context);
      const image = await this.getImageFromPrompt(prompt);
      
      // Cache the result
      this.cacheImage(category, image);
      
      return image;
    } catch (error) {
      console.error('Error getting image for category:', error);
      // Return default image
      const defaultImage = this.getDefaultImage(category);
      this.cacheImage(category, defaultImage);
      return defaultImage;
    }
  }
}
