/**
 * Node.js Example: AI Integration with OpenAI and OpenRouter
 * 
 * This example demonstrates how to create a production-ready AI service
 * that supports both OpenAI and OpenRouter APIs with automatic provider detection.
 */

const OpenAI = require('openai');
require('dotenv').config();

// API Configuration from environment variables
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

// Provider configurations
const PROVIDER_CONFIGS = {
  openai: {
    baseURL: 'https://api.openai.com/v1',
    models: {
      chat: 'gpt-3.5-turbo',
      chatAdvanced: 'gpt-4',
    }
  },
  openrouter: {
    baseURL: 'https://openrouter.ai/api/v1',
    models: {
      chat: 'microsoft/wizardlm-2-8x22b',
      chatAdvanced: 'anthropic/claude-3.5-sonnet',
      chatFast: 'meta-llama/llama-3.1-8b-instruct:free',
    }
  }
};

class AIService {
  constructor() {
    this.openaiClient = null;
    this.openrouterClient = null;
    this.activeProvider = null;
    this.initializeClients();
  }

  initializeClients() {
    // Initialize OpenAI client
    if (OPENAI_API_KEY && OPENAI_API_KEY.trim()) {
      try {
        this.openaiClient = new OpenAI({
          apiKey: OPENAI_API_KEY
        });
        console.log('✅ OpenAI client initialized');
      } catch (error) {
        console.error('❌ Failed to initialize OpenAI client:', error.message);
      }
    }

    // Initialize OpenRouter client
    if (OPENROUTER_API_KEY && OPENROUTER_API_KEY.trim()) {
      try {
        this.openrouterClient = new OpenAI({
          apiKey: OPENROUTER_API_KEY,
          baseURL: PROVIDER_CONFIGS.openrouter.baseURL,
          defaultHeaders: {
            "HTTP-Referer": "https://your-app-domain.com",
            "X-Title": "Your App Name"
          }
        });
        console.log('✅ OpenRouter client initialized');
      } catch (error) {
        console.error('❌ Failed to initialize OpenRouter client:', error.message);
      }
    }

    // Set active provider (prefer OpenRouter if both available)
    if (this.openrouterClient) {
      this.activeProvider = 'openrouter';
      console.log('🎯 Using OpenRouter as primary provider');
    } else if (this.openaiClient) {
      this.activeProvider = 'openai';
      console.log('🎯 Using OpenAI as primary provider');
    } else {
      this.activeProvider = null;
      console.warn('⚠️ No AI API keys configured. AI features will be disabled.');
    }
  }

  getClient(provider = 'auto') {
    const targetProvider = provider === 'auto' ? this.activeProvider : provider;

    switch (targetProvider) {
      case 'openai':
        return this.openaiClient ? { client: this.openaiClient, providerName: 'openai' } : null;
      case 'openrouter':
        return this.openrouterClient ? { client: this.openrouterClient, providerName: 'openrouter' } : null;
      default:
        return null;
    }
  }

  getModel(provider, modelType = 'chat') {
    const config = PROVIDER_CONFIGS[provider];
    return config?.models[modelType] || config?.models.chat || 'gpt-3.5-turbo';
  }

  createErrorResponse(error, provider = null, code = null) {
    return {
      success: false,
      error,
      provider,
      code,
      timestamp: new Date().toISOString()
    };
  }

  createSuccessResponse(data, provider, model) {
    return {
      success: true,
      data,
      provider,
      model,
      timestamp: new Date().toISOString()
    };
  }

  async chatCompletion(messages, options = {}) {
    const {
      provider = 'auto',
      model = null,
      temperature = 0.7,
      maxTokens = 2000
    } = options;

    const clientInfo = this.getClient(provider);
    if (!clientInfo) {
      return this.createErrorResponse(
        "No AI provider available. Please configure API keys in .env file."
      );
    }

    const { client, providerName } = clientInfo;
    const selectedModel = model || this.getModel(providerName, 'chat');

    try {
      console.log(`🚀 Making request to ${providerName} with model ${selectedModel}`);
      
      const response = await client.chat.completions.create({
        model: selectedModel,
        messages,
        temperature,
        max_tokens: maxTokens
      });

      const content = response.choices[0]?.message?.content;
      if (content) {
        return this.createSuccessResponse(
          {
            content: content.trim(),
            usage: response.usage,
            finishReason: response.choices[0].finish_reason
          },
          providerName,
          selectedModel
        );
      } else {
        return this.createErrorResponse("No content returned from AI service", providerName);
      }
    } catch (error) {
      console.error(`❌ Error with ${providerName}:`, error.message);
      
      // Handle specific error types
      if (error.status === 401) {
        return this.createErrorResponse(
          "Invalid API key. Please check your credentials.",
          providerName,
          "INVALID_API_KEY"
        );
      } else if (error.status === 429) {
        return this.createErrorResponse(
          "Rate limit exceeded. Please try again later.",
          providerName,
          "RATE_LIMIT"
        );
      } else if (error.status >= 500) {
        return this.createErrorResponse(
          "AI service temporarily unavailable. Please try again.",
          providerName,
          "SERVICE_UNAVAILABLE"
        );
      }

      return this.createErrorResponse(
        error.message || "Request failed",
        providerName,
        error.code || error.status?.toString()
      );
    }
  }

