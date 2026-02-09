import React from 'react';
import { Copy, Volume2, Share2, Check, Sparkles } from 'lucide-react';
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
    <div className="bg-white rounded-[2rem] p-7 shadow-[0_15px_40px_-15px_rgba(0,0,0,0.04)] border border-slate-50 animate-fade-in-up hover:shadow-xl transition-all duration-500 group">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
           <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
              <Sparkles size={18} fill="currentColor" />
           </div>
           <div className="flex flex-col">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none mb-1">Context Flow</span>
              <span className="text-xs font-black text-slate-900 uppercase tracking-tighter">{item.sourceLang} &rarr; {item.targetLang}</span>
           </div>
        </div>
        <div className="text-[9px] font-black text-indigo-600 bg-indigo-50/50 px-3 py-1.5 rounded-xl border border-indigo-100 uppercase tracking-widest">
          {item.mode}
        </div>
      </div>

      {/* Content */}
      <div className="space-y-4">
        <div>
          <p className="text-slate-900 text-xl font-bold leading-tight tracking-tight group-hover:text-indigo-950 transition-colors">{item.targetText}</p>
        </div>
        
        {item.mode === 'Bilingual' && (
           <div className="pt-4 border-t border-slate-50">
             <p className="text-slate-400 text-sm font-semibold italic">"{item.sourceText}"</p>
           </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 mt-6">
        <button 
          onClick={() => handleSpeak(item.targetText, item.targetLang)}
          className="w-11 h-11 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all border border-transparent hover:border-indigo-100"
        >
          <Volume2 size={18} strokeWidth={2.5} />
        </button>
        <button 
          onClick={handleCopy}
          className="w-11 h-11 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all border border-transparent hover:border-indigo-100"
        >
          {copied ? <Check size={18} strokeWidth={2.5} className="text-emerald-500" /> : <Copy size={18} strokeWidth={2.5} />}
        </button>
        <button 
          className="w-11 h-11 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all border border-transparent hover:border-indigo-100"
        >
          <Share2 size={18} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
};