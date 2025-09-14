# Spending Backend API Documentation

## Base URL
```
http://localhost:3001
```

## Available Endpoints

### 1. Get Spending Summary

**Endpoint:** `GET /api/spending`

**Description:** Returns comprehensive spending analysis with AI-enhanced categorization

**Query Parameters:**
- `merchantId` (optional): Filter by specific merchant ID

**Response:**
```json
{
  "totalSpent": 566323.86,
  "totalTransactions": 1260,
  "averageOrderValue": 449.46,
  "merchantSummaries": [
    {
      "merchantId": 44,
      "merchantName": "Amazon",
      "totalSpent": 127639.87,
      "transactionCount": 285,
      "averageOrderValue": 447.86,
      "categoryBreakdown": [
        {
          "category": "Electronics",
          "totalSpent": 45623.12,
          "itemCount": 156,
          "averagePrice": 292.46,
          "topProducts": [
            {
              "name": "iPhone 15 Pro",
              "totalSpent": 1299.99,
              "quantity": 1,
              "averagePrice": 1299.99
            }
          ]
        }
      ],
      "paymentMethodBreakdown": [
        {
          "brand": "VISA",
          "totalSpent": 89432.12,
          "transactionCount": 156,
          "lastFour": "4404"
        }
      ],
      "monthlySpending": [
        {
          "month": "2024-01",
          "totalSpent": 25486.33,
          "transactionCount": 42
        }
      ]
    }
  ],
  "topCategories": [
    {
      "category": "Electronics",
      "totalSpent": 127639.87,
      "itemCount": 2282,
      "averagePrice": 55.93,
      "topProducts": []
    }
  ],
  "monthlyTrends": [
    {
      "month": "2024-01",
      "totalSpent": 89234.56,
      "transactionCount": 234
    }
  ],
  "paymentMethodSummary": [
    {
      "brand": "VISA",
      "totalSpent": 234567.89,
      "transactionCount": 456,
      "lastFour": "4404"
    }
  ]
}
```

**Examples:**
```bash
# Get all spending data
curl "http://localhost:3001/api/spending"

# Get spending for specific merchant
curl "http://localhost:3001/api/spending?merchantId=44"
```

---

### 2. Get Available Merchants

**Endpoint:** `GET /api/merchants`

**Description:** Returns list of all available merchants

**Response:**
```json
[
  {
    "id": 12,
    "name": "Target"
  },
  {
    "id": 44,
    "name": "Amazon"
  },
  {
    "id": 19,
    "name": "Doordash"
  }
]
```

**Example:**
```bash
curl "http://localhost:3001/api/merchants"
```

---

### 3. Get Categorization Statistics

**Endpoint:** `GET /api/categorize`

**Description:** Returns statistics about product categorization and AI processing

**Response:**
```json
{
  "currentStats": {
    "totalProducts": 13266,
    "otherProducts": 5453,
    "categorizedProducts": 7813,
    "otherPercentage": "41.1"
  },
  "sampleOtherProducts": [
    "ZINUS 12 Inch Green Tea Memory Foam Mattress",
    "Instant Pot Duo 7-in-1 Electric Pressure Cooker",
    "Blue Diamond Almonds, Low Sodium Lightly Salted"
  ],
  "costEstimate": "$0.21 - $0.32"
}
```

**Example:**
```bash
curl "http://localhost:3001/api/categorize"
```

---

### 4. Trigger AI Categorization (Optional)

**Endpoint:** `POST /api/categorize`

**Description:** Manually trigger Claude AI categorization for uncategorized products

**Request Body:**
```json
{
  "apiKey": "sk-ant-your-claude-api-key-here",
  "dryRun": false
}
```

**Response:**
```json
{
  "success": true,
  "stats": {
    "totalCategorized": 5453,
    "categoryBreakdown": {
      "Electronics": 1234,
      "Food & Beverages": 2345,
      "Household": 876
    },
    "provider": "claude",
    "completedAt": "2024-01-27T15:30:00.000Z"
  }
}
```

---

### 5. Get Top Spending Card