  async validateProvider(provider) {
    const clientInfo = this.getClient(provider);
    if (!clientInfo) {
      return this.createErrorResponse(`Provider ${provider} not available or not configured`);
    }

    try {
      const { client, providerName } = clientInfo;
      const model = this.getModel(providerName, 'chat');
      
      const response = await client.chat.completions.create({
        model,
        messages: [{ role: "user", content: "Hello" }],
        max_tokens: 5
      });

      if (response.choices[0]?.message?.content) {
        return this.createSuccessResponse(true, providerName, model);
      } else {
        return this.createErrorResponse("Provider validation failed", providerName);
      }
    } catch (error) {
      return this.createErrorResponse(
        `Provider validation failed: ${error.message}`,
        provider,
        error.code || error.status?.toString()
      );
    }
  }

  getStatus() {
    return {
      openaiAvailable: !!this.openaiClient,
      openrouterAvailable: !!this.openrouterClient,
      activeProvider: this.activeProvider,
      availableProviders: [
        ...(this.openaiClient ? ['openai'] : []),
        ...(this.openrouterClient ? ['openrouter'] : [])
      ]
    };
  }
}

// Example usage and testing
async function runExamples() {
  console.log('🚀 Initializing AI Service...\n');
  
  const aiService = new AIService();
  
  // Check service status
  console.log('📊 Service Status:');
  console.log(JSON.stringify(aiService.getStatus(), null, 2));
  console.log();

  // Example 1: Simple chat completion
  console.log('💬 Example 1: Simple Chat Completion');
  const chatResult = await aiService.chatCompletion([
    { role: "system", content: "You are a helpful assistant." },
    { role: "user", content: "What is the capital of France?" }
  ]);
  
  console.log('Result:', JSON.stringify(chatResult, null, 2));
  console.log();

  // Example 2: Using specific provider and model
  console.log('🎯 Example 2: Specific Provider and Model');
  const specificResult = await aiService.chatCompletion([
    { role: "user", content: "Explain quantum computing in simple terms" }
  ], {
    provider: 'auto', // or 'openai', 'openrouter'
    temperature: 0.3,
    maxTokens: 500
  });
  
  console.log('Result:', JSON.stringify(specificResult, null, 2));
  console.log();

  // Example 3: Provider validation
  console.log('✅ Example 3: Provider Validation');
  const availableProviders = aiService.getStatus().availableProviders;
  
  for (const provider of availableProviders) {
    const validation = await aiService.validateProvider(provider);
    console.log(`${provider}: ${validation.success ? '✅ Valid' : '❌ Invalid'}`);
    if (!validation.success) {
      console.log(`  Error: ${validation.error}`);
    }
  }
  console.log();

  // Example 4: Error handling
  console.log('🚨 Example 4: Error Handling');
  const errorResult = await aiService.chatCompletion([
    { role: "user", content: "Hello" }
  ], {
    provider: 'nonexistent'
  });
  
  console.log('Error Result:', JSON.stringify(errorResult, null, 2));
}

// Express.js API endpoint example
function createExpressEndpoints(app, aiService) {
  // Chat completion endpoint
  app.post('/api/chat/completion', async (req, res) => {
    try {
      const { messages, options = {} } = req.body;
      
      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({
          success: false,
          error: "Invalid request: 'messages' array is required"
        });
      }

      const result = await aiService.chatCompletion(messages, options);
      
      if (result.success) {
        res.json(result);
      } else {
        const statusCode = result.code === 'INVALID_API_KEY' ? 401 :
                          result.code === 'RATE_LIMIT' ? 429 :
                          result.code === 'SERVICE_UNAVAILABLE' ? 503 : 400;
        res.status(statusCode).json(result);
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        error: "Internal server error",
        message: error.message
      });
    }
  });

  // Service status endpoint
  app.get('/api/ai/status', (req, res) => {
    res.json(aiService.getStatus());
  });

  // Provider validation endpoint
  app.post('/api/ai/validate/:provider', async (req, res) => {
    const { provider } = req.params;
    const result = await aiService.validateProvider(provider);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  });
}

// Export for use in other modules
module.exports = {
  AIService,
  createExpressEndpoints
};

// Run examples if this file is executed directly
if (require.main === module) {
  runExamples().catch(console.error);
}
