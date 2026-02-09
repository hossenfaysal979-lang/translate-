
export enum AppRoute {
  HOME = 'HOME',
  CONVERSATION = 'CONVERSATION',
  HISTORY = 'HISTORY',
  PROFILE = 'PROFILE',
  CALL_MODE = 'CALL_MODE',
  VIDEO_FILE_TRANSLATE = 'VIDEO_FILE_TRANSLATE',
  STREAM_VIDEO = 'STREAM_VIDEO',
  UNIVERSAL_TRANSLATE = 'UNIVERSAL_TRANSLATE'
}

export type CallContext = 'face-to-face' | 'phone' | 'whatsapp' | 'conference' | 'video' | 'video_file' | 'universal' | 'internet';

export enum Language {
  ENGLISH = 'English',
  INDONESIAN = 'Indonesian',
  CHINESE_SIMPLIFIED = 'Chinese (Simplified)',
  SPANISH = 'Spanish',
  JAPANESE = 'Japanese',
  KOREAN = 'Korean',
  FRENCH = 'French',
  GERMAN = 'German',
  BENGALI = 'Bengali',
  HINDI = 'Hindi',
  URDU = 'Urdu',
  ARABIC = 'Arabic',
  AUTO_DETECT = 'Auto Detect'
}

export enum TranslationMode {
  PREMIUM = 'Premium',
  AI_SMART = 'AI Smart',
  STANDARD = 'Standard',
  DEEPL = 'DeepL-Style',
  BILINGUAL = 'Bilingual',
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
  originalText?: string;
  timestamp: number;
}
