import { GoogleGenAI, GenerateContentResponse, Part } from "@google/genai";
import { GEMINI_CHAT_MODEL_NAME } from '../constants';
import { Language } from '../types';

const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;

// Log warning but don't throw error - allow app to run without Gemini
if (!API_KEY) {
  console.warn("API_KEY for Gemini is not set. AI features will be disabled.");
}

// Only initialize if API key is available
let ai: GoogleGenAI | null = null;
if (API_KEY) {
  try {
    ai = new GoogleGenAI({ apiKey: API_KEY });
  } catch (error) {
    console.error("Failed to initialize GoogleGenAI:", error);
    ai = null;
  }
}

export const translateText = async (text: string, targetLanguage: Language): Promise<string> => {
  if (!API_KEY || !ai) {
    console.warn("Gemini API not available for translation");
    return text; // Return original text if no API key
  }
  
  try {
    const model = GEMINI_CHAT_MODEL_NAME;
    const prompt = `Translate the following text to ${targetLanguage}: "${text}"`;
    
    const contents: Part[] = [{ text: prompt }];

    const model_obj = ai.getGenerativeModel({ model: model });
    const response = await model_obj.generateContent({
      contents: [{ parts: contents }],
      generationConfig: {
        temperature: 0.3,
      }
    });

    const result = await response.response;
    const translatedText = result.text();
    if (translatedText) {
      return translatedText.trim();
    } else {
      console.error("Gemini API returned no text for translation.", response);
      return "Translation not available.";
    }
  } catch (error) {
    console.error("Error translating text with Gemini:", error);
    // Check for specific Gemini errors if needed
    // if (error instanceof GoogleGenAIError) { ... }
    return `Error during translation. Original: ${text}`;
  }
};

export const getChatResponse = async (promptText: string): Promise<string> => {
  if (!API_KEY || !ai) {
    console.warn("Gemini API not available for chat");
    return "AI assistant is currently unavailable. Please configure the Gemini API key to enable AI features.";
  }

  try {
    const model_obj = ai.getGenerativeModel({ model: GEMINI_CHAT_MODEL_NAME });
    const contents: Part[] = [{ text: promptText }];

    const response = await model_obj.generateContent({
      contents: [{ parts: contents }],
      generationConfig: {
        temperature: 0.7,
      }
    });

    const result = await response.response;
    const text = result.text();

    if (text) {
      return text.trim();
    } else {
      console.error("Gemini API returned no text.", response);
      return "Sorry, I couldn't generate a response.";
    }

  } catch (error) {
    console.error("Error with Gemini chat:", error);
    let errorMessage = "Sorry, I encountered an error. Please try again.";
    if (error instanceof Error) {
      errorMessage = `Error: ${error.message}`;
    }
    return errorMessage;
  }
};

export const getResponseWithGoogleSearch = async (promptText: string): Promise<{text: string, sources: any[]}> => {
  if (!API_KEY || !ai) {
    console.warn("Gemini API not available for search");
    return {text: "AI assistant is currently unavailable. Please configure the Gemini API key to enable AI features.", sources: []};
  }

  try {
    const model_obj = ai.getGenerativeModel({ model: GEMINI_CHAT_MODEL_NAME });
    const contents: Part[] = [{ text: promptText }];

    const response = await model_obj.generateContent({
      contents: [{ parts: contents }],
      generationConfig: {
        temperature: 0.7,
      }
    });

    const result = await response.response;
    const text = result.text();

    if (text) {
      return {text: text.trim(), sources: []};
    } else {
      console.error("Gemini API returned no text.", response);
      return {text: "No response available.", sources: []};
    }

  } catch (error) {
    console.error("Error with Gemini and Google Search:", error);
    let errorMessage = "Error fetching response.";
    if (error instanceof Error) {
      errorMessage = `Error: ${error.message}`;
    }
    return {text: errorMessage, sources: []};
  }
};

// Placeholder for future use, not actively used in this MVP's chat.
// This shows how to get a JSON response specifically.
export const getStructuredResponse = async <T,>(promptText: string, exampleJson: T): Promise<T | null> => {
  if (!API_KEY || !ai) {
    console.warn("Gemini API not available for structured response");
    return null;
  }

  try {
    const model_obj = ai.getGenerativeModel({ model: GEMINI_CHAT_MODEL_NAME });
    const prompt = `${promptText}. Please provide the response in valid JSON format only, without any markdown formatting or explanations. Here is an example of the structure: ${JSON.stringify(exampleJson, null, 2)}`;

    const contents: Part[] = [{ text: prompt }];

    const response = await model_obj.generateContent({
      contents: [{ parts: contents }],
      generationConfig: {
        temperature: 0.1,
      }
    });

    const result = await response.response;
    let jsonStr = result.text().trim();

    // Remove markdown code fences if present
    const fenceRegex = /^```(?:json)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[2]) {
      jsonStr = match[2].trim();
    }

    // Try to parse the JSON
    return JSON.parse(jsonStr) as T;

  } catch (error) {
    console.error("Error getting structured response from Gemini:", error);
    if (error instanceof SyntaxError) {
      console.error("JSON parsing failed. Response was not valid JSON.");
    }
    return null;
  }
};
