export enum AppRoute {
  HOME = 'HOME',
  CONVERSATION = 'CONVERSATION',
  HISTORY = 'HISTORY',
  PROFILE = 'PROFILE',
  CALL_MODE = 'CALL_MODE'
}

export type CallContext = 'face-to-face' | 'phone' | 'whatsapp' | 'conference';

export enum Language {
  ENGLISH = 'English',
  CHINESE_SIMPLIFIED = 'Chinese (Simplified)',
  SPANISH = 'Spanish',
  JAPANESE = 'Japanese',
  KOREAN = 'Korean',
  FRENCH = 'French',
  GERMAN = 'German',
  BENGALI = 'Bengali',
  HINDI = 'Hindi',
  URDU = 'Urdu',
  ARABIC = 'Arabic'
}

export enum TranslationMode {
  PREMIUM = 'Premium', // High accuracy, expensive
  AI_SMART = 'AI Smart', // Balanced
  STANDARD = 'Standard', // Fast
  DEEPL = 'DeepL-Style', // Natural phrasing
  BILINGUAL = 'Bilingual', // Shows both
}

export interface HistoryItem {
  id: string;
  sourceText: string;
  targetText: string;
  sourceLang: Language;
  targetLang: Language;
  timestamp: number;
  mode: TranslationMode;
}

export interface UserProfile {
  name: string;
  points: number;
  isPremium: boolean;
  avatarUrl: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai' | 'partner';
  text: string;
  originalText?: string; // For bilingual mode
  timestamp: number;
}
