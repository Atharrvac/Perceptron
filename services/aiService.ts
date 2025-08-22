import OpenAI from 'openai';
import { Language } from '../types';

// API Configuration
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;

// Provider types
export type AIProvider = 'openai' | 'openrouter' | 'auto';

// Configuration interface
interface AIConfig {
  provider: AIProvider;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

// Error response interface
interface AIError {
  success: false;
  error: string;
  provider?: string;
  code?: string;
}

// Success response interface
interface AISuccess<T = string> {
  success: true;
  data: T;
  provider: string;
  model: string;
}

export type AIResponse<T = string> = AISuccess<T> | AIError;

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
  private openaiClient: OpenAI | null = null;
  private openrouterClient: OpenAI | null = null;
  private activeProvider: 'openai' | 'openrouter' | null = null;

  constructor() {
    this.initializeClients();
  }

  private initializeClients() {
    // Initialize OpenAI client
    if (OPENAI_API_KEY && OPENAI_API_KEY.trim()) {
      try {
        this.openaiClient = new OpenAI({
          apiKey: OPENAI_API_KEY,
          dangerouslyAllowBrowser: true
        });
      } catch (error) {
        console.error("Failed to initialize OpenAI client:", error);
      }
    }

    // Initialize OpenRouter client
    if (OPENROUTER_API_KEY && OPENROUTER_API_KEY.trim()) {
      try {
        this.openrouterClient = new OpenAI({
          apiKey: OPENROUTER_API_KEY,
          baseURL: PROVIDER_CONFIGS.openrouter.baseURL,
          dangerouslyAllowBrowser: true,
          defaultHeaders: {
            "HTTP-Referer": window.location.origin,
            "X-Title": "HDTN Connect"
          }
        });
      } catch (error) {
        console.error("Failed to initialize OpenRouter client:", error);
      }
    }

    // Set active provider (prefer OpenRouter if both available)
    if (this.openrouterClient) {
      this.activeProvider = 'openrouter';
    } else if (this.openaiClient) {
      this.activeProvider = 'openai';
    } else {
      this.activeProvider = null;
      console.warn("No AI API keys configured. AI features will be disabled.");
    }
  }

  private getClient(provider?: AIProvider): { client: OpenAI; providerName: string } | null {
    const targetProvider = provider === 'auto' || !provider ? this.activeProvider : provider;

    switch (targetProvider) {
      case 'openai':
        return this.openaiClient ? { client: this.openaiClient, providerName: 'openai' } : null;
      case 'openrouter':
        return this.openrouterClient ? { client: this.openrouterClient, providerName: 'openrouter' } : null;
      default:
        return null;
    }
  }

  private getModel(provider: string, modelType: 'chat' | 'chatAdvanced' | 'chatFast' = 'chat'): string {
    const config = PROVIDER_CONFIGS[provider as keyof typeof PROVIDER_CONFIGS];
    return config?.models[modelType] || config?.models.chat || 'gpt-3.5-turbo';
  }

  private createErrorResponse(error: string, provider?: string, code?: string): AIError {
    return {
      success: false,
      error,
      provider,
      code
    };
  }

  private createSuccessResponse<T>(data: T, provider: string, model: string): AISuccess<T> {
    return {
      success: true,
      data,
      provider,
      model
    };
  }

  public async translateText(text: string, targetLanguage: Language, config?: AIConfig): Promise<AIResponse<string>> {
    const clientInfo = this.getClient(config?.provider);
    if (!clientInfo) {
      return this.createErrorResponse("No AI provider available. Please configure API keys.");
    }

    const { client, providerName } = clientInfo;
    const model = config?.model || this.getModel(providerName, 'chat');

    try {
      const response = await client.chat.completions.create({
        model,
        messages: [
          {
            role: "system",
            content: "You are a professional translator. Translate the given text accurately to the target language."
          },
          {
            role: "user",
            content: `Translate the following text to ${targetLanguage}: "${text}"`
          }
        ],
        temperature: config?.temperature || 0.3,
        max_tokens: config?.maxTokens || 1000
      });

      const translatedText = response.choices[0]?.message?.content;
      if (translatedText) {
        return this.createSuccessResponse(translatedText.trim(), providerName, model);
      } else {
        return this.createErrorResponse("No translation returned from AI service", providerName);
      }
    } catch (error: any) {
      console.error(`Error translating text with ${providerName}:`, error);
      return this.createErrorResponse(
        error.message || "Translation failed",
        providerName,
        error.code || error.status?.toString()
      );
    }
  }

  public async getChatResponse(promptText: string, config?: AIConfig): Promise<AIResponse<string>> {
    const clientInfo = this.getClient(config?.provider);
    if (!clientInfo) {
      return this.createErrorResponse("No AI provider available. Please configure API keys.");
    }

    const { client, providerName } = clientInfo;
    const model = config?.model || this.getModel(providerName, 'chat');

    try {
      const response = await client.chat.completions.create({
        model,
        messages: [
          {
            role: "system",
            content: "You are a helpful AI assistant. Provide helpful, accurate, and engaging responses."
          },
          {
            role: "user",
            content: promptText
          }
        ],
        temperature: config?.temperature || 0.7,
        max_tokens: config?.maxTokens || 2000
      });

      const text = response.choices[0]?.message?.content;
      if (text) {
        return this.createSuccessResponse(text.trim(), providerName, model);
      } else {
        return this.createErrorResponse("No response returned from AI service", providerName);
      }
    } catch (error: any) {
      console.error(`Error with ${providerName} chat:`, error);
      return this.createErrorResponse(
        error.message || "Chat request failed",
        providerName,
        error.code || error.status?.toString()
      );
    }
  }

