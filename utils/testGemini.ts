// Test utility to verify Gemini API configuration
import { GoogleGenAI } from "@google/genai";

export const testGeminiConnection = async (): Promise<{ success: boolean; message: string }> => {
  const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
  
  if (!API_KEY) {
    return {
      success: false,
      message: "Google API key not configured. Please set VITE_GOOGLE_API_KEY environment variable."
    };
  }

  try {
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    const model = ai.getGenerativeModel({ model: 'gemini-2.5-flash' });
    
    const result = await model.generateContent({
      contents: [{ parts: [{ text: "Hello! Please respond with just 'API Working' to confirm the connection." }] }],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 10,
      }
    });

    const response = await result.response;
    const text = response.text();
    
    return {
      success: true,
      message: `API connection successful. Response: ${text.trim()}`
    };
  } catch (error) {
    let errorMessage = "Unknown error occurred";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    return {
      success: false,
      message: `API connection failed: ${errorMessage}`
    };
  }
};
