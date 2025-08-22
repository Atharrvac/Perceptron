import OpenAI from 'openai';
import { Language } from '../types';

const API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

// Log warning but don't throw error - allow app to run without OpenAI
if (!API_KEY) {
  console.warn("VITE_OPENAI_API_KEY is not set. AI features will be disabled.");
}

// Only initialize if API key is available
let openai: OpenAI | null = null;
if (API_KEY) {
  try {
    openai = new OpenAI({
      apiKey: API_KEY,
      dangerouslyAllowBrowser: true
    });
  } catch (error) {
    console.error("Failed to initialize OpenAI:", error);
    openai = null;
  }
}

export const translateText = async (text: string, targetLanguage: Language): Promise<string> => {
  if (!API_KEY || !openai) {
    console.warn("OpenAI API not available for translation");
    return text; // Return original text if no API key
  }
  
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
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
      temperature: 0.3,
      max_tokens: 1000
    });

    const translatedText = response.choices[0]?.message?.content;
    if (translatedText) {
      return translatedText.trim();
    } else {
      console.error("OpenAI API returned no text for translation.", response);
      return "Translation not available.";
    }
  } catch (error) {
    console.error("Error translating text with OpenAI:", error);
    return `Error during translation. Original: ${text}`;
  }
};

export const getChatResponse = async (promptText: string): Promise<string> => {
  if (!API_KEY || !openai) {
    console.warn("OpenAI API not available for chat");
    return "AI assistant is currently unavailable. Please configure the OpenAI API key to enable AI features.";
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
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
      temperature: 0.7,
      max_tokens: 2000
    });

    const text = response.choices[0]?.message?.content;

    if (text) {
      return text.trim();
    } else {
      console.error("OpenAI API returned no text.", response);
      return "Sorry, I couldn't generate a response.";
    }

  } catch (error) {
    console.error("Error with OpenAI chat:", error);
    let errorMessage = "Sorry, I encountered an error. Please try again.";
    if (error instanceof Error) {
      errorMessage = `Error: ${error.message}`;
    }
    return errorMessage;
  }
};

export const getResponseWithGoogleSearch = async (promptText: string): Promise<{text: string, sources: any[]}> => {
  if (!API_KEY || !openai) {
    console.warn("OpenAI API not available for search");
    return {text: "AI assistant is currently unavailable. Please configure the OpenAI API key to enable AI features.", sources: []};
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
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
      temperature: 0.7,
      max_tokens: 2000
    });

    const text = response.choices[0]?.message?.content;

    if (text) {
      return {text: text.trim(), sources: []};
    } else {
      console.error("OpenAI API returned no text.", response);
      return {text: "No response available.", sources: []};
    }

  } catch (error) {
    console.error("Error with OpenAI search response:", error);
    let errorMessage = "Error fetching response.";
    if (error instanceof Error) {
      errorMessage = `Error: ${error.message}`;
    }
    return {text: errorMessage, sources: []};
  }
};

export const getStructuredResponse = async <T,>(promptText: string, exampleJson: T): Promise<T | null> => {
  if (!API_KEY || !openai) {
    console.warn("OpenAI API not available for structured response");
    return null;
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
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
      temperature: 0.1,
      max_tokens: 2000
    });

    const text = response.choices[0]?.message?.content;
    if (!text) {
      console.error("OpenAI API returned no text for structured response");
      return null;
    }

    let jsonStr = text.trim();

    // Remove markdown code fences if present
    const fenceRegex = /^```(?:json)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[1]) {
      jsonStr = match[1].trim();
    }

    // Try to parse the JSON
    return JSON.parse(jsonStr) as T;

  } catch (error) {
    console.error("Error getting structured response from OpenAI:", error);
    if (error instanceof SyntaxError) {
      console.error("JSON parsing failed. Response was not valid JSON.");
    }
    return null;
  }
};
