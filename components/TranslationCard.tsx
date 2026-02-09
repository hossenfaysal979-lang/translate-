import React from 'react';
import { Copy, Volume2, Share2, Check } from 'lucide-react';
import { HistoryItem } from '../types';

interface TranslationCardProps {
  item: HistoryItem;
}

export const TranslationCard: React.FC<TranslationCardProps> = ({ item }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(item.targetText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSpeak = (text: string, lang: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    let locale = 'en-US';
    if (lang.includes('Chinese')) locale = 'zh-CN';
    if (lang.includes('Spanish')) locale = 'es-ES';
    if (lang.includes('Japanese')) locale = 'ja-JP';
    if (lang.includes('Korean')) locale = 'ko-KR';
    if (lang.includes('French')) locale = 'fr-FR';
    if (lang.includes('German')) locale = 'de-DE';
    if (lang.includes('Bengali')) locale = 'bn-IN';
    if (lang.includes('Hindi')) locale = 'hi-IN';
    if (lang.includes('Urdu')) locale = 'ur-PK';
    if (lang.includes('Arabic')) locale = 'ar-SA';
    if (lang.includes('Indonesian')) locale = 'id-ID';
    
    utterance.lang = locale;
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="bg-white rounded-[1.5rem] p-5 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.05)] border border-slate-100 animate-fade-in-up hover:shadow-lg transition-shadow duration-300">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
           <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
           <span className="text-xs font-bold text-slate-500 uppercase">{item.sourceLang} &rarr; {item.targetLang}</span>
        </div>
        <div className="text-[10px] font-bold text-indigo-500 bg-indigo-50 px-2 py-1 rounded-md">
          {item.mode}
        </div>
      </div>

      {/* Content */}
      <div className="space-y-3">
        <div>
          <p className="text-slate-800 text-lg font-medium leading-relaxed">{item.targetText}</p>
        </div>
        
        {item.mode === 'Bilingual' && (
           <div className="pt-3 mt-1">
             <p className="text-slate-400 text-sm font-medium">{item.sourceText}</p>
           </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2 mt-4">
        <button 
          onClick={() => handleSpeak(item.targetText, item.targetLang)}
          className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
        >
          <Volume2 size={18} strokeWidth={2.5} />
        </button>
        <button 
          onClick={handleCopy}
          className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
        >
          {copied ? <Check size={18} strokeWidth={2.5} className="text-emerald-500" /> : <Copy size={18} strokeWidth={2.5} />}
        </button>
      </div>
    </div>
  );
};