  public async getResponseWithSearch(promptText: string, config?: AIConfig): Promise<AIResponse<{text: string, sources: any[]}>> {
    const clientInfo = this.getClient(config?.provider);
    if (!clientInfo) {
      return this.createErrorResponse("No AI provider available. Please configure API keys.");
    }

    const { client, providerName } = clientInfo;
    const model = config?.model || this.getModel(providerName, 'chatAdvanced');

    try {
      const response = await client.chat.completions.create({
        model,
        messages: [
          {
            role: "system",
            content: "You are a helpful AI assistant with access to current information. Provide comprehensive and up-to-date responses based on the user's query. When possible, mention that you're providing general information and suggest users verify details from official sources."
          },
          {
            role: "user",
            content: promptText
          }
        ],
        temperature: config?.temperature || 0.7,
        max_tokens: config?.maxTokens || 2000
      });

      const text = response.choices[0]?.message?.content;
      if (text) {
        return this.createSuccessResponse({text: text.trim(), sources: []}, providerName, model);
      } else {
        return this.createErrorResponse("No response returned from AI service", providerName);
      }
    } catch (error: any) {
      console.error(`Error with ${providerName} search response:`, error);
      return this.createErrorResponse(
        error.message || "Search request failed",
        providerName,
        error.code || error.status?.toString()
      );
    }
  }

  public async getStructuredResponse<T>(promptText: string, exampleJson: T, config?: AIConfig): Promise<AIResponse<T>> {
    const clientInfo = this.getClient(config?.provider);
    if (!clientInfo) {
      return this.createErrorResponse("No AI provider available. Please configure API keys.");
    }

    const { client, providerName } = clientInfo;
    const model = config?.model || this.getModel(providerName, 'chat');

    try {
      const response = await client.chat.completions.create({
        model,
        messages: [
          {
            role: "system",
            content: "You are a helpful AI assistant that provides responses in valid JSON format only. Do not include markdown formatting, explanations, or any text outside the JSON structure."
          },
          {
            role: "user",
            content: `${promptText}. Please provide the response in valid JSON format only. Here is an example of the structure: ${JSON.stringify(exampleJson, null, 2)}`
          }
        ],
        temperature: config?.temperature || 0.1,
        max_tokens: config?.maxTokens || 2000
      });

      const text = response.choices[0]?.message?.content;
      if (!text) {
        return this.createErrorResponse("No response returned from AI service", providerName);
      }

      let jsonStr = text.trim();

      // Remove markdown code fences if present
      const fenceRegex = /^```(?:json)?\s*\n?(.*?)\n?\s*```$/s;
      const match = jsonStr.match(fenceRegex);
      if (match && match[1]) {
        jsonStr = match[1].trim();
      }

      try {
        const parsedData = JSON.parse(jsonStr) as T;
        return this.createSuccessResponse(parsedData, providerName, model);
      } catch (parseError) {
        return this.createErrorResponse("Failed to parse JSON response", providerName, "PARSE_ERROR");
      }
    } catch (error: any) {
      console.error(`Error getting structured response from ${providerName}:`, error);
      return this.createErrorResponse(
        error.message || "Structured request failed",
        providerName,
        error.code || error.status?.toString()
      );
    }
  }

  public getAvailableProviders(): string[] {
    const providers: string[] = [];
    if (this.openaiClient) providers.push('openai');
    if (this.openrouterClient) providers.push('openrouter');
    return providers;
  }

  public getActiveProvider(): string | null {
    return this.activeProvider;
  }

  public async validateProvider(provider: AIProvider): Promise<AIResponse<boolean>> {
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
    } catch (error: any) {
      return this.createErrorResponse(
        `Provider validation failed: ${error.message}`,
        provider,
        error.code || error.status?.toString()
      );
    }
  }
}

// Create singleton instance
const aiService = new AIService();

// Legacy exports for backward compatibility
export const translateText = async (text: string, targetLanguage: Language): Promise<string> => {
  const result = await aiService.translateText(text, targetLanguage);
  return result.success ? result.data : `Error: ${result.error}`;
};

export const getChatResponse = async (promptText: string): Promise<string> => {
  const result = await aiService.getChatResponse(promptText);
  return result.success ? result.data : `Error: ${result.error}`;
};

export const getResponseWithGoogleSearch = async (promptText: string): Promise<{text: string, sources: any[]}> => {
  const result = await aiService.getResponseWithSearch(promptText);
  return result.success ? result.data : { text: `Error: ${result.error}`, sources: [] };
};

export const getStructuredResponse = async <T,>(promptText: string, exampleJson: T): Promise<T | null> => {
  const result = await aiService.getStructuredResponse(promptText, exampleJson);
  return result.success ? result.data : null;
};

// Export the service instance and types
export { aiService, AIService };
export type { AIProvider, AIConfig, AIResponse, AIError, AISuccess };
