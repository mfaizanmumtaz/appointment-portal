# 🤖 AI Triage Edge Function Deployment Guide

## 📋 Overview
This guide explains how to deploy the AI triage edge function for real-time student session evaluation using GPT-4o-mini.

## 🚀 Deployment Steps

### 1. **Set up OpenAI API Key**
```bash
# In your Supabase project dashboard, go to Settings > Edge Functions
# Add environment variable:
OPENAI_API_KEY=your_openai_api_key_here
```

### 2. **Deploy the Edge Function**
```bash
# Install Supabase CLI if not already installed
npm install -g @supabase/cli

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Deploy the function
supabase functions deploy ai-triage-student
```

### 3. **Update Database Schema**
Run the updated `supabase-schema.sql` file to create the new `student_triage_log` table:

```sql
-- The schema file includes:
-- 1. student_triage_log table
-- 2. Indexes for performance
-- 3. RLS policies
-- 4. Proper constraints
```

### 4. **Test the AI Triage**
1. Navigate to the student portal
2. Fill out the form with student information
3. Select "Online (Free)" session type
4. Watch the AI evaluation process in real-time

## 🔧 Technical Details

### **Edge Function Features:**
- **Model**: GPT-4o-mini for fast, cost-effective evaluation
- **Prompt**: Specialized for student mentorship evaluation
- **Fallback**: Graceful error handling with manual review option
- **Logging**: All decisions saved to database for admin review

### **AI Evaluation Criteria:**
✅ **Approved for:**
- Learning objectives (career guidance, skill development)
- Student-appropriate topics (internships, portfolio advice)
- Educational intent (mentorship, advice requests)
- Appropriate scope for 45-minute sessions

❌ **Declined for:**
- Business/commercial intent
- Inappropriate requests
- Vague or unclear purpose
- Advanced professional topics

🤔 **Uncertain for:**
- Borderline cases requiring human review
- Complex requests needing clarification

### **User Flow:**
1. Student fills form and selects free session
2. AI analyzes purpose and student information
3. Real-time decision with reasoning provided
4. Approved → Calendar access
5. Declined → Alternative options shown
6. Uncertain → Calendar access + manual review flag

## 📊 Admin Dashboard Integration

The AI triage results are automatically logged and can be viewed in the admin dashboard:

- **Real-time decisions**: Instant evaluation results
- **Manual review queue**: Uncertain cases flagged for admin review
- **Analytics**: Decision patterns and confidence scores
- **Override capability**: Admins can manually approve/decline

## 🔑 Environment Variables Required

```bash
# Supabase Project Settings > Edge Functions
OPENAI_API_KEY=sk-...your-openai-api-key
```

## 📈 Performance & Costs

- **Response time**: 2-5 seconds typical
- **Cost**: ~$0.001-0.002 per evaluation (GPT-4o-mini)
- **Fallback**: Automatic graceful degradation if AI unavailable
- **Reliability**: Built-in error handling and user flow continuation

## 🚨 Important Notes

1. **API Key Security**: Keep OpenAI API key secure in Supabase environment variables
2. **Rate Limits**: OpenAI has rate limits; monitor usage in production
3. **Fallback Mode**: System continues working even if AI fails
4. **Manual Review**: Uncertain cases automatically flagged for admin review
5. **Database Updates**: Apply schema updates before deploying function

## 🎯 Next Steps

After deployment:
1. Monitor AI decision accuracy in admin dashboard
2. Adjust prompts based on real-world usage patterns
3. Review manual override patterns to improve AI training
4. Consider adding more sophisticated evaluation criteria based on usage data

---

**✅ Ready to deploy!** The AI triage system is now fully integrated and ready for production use.
