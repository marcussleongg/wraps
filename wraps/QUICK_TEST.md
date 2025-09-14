# Quick API Test Commands

## Test All Endpoints

```bash
# 1. Test merchants endpoint
curl "http://localhost:3001/api/merchants"

# 2. Test spending summary (all merchants)
curl "http://localhost:3001/api/spending"

# 3. Test spending summary (specific merchant - Amazon)
curl "http://localhost:3001/api/spending?merchantId=44"

# 4. Test top spending card
curl "http://localhost:3001/api/top-card"

# 5. Test categorization stats
curl "http://localhost:3001/api/categorize"

# 6. Test with pretty JSON formatting
curl -s "http://localhost:3001/api/spending" | jq '.topCategories[0:3]'
```

## Expected Results

✅ **All endpoints return 200 status**
✅ **JSON responses with proper data structure**
✅ **No CORS issues**
✅ **Fast response times (< 1 second without AI)**

## For Frontend Developer

Your frontend can immediately start using these APIs:

1. **Fetch merchants**: `GET /api/merchants`
2. **Get spending data**: `GET /api/spending` 
3. **Filter by merchant**: `GET /api/spending?merchantId=44`
4. **Check categorization**: `GET /api/categorize`

All APIs are ready for production frontend integration! 🚀
