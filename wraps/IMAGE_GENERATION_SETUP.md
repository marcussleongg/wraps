# Image Generation Pipeline Setup

This document explains how to set up the AI-powered image generation pipeline for the spending stories.

## Overview

The pipeline uses:
1. **Groq API** - Generates contextual image prompts using AI
2. **Pollinations.ai** - Generates AI images based on the prompts (FREE)
3. **Caching** - Stores generated images locally for performance

## Setup Instructions

### 1. Get API Keys

#### Groq API Key (Required)
1. Visit [console.groq.com](https://console.groq.com)
2. Sign up for a free account
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key (starts with `gsk_...`)

#### Pollinations.ai (No API Key Needed!)
Pollinations.ai is completely free and doesn't require any API key or registration. It's already integrated and ready to use!

### 2. Configure Environment Variables

1. Copy the example environment file:
   ```bash
   cp env.example .env.local
   ```

2. Edit `.env.local` and add your API key:
   ```env
   GROQ_API_KEY=gsk_your_groq_api_key_here
   ```

### 3. How It Works

#### Image Generation Process
1. **Category Analysis**: Each spending story category (Electronics, Amazon, etc.) is analyzed
2. **Prompt Generation**: Groq AI generates a minimalistic, non-distracting image prompt
3. **AI Image Generation**: Pollinations.ai generates unique images based on the prompt
4. **Caching**: Generated images are cached in localStorage for performance
5. **Fallback**: If APIs fail, predefined high-quality images are used

#### Example Prompts Generated
- **Electronics**: "minimalistic circuit board pattern, blue tones, abstract technology"
- **Amazon**: "minimalistic delivery theme, blue and orange tones, e-commerce"
- **Food & Beverages**: "subtle food texture, warm colors, organic patterns"

### 4. API Costs

#### Groq API
- **Free tier**: 14,400 requests per day
- **Cost**: $0.27 per 1M tokens (very affordable)
- **Estimated cost**: ~$0.01-0.05 per user session

#### Pollinations.ai
- **Completely FREE**: No API key required
- **No rate limits**: Unlimited image generation
- **No cost**: $0.00 per user session

### 5. Fallback System

If APIs are unavailable or fail:
1. **Cached images** are used if available
2. **Predefined high-quality images** from Unsplash are used
3. **Default financial-themed images** are used as last resort

### 6. Customization

#### Adding New Categories
Edit `src/app/services/imageGeneration.ts` and add new entries to the `fallbackPrompts` object:

```typescript
const fallbackPrompts: Record<string, string> = {
  'Your New Category': 'minimalistic description, color tones, theme',
  // ... existing categories
};
```

#### Modifying Prompt Style
Edit the `systemPrompt` in the `generateImagePrompt` method to change the AI's prompt generation style.

### 7. Testing

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Click "Get Started" to trigger the loading screen
3. Watch as images are generated for each story category
4. Check the browser console for any API errors

### 8. Production Deployment

Make sure to add your environment variables to your hosting platform:

#### Vercel
1. Go to your project dashboard
2. Navigate to Settings > Environment Variables
3. Add `GROQ_API_KEY` and `UNSPLASH_ACCESS_KEY`

#### Other Platforms
Add the environment variables through your platform's configuration interface.

## Troubleshooting

### Common Issues

1. **"GROQ_API_KEY not found"**
   - Make sure `.env.local` exists and contains the correct key
   - Restart your development server after adding the key

2. **"Unsplash API error"**
   - Check your Unsplash API key is correct
   - Verify you haven't exceeded the rate limit

3. **Images not loading**
   - Check browser console for CORS errors
   - Verify API keys are valid
   - Check network connectivity

### Debug Mode

To see detailed logging, add this to your `.env.local`:
```env
DEBUG_IMAGE_GENERATION=true
```

## Performance

- **First load**: 2-5 seconds (generates all images)
- **Subsequent loads**: Instant (uses cached images)
- **Cache duration**: Until manually cleared or 30 days
- **Image optimization**: All images are optimized for web display

## Security

- API keys are never exposed to the client
- All API calls are made server-side
- Images are cached locally for performance
- No sensitive data is stored in the cache
