import { Language, TranslationMode } from './types';
import { Globe, Zap, Phone, Video, Mic, Layers, Star, MessageCircle, Monitor, PhoneCall, Users, Sparkles } from 'lucide-react';

export const SUPPORTED_LANGUAGES = [
  Language.ENGLISH,
  Language.CHINESE_SIMPLIFIED,
  Language.SPANISH,
  Language.JAPANESE,
  Language.KOREAN,
  Language.FRENCH,
  Language.GERMAN,
  Language.BENGALI,
  Language.HINDI,
  Language.URDU,
  Language.ARABIC
];

export const MODE_PRICING: Record<TranslationMode, number> = {
  [TranslationMode.PREMIUM]: 10,
  [TranslationMode.AI_SMART]: 5,
  [TranslationMode.DEEPL]: 5,
  [TranslationMode.BILINGUAL]: 8,
  [TranslationMode.STANDARD]: 2,
};

export const QUICK_ACTIONS = [
  { 
    id: 'premium', 
    label: 'Pro Translation', 
    icon: Sparkles, 
    color: 'bg-gradient-to-br from-[#6366f1] to-[#8b5cf6]', // Indigo to Violet
    shadow: 'shadow-indigo-500/30',
    mode: TranslationMode.PREMIUM 
  },
  { 
    id: 'deepl', 
    label: 'Natural Flow', 
    icon: Globe, 
    color: 'bg-gradient-to-br from-[#0ea5e9] to-[#2563eb]', // Sky to Blue
    shadow: 'shadow-blue-500/30',
    mode: TranslationMode.DEEPL 
  }
];

export const COMMUNICATION_TOOLS = [
  {
    id: 'face',
    label: 'Face-to-Face',
    icon: Users,
    color: 'bg-gradient-to-br from-indigo-500 to-indigo-600',
    bgLight: 'bg-indigo-50',
    text: 'text-indigo-600',
    context: 'face-to-face',
    desc: 'Bilingual Chat'
  },
  {
    id: 'phone',
    label: 'Phone Call',
    icon: PhoneCall,
    color: 'bg-gradient-to-br from-emerald-500 to-teal-600',
    bgLight: 'bg-emerald-50',
    text: 'text-emerald-600',
    context: 'phone',
    desc: 'Live Captioning'
  },
  {
    id: 'whatsapp',
    label: 'App Call',
    icon: MessageCircle,
    color: 'bg-gradient-to-br from-green-500 to-green-600',
    bgLight: 'bg-green-50',
    text: 'text-green-600',
    context: 'whatsapp',
    desc: 'Voice Translate'
  },
  {
    id: 'conference',
    label: 'Meeting',
    icon: Monitor,
    color: 'bg-gradient-to-br from-blue-500 to-blue-600',
    bgLight: 'bg-blue-50',
    text: 'text-blue-600',
    context: 'conference',
    desc: 'Zoom / Teams'
  }
];

export const INITIAL_POINTS = 500;
