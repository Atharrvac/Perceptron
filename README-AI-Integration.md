# AI Integration Guide: OpenAI + OpenRouter

This guide explains how to use the flexible AI service that supports both OpenAI and OpenRouter APIs with automatic provider detection and fallback.

## 🚀 Quick Start

### 1. Environment Setup

Create a `.env` file with your API keys:

```bash
# Option 1: OpenAI only
VITE_OPENAI_API_KEY=sk-your-openai-key-here

# Option 2: OpenRouter only (recommended - more models, better pricing)
VITE_OPENROUTER_API_KEY=sk-or-v1-your-openrouter-key-here

# Option 3: Both (system will prefer OpenRouter)
VITE_OPENAI_API_KEY=sk-your-openai-key-here
VITE_OPENROUTER_API_KEY=sk-or-v1-your-openrouter-key-here
```

### 2. Provider Detection Logic

The system automatically detects which API keys are available:

- ✅ **Both keys present**: Uses OpenRouter (better pricing, more models)
- ✅ **OpenRouter only**: Uses OpenRouter
- ✅ **OpenAI only**: Uses OpenAI
- ❌ **No keys**: Disables AI features with graceful error handling

## 🛠️ Usage Examples

### Frontend (React/TypeScript)

```typescript
import { aiService, getChatResponse, translateText } from '../services/aiService';

// Simple chat
const response = await getChatResponse("Hello, how are you?");
console.log(response); // Works with any available provider

// Check provider status
const status = aiService.getActiveProvider(); // 'openai' | 'openrouter' | null
const available = aiService.getAvailableProviders(); // ['openai', 'openrouter']

// Advanced usage with provider control
const result = await aiService.getChatResponse("Explain quantum computing", {
  provider: 'openrouter', // or 'openai' or 'auto'
  model: 'anthropic/claude-3.5-sonnet',
  temperature: 0.3
});

if (result.success) {
  console.log(`Response from ${result.provider}:`, result.data);
} else {
  console.error(`Error from ${result.provider}:`, result.error);
}
```

### Backend (Node.js)

```javascript
const { AIService } = require('./examples/nodejs-ai-integration');

const aiService = new AIService();

// Chat completion
const result = await aiService.chatCompletion([
  { role: "system", content: "You are a helpful assistant." },
  { role: "user", content: "What is machine learning?" }
]);

if (result.success) {
  console.log(result.data.content);
} else {
  console.error(`${result.code}: ${result.error}`);
}
```

### Backend (Python)

```python
from examples.python_ai_integration import AIService

ai_service = AIService()

# Chat completion
result = ai_service.chat_completion_sync([
    {"role": "system", "content": "You are a helpful assistant."},
    {"role": "user", "content": "What is machine learning?"}
])

if result.success:
    print(result.data['content'])
else:
    print(f"{result.code}: {result.error}")
```

## 🔧 API Reference

### Frontend Service Methods

#### Basic Methods (Legacy Compatible)
```typescript
// These maintain backward compatibility
translateText(text: string, language: Language): Promise<string>
getChatResponse(prompt: string): Promise<string>
getResponseWithGoogleSearch(prompt: string): Promise<{text: string, sources: any[]}>
getStructuredResponse<T>(prompt: string, example: T): Promise<T | null>
```

#### Advanced Methods (New)
```typescript
// Full control with structured responses
aiService.getChatResponse(prompt: string, config?: AIConfig): Promise<AIResponse<string>>
aiService.translateText(text: string, language: Language, config?: AIConfig): Promise<AIResponse<string>>
aiService.getResponseWithSearch(prompt: string, config?: AIConfig): Promise<AIResponse<{text: string, sources: any[]}>>
aiService.getStructuredResponse<T>(prompt: string, example: T, config?: AIConfig): Promise<AIResponse<T>>

// Service management
aiService.getActiveProvider(): string | null
aiService.getAvailableProviders(): string[]
aiService.validateProvider(provider: AIProvider): Promise<AIResponse<boolean>>
```

### Configuration Options

```typescript
interface AIConfig {
  provider?: 'openai' | 'openrouter' | 'auto';
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

type AIResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
  provider?: string;
  model?: string;
  code?: string;
  timestamp?: string;
}
```

## 🎯 Model Selection

### OpenAI Models
- `gpt-3.5-turbo` (default chat)
- `gpt-4` (advanced chat)

