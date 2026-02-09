
import React, { useState, useRef } from 'react';
import { Language, TranslationMode, HistoryItem, UserProfile, CallContext, AppRoute } from '../types';
import { translateText } from '../services/geminiService';
import { ArrowRightLeft, Mic, Camera, Loader2, Sparkles, ChevronRight, Globe, Zap, Copy, Check, Volume2 } from 'lucide-react';
import { COMMUNICATION_TOOLS, MODE_PRICING, SUPPORTED_LANGUAGES } from '../constants';

interface HomePageProps {
  user: UserProfile;
  updateUserPoints: (points: number) => void;
  addToHistory: (item: HistoryItem) => void;
  history: HistoryItem[];
  navigate: (route: AppRoute) => void;
  setCallContext: (context: CallContext) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ user, updateUserPoints, addToHistory, history, navigate, setCallContext }) => {
  const [sourceLang, setSourceLang] = useState<Language>(Language.ENGLISH);
  const [targetLang, setTargetLang] = useState<Language>(Language.CHINESE_SIMPLIFIED);
  const [inputText, setInputText] = useState('');
  const [translatedResult, setTranslatedResult] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [selectedMode, setSelectedMode] = useState<TranslationMode>(TranslationMode.AI_SMART);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const swapLanguages = () => {
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
  };

  const handleTranslate = async () => {
    if (!inputText.trim() || user.points <= 0) return;
    const cost = MODE_PRICING[selectedMode];
    if (user.points < cost) return alert("Insufficient points!");

    setIsTranslating(true);
    const result = await translateText(inputText, sourceLang, targetLang, selectedMode);
    setTranslatedResult(result);
    updateUserPoints(user.points - cost);
    addToHistory({
      id: Date.now().toString(),
      sourceText: inputText,
      targetText: result,
      sourceLang,
      targetLang,
      mode: selectedMode,
      timestamp: Date.now()
    });
    setIsTranslating(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(translatedResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSpeak = () => {
    const utterance = new SpeechSynthesisUtterance(translatedResult);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="pb-36 pt-6 px-6 space-y-10 animate-fade-in-up">
      {/* Premium Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-3xl font-black text-slate-900 tracking-tighter italic">AI live <span className="text-indigo-600">Translations</span></h2>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">Live Engine Online</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="glass-card px-4 py-2 rounded-2xl flex flex-col items-center border border-slate-100 shadow-sm">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Credits</span>
            <span className="text-indigo-600 font-black text-lg">{user.points}</span>
          </div>
          <button className="w-12 h-12 rounded-2xl premium-gradient flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
            <Zap size={20} fill="currentColor" />
          </button>
        </div>
      </div>

      {/* Language Hub */}
      <div className="bg-white/50 backdrop-blur-xl rounded-[2.5rem] shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] border border-white p-3 flex items-center justify-between">
         <div className="flex-1 px-4">
           <select value={sourceLang} onChange={e => setSourceLang(e.target.value as Language)} className="bg-transparent text-xs font-black text-slate-900 outline-none w-full uppercase tracking-widest">{SUPPORTED_LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}</select>
         </div>
         <button onClick={swapLanguages} className="p-4 rounded-full bg-slate-900 text-white shadow-xl hover:rotate-180 transition-transform duration-500"><ArrowRightLeft size={16} strokeWidth={3} /></button>
         <div className="flex-1 px-4 text-right">
           <select value={targetLang} onChange={e => setTargetLang(e.target.value as Language)} className="bg-transparent text-xs font-black text-indigo-600 outline-none w-full uppercase tracking-widest text-right">{SUPPORTED_LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}</select>
         </div>
      </div>

      {/* Input Stage */}
      <div className="bg-white rounded-[3rem] p-8 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.06)] border border-slate-50 relative group">
        <textarea
          value={inputText}
          onChange={e => {
            setInputText(e.target.value);
            if (translatedResult) setTranslatedResult('');
          }}
          placeholder="Type something to translate..."
          className="w-full h-36 bg-transparent text-2xl font-semibold text-slate-800 placeholder-slate-200 outline-none resize-none leading-snug tracking-tight"
        />
        
        <div className="flex justify-between items-center mt-6 pt-6 border-t border-slate-50">
          <div className="flex gap-4">
            <button className="w-14 h-14 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center hover:bg-indigo-50 hover:text-indigo-600 transition-all border border-transparent hover:border-indigo-100"><Mic size={24} /></button>
            <button onClick={() => fileInputRef.current?.click()} className="w-14 h-14 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center hover:bg-indigo-50 hover:text-indigo-600 transition-all border border-transparent hover:border-indigo-100"><Camera size={24} /></button>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" />
          </div>
          
          <button 
            onClick={handleTranslate} 
            disabled={!inputText.trim()} 
            className={`h-16 px-10 rounded-[1.75rem] font-black text-white shadow-2xl transition-all flex items-center gap-3 ${!inputText.trim() ? 'bg-slate-100 text-slate-300' : 'premium-gradient shadow-indigo-500/30 active:scale-95'}`}
          >
            {isTranslating ? <Loader2 size={24} className="animate-spin" /> : 'Translate'}
            {!isTranslating && <ChevronRight size={20} strokeWidth={3} />}
          </button>
        </div>

        {/* Result Area */}
        {translatedResult && (
          <div className="mt-8 p-6 bg-indigo-50/50 rounded-3xl border border-indigo-100 animate-fade-in-up relative overflow-hidden">
            <div className="absolute top-0 right-0 p-3 flex gap-2">
                <button onClick={handleSpeak} className="p-2 text-indigo-400 hover:text-indigo-600 transition-colors"><Volume2 size={18} /></button>
                <button onClick={handleCopy} className="p-2 text-indigo-400 hover:text-indigo-600 transition-colors">{copied ? <Check size={18} className="text-emerald-500" /> : <Copy size={18} />}</button>
            </div>
            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest block mb-2">Translation Result</span>
            <p className="text-xl font-bold text-indigo-950 leading-tight pr-12">{translatedResult}</p>
          </div>
        )}

        {/* Floating AI Aura */}
        <div className="absolute -top-6 -left-6 opacity-50 group-hover:opacity-100 transition-opacity">
           <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600">
              <Sparkles size={20} fill="currentColor" />
           </div>
        </div>
      </div>

      {/* Tools Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-3">
             <div className="w-1 h-6 bg-indigo-600 rounded-full"></div>
             <h3 className="text-slate-900 font-black text-sm uppercase tracking-[0.2em]">Intelligence Suite</h3>
          </div>
          <div className="px-3 py-1 bg-amber-100 rounded-full border border-amber-200 flex items-center gap-1.5">
             <Sparkles size={10} className="text-amber-700" fill="currentColor" />
             <span className="text-[9px] font-black text-amber-800 uppercase tracking-tighter">Pro Trial Active</span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-5">
          {COMMUNICATION_TOOLS.map((tool) => (
            <button
              key={tool.id}
              onClick={() => {
                if (tool.context === 'video_file') navigate(AppRoute.VIDEO_FILE_TRANSLATE);
                else if (tool.context === 'universal') navigate(AppRoute.UNIVERSAL_TRANSLATE);
                else if (tool.context === 'streaming_video') navigate(AppRoute.STREAM_VIDEO);
                else { setCallContext(tool.context as CallContext); navigate(AppRoute.CALL_MODE); }
              }}
              className="group bg-white p-7 rounded-[2.5rem] shadow-[0_10px_30px_-10px_rgba(0,0,0,0.04)] border border-slate-50 hover:border-indigo-200 transition-all hover:shadow-xl hover:-translate-y-1 text-left relative overflow-hidden"
            >
              <div className={`w-16 h-16 ${tool.bgLight} rounded-[1.75rem] flex items-center justify-center ${tool.text} mb-5 group-hover:scale-110 transition-transform duration-500`}>
                <tool.icon size={30} strokeWidth={2.5} />
              </div>
              <h4 className="font-black text-slate-900 text-base tracking-tight leading-tight">{tool.label}</h4>
              <p className="text-[10px] text-slate-400 mt-2 font-bold tracking-widest uppercase leading-tight opacity-70">{tool.desc}</p>
              
              {tool.hasTrial && (
                <div className="mt-4 inline-flex items-center gap-2 px-2.5 py-1 bg-indigo-600 rounded-xl">
                  <Globe size={10} className="text-white" />
                  <span className="text-[9px] font-black uppercase text-white tracking-tighter italic">12 Min Trial</span>
                </div>
              )}

              {/* Decorative Corner */}
              <div className="absolute top-0 right-0 w-12 h-12 bg-indigo-50/50 rounded-bl-full translate-x-4 -translate-y-4"></div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
