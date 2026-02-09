import { GoogleGenAI } from "@google/genai";
import { Language, TranslationMode } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const translateText = async (
  text: string,
  sourceLang: Language,
  targetLang: Language,
  mode: TranslationMode
): Promise<string> => {
  if (!text.trim()) return "";

  const modelId = mode === TranslationMode.PREMIUM ? 'gemini-3-pro-preview' : 'gemini-3-flash-preview';
  
  let systemInstruction = `You are a professional translator. Translate from ${sourceLang} to ${targetLang}.`;

  switch (mode) {
    case TranslationMode.PREMIUM:
      systemInstruction += " Use high-level vocabulary, perfect grammar, and ensure cultural nuance is preserved. This is for business/formal use.";
      break;
    case TranslationMode.DEEPL:
      systemInstruction += " Focus on natural, fluent phrasing that a native speaker would use. Avoid literal translations.";
      break;
    case TranslationMode.BILINGUAL:
      systemInstruction += " Provide the output in the format: '[Translated Text]'. Do not include the original text in the output, the UI handles that.";
      break;
    case TranslationMode.STANDARD:
    default:
      systemInstruction += " Keep it simple and accurate.";
      break;
  }

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: text,
      config: {
        systemInstruction,
        temperature: 0.3, // Lower temperature for more accurate translation
      },
    });

    return response.text || "";
  } catch (error) {
    console.error("Translation error:", error);
    return "Translation failed. Please try again.";
  }
};

export const translateImage = async (
  base64Image: string,
  sourceLang: Language,
  targetLang: Language
): Promise<string> => {
  try {
    // Remove data URL prefix if present
    const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg', // Assuming jpeg for simplicity, or detect from source
              data: cleanBase64
            }
          },
          {
            text: `Transcribe and translate all text in this image from ${sourceLang} to ${targetLang}. Return only the translated text.`
          }
        ]
      }
    });

    return response.text || "";
  } catch (error) {
    console.error("Image translation error:", error);
    return "Could not process image. Please try again.";
  }
};

// Mock function to simulate a conversation response for the "Partner" in conversation mode
export const generateConversationResponse = async (
  lastUserMessage: string,
  sourceLang: Language, // User's language
  targetLang: Language // Partner's language
): Promise<{ original: string; translated: string }> => {
  try {
    const prompt = `You are roleplaying as a helpful local native speaker of ${targetLang}. 
    The user said: "${lastUserMessage}" (in ${sourceLang}).
    Reply naturally in ${targetLang}. Keep it brief (1-2 sentences).`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    const partnerReply = response.text || "...";

    // Now translate the partner's reply back to user's language so they understand
    const translationResponse = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Translate this text from ${targetLang} to ${sourceLang}: "${partnerReply}"`,
    });

    return {
      original: partnerReply,
      translated: translationResponse.text || partnerReply
    };

  } catch (error) {
    return { original: "...", translated: "..." };
  }
};
