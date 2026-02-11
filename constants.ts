
import { Language, TranslationMode } from './types';
import { PlayCircle, Video, Sparkles, Cpu, Scan, Layers, MonitorSmartphone } from 'lucide-react';

export const SUPPORTED_LANGUAGES = Object.values(Language);

export const MODE_PRICING: Record<TranslationMode, number> = {
  [TranslationMode.PREMIUM]: 10,
  [TranslationMode.AI_SMART]: 5,
  [TranslationMode.DEEPL]: 5,
  [TranslationMode.BILINGUAL]: 8,
  [TranslationMode.STANDARD]: 2,
};

export const COMMUNICATION_TOOLS = [
  {
    id: 'universal_overlay',
    label: 'AI Transition',
    icon: Cpu,
    color: 'bg-indigo-600',
    bgLight: 'bg-indigo-50',
    text: 'text-indigo-600',
    context: 'universal',
    desc: 'Universal AI Overlay',
    hasTrial: true,
    trialLimit: 720
  },
  {
    id: 'on_screen_translate',
    label: 'On-Screen Engine',
    icon: Layers,
    color: 'bg-emerald-600',
    bgLight: 'bg-emerald-50',
    text: 'text-emerald-600',
    context: 'screen',
    desc: 'Unlimited Text Inject',
    hasTrial: false,
    trialLimit: 0
  },
  {
    id: 'magic_screen',
    label: 'Magic Screen Hook',
    icon: MonitorSmartphone,
    color: 'bg-amber-600',
    bgLight: 'bg-amber-50',
    text: 'text-amber-600',
    context: 'screen',
    desc: 'Pixel Logic Translate',
    hasTrial: false,
    trialLimit: 0
  },
  {
    id: 'video_call',
    label: 'Direct AI Video',
    icon: Video,
    color: 'bg-purple-600',
    bgLight: 'bg-purple-50',
    text: 'text-purple-600',
    context: 'video',
    desc: 'Internal AI Call',
    hasTrial: true,
    trialLimit: 720
  },
  {
    id: 'video_file',
    label: 'Pro Video Player',
    icon: PlayCircle,
    color: 'bg-blue-600',
    bgLight: 'bg-blue-50',
    text: 'text-blue-600',
    context: 'video_file',
    desc: 'Translate Local Files',
    hasTrial: true,
    trialLimit: 720
  }
];

export const INITIAL_POINTS = 500;
