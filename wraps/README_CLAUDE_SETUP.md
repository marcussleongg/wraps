# Claude AI Product Categorization Setup

## Overview
The system automatically uses Claude AI to categorize products that don't match keyword rules. Currently **7,672 products** need AI categorization.

## Setup Instructions

### 1. Get Claude API Key
1. Go to [Claude Console](https://console.anthropic.com/)
2. Create an account or sign in
3. Navigate to **API Keys** in Account Settings
4. Click **Create Key** and name it (e.g., "Product Categorization")
5. Copy the API key (starts with `sk-ant-`)

### 2. Set Environment Variable

**Option A: Environment Variable**
```bash
export ANTHROPIC_API_KEY="your-claude-api-key-here"
```

**Option B: Create .env.local file**
```bash
# In your project root (/Users/marcusleong/wraps/wraps/)
echo "ANTHROPIC_API_KEY=your-claude-api-key-here" > .env.local
```

### 3. Restart Server
```bash
npm run dev
```

## How It Works

1. **Automatic Detection**: When you call `/api/spending`, the system:
   - Finds all products categorized as "Other" (7,672 products)
   - Sends them to Claude in batches of 50
   - Caches results for future use

2. **First Run**: Takes 2-3 minutes to categorize all products
3. **Subsequent Runs**: Instant (uses cached results)

## Cost Estimate
- **Total Cost**: ~$2.30 - $3.45 for all 7,672 products
- **Model**: Claude 3.5 Sonnet (latest)
- **Batches**: ~154 API calls

## Verification

**Test if it's working:**
```bash
# Check current "Other" count
curl -s "http://localhost:3001/api/spending" | jq '.topCategories[] | select(.category == "Other") | .itemCount'

# Should show significantly fewer items after AI categorization
```

## Categories

Claude will categorize products into:
- Electronics
- Food & Beverages  
- Health & Beauty
- Household
- Clothing
- Home & Garden
- Sports & Outdoors
- Books & Media
- Baby & Kids
- Pet Supplies
- Automotive
- Office Supplies
- Jewelry & Accessories
- Other (only for truly ambiguous items)

## Troubleshooting

**No categorization happening?**
- Check if `ANTHROPIC_API_KEY` is set: `echo $ANTHROPIC_API_KEY`
- Look for console logs: "Claude categorizing X products..."
- Verify API key is valid (starts with `sk-ant-`)

**API errors?**
- Check API key permissions
- Ensure sufficient credits in Claude account
- Look at server logs for detailed error messages
