# AI Triage Edge Function - Complete Deployment & Fix Guide

## 🔧 Problem Summary
- **CORS preflight failure**: "It does not have HTTP ok status"
- **Edge Function not responding** to OPTIONS requests properly
- **Failed to load resource**: Function may not be deployed or configured correctly

## 🚀 Complete Fix & Deployment Steps

### Step 1: Deploy Edge Function
```bash
# Navigate to your project
cd C:\Users\Xeven\Documents\XevenSolutionTasks\appointment-portal

# Deploy the edge function
npx supabase functions deploy ai-triage-student
```

### Step 2: Set Environment Variables
Set your OpenAI API key in Supabase:

**Option A - Via CLI:**
```bash
npx supabase secrets set OPENAI_API_KEY="your-openai-api-key-here"
```

**Option B - Via Supabase Dashboard:**
1. Go to Project Settings → Edge Functions
2. Add environment variable: `OPENAI_API_KEY` = `your-key`

### Step 3: Verify Deployment
Test the function directly in Supabase dashboard:
```json
{
  "name": "Test User",
  "email": "test@example.com",
  "phone": "1234567890",
  "purpose": "I want to learn about AI and get career guidance"
}
```

### Step 4: Check Function Logs
```bash
npx supabase functions logs ai-triage-student
```

## 🔍 Troubleshooting Checklist

### ✅ 1. Verify Function is Deployed
Run: `npx supabase functions list`
- Should show `ai-triage-student` in the list

### ✅ 2. Check Environment Variables
Run: `npx supabase secrets list`
- Should show `OPENAI_API_KEY`

### ✅ 3. Test CORS Preflight
```bash
curl -X OPTIONS \
  https://eyljvjluyuciycmdccqu.supabase.co/functions/v1/ai-triage-student \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: content-type" \
  -v
```
**Expected**: HTTP 200 response with CORS headers

### ✅ 4. Test Function Directly
```bash
curl -X POST \
  https://eyljvjluyuciycmdccqu.supabase.co/functions/v1/ai-triage-student \
  -H "Authorization: Bearer YOUR_SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "phone": "1234567890",
    "purpose": "Test purpose"
  }'
```

## 🛠️ What We Fixed

### 1. Enhanced CORS Headers
```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-requested-with, x-supabase-api-version',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS', // Added all methods
  'Access-Control-Max-Age': '86400',
}
```

### 2. Improved OPTIONS Handling
```typescript
if (req.method === 'OPTIONS') {
  console.log('🔄 CORS preflight request received') // Added logging
  return new Response(null, {
    status: 200, // Ensure 200 status
    headers: corsHeaders
  })
}
```

### 3. Better Error Handling
- Always return status 200 for successful requests
- Detailed logging for debugging
- Proper error messages

### 4. Enhanced Client-Side Logging
- More detailed error information
- Better debugging output
- Proper error handling

## 🔥 Common Issues & Solutions

### Issue: "Failed to load resource: net::ERR_FAILED"
**Solution**: Function not deployed or wrong URL
```bash
npx supabase functions deploy ai-triage-student --debug
```

### Issue: "OpenAI API key not configured"
**Solution**: Set environment variable
```bash
npx supabase secrets set OPENAI_API_KEY="sk-..."
```

### Issue: "Response to preflight request doesn't pass access control check"
**Solution**: CORS headers issue (fixed in our code)

### Issue: Function times out
**Solution**: Check OpenAI API connectivity and quotas

## 📋 Quick Deployment Checklist

- [ ] Edge function deployed: `npx supabase functions deploy ai-triage-student`
- [ ] OpenAI API key set: `npx supabase secrets set OPENAI_API_KEY="..."`
- [ ] Function responds to OPTIONS: Test CORS preflight
- [ ] Function responds to POST: Test with sample data
- [ ] Frontend can call function: Test in browser
- [ ] Logs show proper execution: `npx supabase functions logs ai-triage-student`

## 🧪 Testing Commands

```bash
# 1. Deploy function
npx supabase functions deploy ai-triage-student

# 2. Set API key
npx supabase secrets set OPENAI_API_KEY="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"

# 3. Test deployment
npx supabase functions list

# 4. Check logs
npx supabase functions logs ai-triage-student --follow

# 5. Test CORS
curl -X OPTIONS https://eyljvjluyuciycmdccqu.supabase.co/functions/v1/ai-triage-student -v
```

## 🎯 Expected Results

After following this guide:
1. **CORS preflight** should return HTTP 200
2. **Edge function** should process requests successfully
3. **Frontend** should receive AI triage responses
4. **No CORS errors** in browser console
5. **Triage entries** should appear in database

If issues persist, check the function logs for specific error messages.