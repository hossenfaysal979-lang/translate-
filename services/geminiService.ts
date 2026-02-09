
import { GoogleGenAI } from "@google/genai";
import { Language, TranslationMode } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const translateText = async (
  text: string,
  sourceLang: Language,
  targetLang: Language,
  mode: TranslationMode,
  useInternetGrounding: boolean = false
): Promise<string> => {
  if (!text.trim()) return "";

  const modelId = useInternetGrounding || mode === TranslationMode.PREMIUM 
    ? 'gemini-3-pro-preview' 
    : 'gemini-3-flash-preview';
  
  const isAuto = sourceLang === Language.AUTO_DETECT;
  let systemInstruction = `You are a professional real-time translator specializing in "Autocratic" (Automatic) language detection. `;
  
  if (isAuto) {
    systemInstruction += `The source language is unknown. First, analyze the input text to identify the spoken language. Then, translate that text accurately into ${targetLang}. `;
  } else {
    systemInstruction += `Translate the following text from ${sourceLang} to ${targetLang}. `;
  }

  if (useInternetGrounding) {
    systemInstruction += `This is internet/web content. Use Google Search to cross-reference terms, trending slang, or news context to ensure the translation is relevant to the current internet landscape. `;
  }

  systemInstruction += `Output ONLY the translated text. Maintain the original tone and urgency. Keep it concise for real-time captions.`;

  try {
    const config: any = {
      systemInstruction,
      temperature: 0.1,
    };

    if (useInternetGrounding) {
      config.tools = [{ googleSearch: {} }];
    }

    const response = await ai.models.generateContent({
      model: modelId,
      contents: text,
      config,
    });

    return response.text || "";
  } catch (error) {
    console.error("Translation error:", error);
    return "Translation failed. Check connection.";
  }
};

export const translateImage = async (
  base64Image: string,
  sourceLang: Language,
  targetLang: Language
): Promise<string> => {
  try {
    const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: cleanBase64
            }
          },
          {
            text: `Transcribe and translate all text in this image from ${sourceLang} to ${targetLang}. Return ONLY the translated results.`
          }
        ]
      }
    });

    return response.text || "";
  } catch (error) {
    console.error("Image translation error:", error);
    return "Image processing failed.";
  }
};

export const generateConversationResponse = async (
  lastUserMessage: string,
  sourceLang: Language,
  targetLang: Language
): Promise<{ original: string; translated: string }> => {
  try {
    const prompt = `Roleplay as a local native speaker of ${targetLang}. 
    User said: "${lastUserMessage}" (in ${sourceLang}).
    Reply naturally in ${targetLang}. 1-2 sentences maximum.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    const partnerReply = response.text || "...";

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