**Endpoint:** `GET /api/top-card`

**Description:** Returns detailed information about the card with the highest spending

**Response:**
```json
{
  "topSpendingCard": {
    "brand": "VISA",
    "lastFour": "4404",
    "totalSpent": 217862.62,
    "transactionCount": 534,
    "averageTransactionAmount": 407.98,
    "spendingPercentage": 38.5,
    "topMerchant": {
      "merchantName": "Amazon",
      "spentAtMerchant": 62129.77,
      "transactionsAtMerchant": 100
    }
  },
  "allCardsTotal": 566323.86,
  "cardCount": 336,
  "comparison": {
    "secondHighest": {
      "brand": "EBTSNAP",
      "totalSpent": 9871.72,
      "transactionCount": 10,
      "lastFour": "2467"
    },
    "difference": 207990.90
  }
}
```

**Example:**
```bash
curl "http://localhost:3001/api/top-card"
```

---

### 6. Get Category Pie Chart Data

**Endpoint:** `GET /api/pie-chart`

**Description:** Returns category spending data formatted specifically for pie chart visualization

**Query Parameters:**
- `limit` (optional): Number of top categories to show (default: 8, rest grouped as "Other")
- `merchantId` (optional): Filter to specific merchant

**Response:**
```json
{
  "data": [
    {
      "name": "Other",
      "value": 178640.41,
      "percentage": 31.54,
      "itemCount": 7672,
      "averagePrice": 23.28,
      "color": "#6b7280"
    },
    {
      "name": "Electronics", 
      "value": 127639.87,
      "percentage": 22.54,
      "itemCount": 2282,
      "averagePrice": 55.93,
      "color": "#3b82f6"
    }
  ],
  "total": 566323.86,
  "totalItems": 18624,
  "metadata": {
    "merchantId": "all",
    "topN": 8,
    "totalCategories": 10
  }
}
```

**Examples:**
```bash
# Category pie chart (all merchants)
curl "http://localhost:3001/api/pie-chart"

# Top 5 categories only
curl "http://localhost:3001/api/pie-chart?limit=5"

# Categories for specific merchant (Amazon)
curl "http://localhost:3001/api/pie-chart?merchantId=44"
```

**Features:**
- Pre-calculated percentages for easy pie chart rendering
- Consistent color scheme for categories
- Automatic grouping of smaller categories as "Other"
- Ready for Chart.js, D3, or any pie chart library

---

## Product Categories

The system categorizes products into these categories:

- **Electronics**: Smart devices, computers, phones, gaming
- **Food & Beverages**: Groceries, drinks, snacks  
- **Health & Beauty**: Vitamins, skincare, personal care
- **Household**: Cleaning supplies, home essentials
- **Clothing**: Apparel and accessories
- **Home & Garden**: Furniture, tools, decor
- **Sports & Outdoors**: Fitness, recreational equipment
- **Books & Media**: Entertainment and educational content
- **Baby & Kids**: Child-related products
- **Pet Supplies**: Pet care and accessories
- **Automotive**: Car-related products
- **Office Supplies**: Work and business items
- **Jewelry & Accessories**: Fashion accessories
- **Other**: Uncategorized items

## Error Responses

All endpoints return appropriate HTTP status codes:

- **200**: Success
- **400**: Bad Request (invalid parameters)
- **404**: Not Found (invalid merchant ID)
- **500**: Internal Server Error

Error format:
```json
{
  "error": "Error message",
  "message": "Detailed error description"
}
```

## CORS

The API supports CORS for frontend integration. All endpoints are accessible from any origin in development mode.

## Notes for Frontend Developer

1. **Automatic AI Enhancement**: The `/api/spending` endpoint automatically triggers Claude AI categorization if an API key is configured
2. **Caching**: AI results are cached, so subsequent calls are fast
3. **Graceful Fallback**: System works without AI key, just with more items in "Other" category
4. **Real-time Processing**: First AI categorization may take 2-3 minutes for full dataset
5. **Cost Efficient**: Only uncategorized products are sent to AI (~$0.20-0.30 total cost)