### OpenRouter Models (More Options)
- `microsoft/wizardlm-2-8x22b` (default chat)
- `anthropic/claude-3.5-sonnet` (advanced chat)
- `meta-llama/llama-3.1-8b-instruct:free` (fast/free)
- Many more available at [openrouter.ai/models](https://openrouter.ai/models)

## 🚨 Error Handling

The system provides structured error responses:

```typescript
const result = await aiService.getChatResponse("Hello");

if (!result.success) {
  switch (result.code) {
    case 'INVALID_API_KEY':
      // Handle invalid credentials
      console.error('Please check your API key');
      break;
    case 'RATE_LIMIT':
      // Handle rate limiting
      console.error('Too many requests, try again later');
      break;
    case 'SERVICE_UNAVAILABLE':
      // Handle service downtime
      console.error('AI service temporarily unavailable');
      break;
    default:
      console.error(`Unexpected error: ${result.error}`);
  }
}
```

## 🔐 Security Best Practices

1. **Environment Variables**: Always use `.env` files for API keys
2. **Client-Side**: Uses `dangerouslyAllowBrowser: true` (acceptable for demos)
3. **Production**: Move AI calls to backend for better security
4. **Key Rotation**: Regularly rotate API keys
5. **Monitoring**: Log usage and errors for debugging

## 🚀 Production Deployment

### Environment Variables
```bash
# Production .env
VITE_OPENROUTER_API_KEY=sk-or-v1-production-key
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-key
```

### Server Setup (Node.js + Express)
```javascript
const express = require('express');
const { AIService, createExpressEndpoints } = require('./nodejs-ai-integration');

const app = express();
const aiService = new AIService();

// Add AI endpoints
createExpressEndpoints(app, aiService);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    ai: aiService.getStatus()
  });
});

app.listen(3000);
```

### Server Setup (Python + Flask)
```python
from flask import Flask
from python_ai_integration import create_flask_endpoints

app = create_flask_endpoints()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
```

## 📊 Testing

### Validate Your Setup
```typescript
// Test all available providers
const providers = aiService.getAvailableProviders();
for (const provider of providers) {
  const result = await aiService.validateProvider(provider);
  console.log(`${provider}: ${result.success ? '✅' : '❌'}`);
}
```

### Check Status
```typescript
const status = aiService.getStatus();
console.log('AI Service Status:', status);
// Output: { openaiAvailable: false, openrouterAvailable: true, activeProvider: 'openrouter', availableProviders: ['openrouter'] }
```

## 🔄 Migration from Gemini

If you were using the old Gemini service:

1. **Replace imports**:
   ```typescript
   // Old
   import { getChatResponse } from '../services/geminiService';
   
   // New
   import { getChatResponse } from '../services/aiService';
   ```

2. **Update constants**:
   ```typescript
   // Old
   import { GEMINI_CHAT_MODEL_NAME } from '../constants';
   
   // New - not needed, handled automatically
   ```

3. **Environment variables**:
   ```bash
   # Old
   VITE_GOOGLE_API_KEY=your-gemini-key
   
   # New
   VITE_OPENROUTER_API_KEY=your-openrouter-key
   ```

## 💡 Tips

1. **Cost Optimization**: OpenRouter often provides better pricing than OpenAI
2. **Model Variety**: OpenRouter gives access to Claude, Llama, and other models
3. **Fallback**: Keep both keys for redundancy
4. **Testing**: Use free models during development (`meta-llama/llama-3.1-8b-instruct:free`)
5. **Monitoring**: Check provider status if you encounter issues

## 🆘 Troubleshooting

### Common Issues

1. **"No AI provider available"**
   - Check your `.env` file has the correct key names
   - Restart dev server after adding keys

2. **"Invalid API key"**
   - Verify your API key is correct
   - For OpenRouter: ensure key starts with `sk-or-v1-`
   - For OpenAI: ensure key starts with `sk-`

3. **Rate limiting**
   - Implement retry logic
   - Consider upgrading your API plan
   - Use different models (some have higher limits)

4. **Model not found**
   - Check available models at [openrouter.ai/models](https://openrouter.ai/models)
   - Use default models if unsure

### Debug Commands
```typescript
// Check what's available
console.log('Provider status:', aiService.getStatus());

// Test provider
const test = await aiService.validateProvider('openrouter');
console.log('Provider test:', test);

// Check environment
console.log('Keys configured:', {
  openai: !!import.meta.env.VITE_OPENAI_API_KEY,
  openrouter: !!import.meta.env.VITE_OPENROUTER_API_KEY
});
```

This integration provides a robust, production-ready AI service that automatically handles provider selection, error cases, and provides excellent developer experience!
