# AI Financial Tips Setup Guide

Budget Buddy now includes an AI-powered financial tips feature that provides personalized financial advice based on your financial data and goals.

## Supported AI Providers

The system supports multiple AI providers with automatic fallback:

1. **OpenAI GPT** (Primary recommendation)
2. **Google Gemini**
3. **Anthropic Claude**
4. **Local AI Models** (Ollama, LM Studio, etc.)

## Environment Variables Setup

Create a `.env` file in your project root and add your API keys:

```env
# OpenAI Configuration (Recommended)
REACT_APP_OPENAI_API_KEY=your_openai_api_key_here
REACT_APP_OPENAI_MODEL=gpt-3.5-turbo

# Google Gemini Configuration
REACT_APP_GEMINI_API_KEY=your_gemini_api_key_here
REACT_APP_GEMINI_MODEL=gemini-pro

# Anthropic Claude Configuration
REACT_APP_CLAUDE_API_KEY=your_claude_api_key_here
REACT_APP_CLAUDE_MODEL=claude-3-haiku-20240307

# Local AI Configuration (Optional)
REACT_APP_LOCAL_AI_URL=http://localhost:11434
REACT_APP_LOCAL_AI_MODEL=llama2
```

## Getting API Keys

### OpenAI (Recommended)
1. Visit [OpenAI Platform](https://platform.openai.com/)
2. Create an account or sign in
3. Go to API Keys section
4. Create a new API key
5. Add billing information (pay-per-use)

**Cost**: ~$0.001-0.002 per tip (very affordable)

### Google Gemini
1. Visit [Google AI Studio](https://makersuite.google.com/)
2. Create a project
3. Enable the Gemini API
4. Generate an API key

**Cost**: Free tier available, then pay-per-use

### Anthropic Claude
1. Visit [Anthropic Console](https://console.anthropic.com/)
2. Create an account
3. Add billing information
4. Generate an API key

**Cost**: Pay-per-use pricing

### Local AI (Advanced Users)
For privacy-focused users, you can run AI models locally:

1. **Ollama**: Install from [ollama.ai](https://ollama.ai/)
   ```bash
   ollama pull llama2
   ollama serve
   ```

2. **LM Studio**: Download from [lmstudio.ai](https://lmstudio.ai/)

## Configuration Priority

The AI service will attempt to use providers in this order:
1. OpenAI (if configured)
2. Gemini (if configured)
3. Claude (if configured)
4. Local AI (if configured)
5. Fallback to static tips

## Features

### Automatic Tip Generation
- Tips are generated automatically when you visit the dashboard
- Cached for 1 hour to reduce API costs
- Refreshed when you click the refresh button

### Personalized Advice
The AI considers:
- Your spending patterns
- Budget allocations
- Financial goals
- Current financial health
- Market conditions

### Priority-Based Tips
- **High Priority**: Urgent financial issues
- **Medium Priority**: Important improvements
- **Low Priority**: General optimization

### Smart Caching
- Tips are cached to reduce API calls
- Cache expires after 1 hour
- Manual refresh available

## Privacy & Security

- API keys are stored locally in environment variables
- Financial data is anonymized before sending to AI
- No personal information is stored by AI providers
- All communications are encrypted (HTTPS)

## Troubleshooting

### No AI Tips Showing
1. Check that at least one API key is configured
2. Verify API key is valid and has sufficient credits
3. Check browser console for error messages
4. Ensure `.env` file is in the project root

### API Errors
- **Rate Limit**: Wait a few minutes and try again
- **Invalid Key**: Double-check your API key
- **Insufficient Credits**: Add billing to your AI provider account

### Local AI Issues
- Ensure Ollama/LM Studio is running
- Check the local AI URL and model name
- Verify the model is downloaded and available

## Cost Optimization

1. **Use Caching**: Tips are cached for 1 hour
2. **Choose Efficient Models**: GPT-3.5-turbo is cost-effective
3. **Monitor Usage**: Check your AI provider dashboard
4. **Use Local AI**: Completely free but requires setup

## Advanced Configuration

You can modify the AI behavior by editing `src/aiService.js`:

- Adjust prompt engineering
- Change tip categories
- Modify caching duration
- Add custom fallback tips

## Support

If you encounter issues:
1. Check the browser console for errors
2. Verify your API keys are correct
3. Ensure you have sufficient API credits
4. Try using a different AI provider

The AI feature is designed to work even if no API keys are configured - it will fall back to helpful static financial tips.