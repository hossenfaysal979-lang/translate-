
import React, { useState, useRef } from 'react';
import { Language, TranslationMode, HistoryItem, UserProfile, CallContext, AppRoute } from '../types';
import { translateText, translateImage } from '../services/geminiService';
import { ArrowRightLeft, Mic, Camera, Send, X, Loader2, ChevronDown, Sparkles } from 'lucide-react';
import { TranslationCard } from '../components/TranslationCard';
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
  const [isTranslating, setIsTranslating] = useState(false);
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
    setInputText(''); 
  };

  return (
    <div className="pb-36 pt-4 px-6 space-y-8 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">AI Translate</h2>
          <p className="text-slate-400 text-sm font-medium mt-1">Ready for conversation</p>
        </div>
        <div className="bg-white p-2.5 rounded-2xl shadow-sm border border-slate-100">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5 text-center">Points</div>
          <div className="text-indigo-600 font-black text-center">{user.points}</div>
        </div>
      </div>

      <div className="bg-white/70 backdrop-blur-2xl rounded-full shadow-sm border border-white/60 p-2 flex items-center justify-between">
         <div className="flex-1 text-center"><select value={sourceLang} onChange={e => setSourceLang(e.target.value as Language)} className="bg-transparent text-sm font-bold text-slate-700 outline-none w-full">{SUPPORTED_LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}</select></div>
         <button onClick={swapLanguages} className="p-3 rounded-full bg-slate-900 text-white shadow-lg mx-2"><ArrowRightLeft size={16} strokeWidth={3} /></button>
         <div className="flex-1 text-center"><select value={targetLang} onChange={e => setTargetLang(e.target.value as Language)} className="bg-transparent text-sm font-bold text-indigo-600 outline-none w-full">{SUPPORTED_LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}</select></div>
      </div>

      <div className="bg-white rounded-[2.5rem] p-6 shadow-xl border border-indigo-50/50">
        <textarea
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          placeholder="Enter message..."
          className="w-full h-32 bg-transparent text-xl font-medium text-slate-800 placeholder-slate-300 outline-none resize-none leading-snug"
        />
        <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-50">
          <div className="flex gap-3">
            <button onClick={() => {}} className="p-4 bg-slate-50 text-slate-500 rounded-2xl hover:bg-indigo-50 hover:text-indigo-600 transition-all"><Mic size={22} /></button>
            <button onClick={() => fileInputRef.current?.click()} className="p-4 bg-slate-50 text-slate-500 rounded-2xl hover:bg-indigo-50 hover:text-indigo-600 transition-all"><Camera size={22} /></button>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" />
          </div>
          <button onClick={handleTranslate} disabled={!inputText.trim()} className={`h-14 px-8 rounded-full font-black text-white shadow-lg transition-all ${!inputText.trim() ? 'bg-slate-200' : 'bg-gradient-to-r from-indigo-600 to-violet-600 active:scale-95'}`}>
            {isTranslating ? <Loader2 size={24} className="animate-spin" /> : 'Translate'}
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-slate-400 font-bold text-xs uppercase tracking-[0.2em]">Pro Communication Tools</h3>
          <div className="flex items-center gap-1.5 bg-emerald-100 px-2 py-0.5 rounded-full">
            <Sparkles size={10} className="text-emerald-600" fill="currentColor" />
            <span className="text-[9px] font-black text-emerald-700 uppercase tracking-tighter">12 Min Trial Active</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {COMMUNICATION_TOOLS.map((tool) => (
            <button
              key={tool.id}
              onClick={() => {
                if (tool.context === 'video_file') navigate(AppRoute.VIDEO_FILE_TRANSLATE);
                else if (tool.context === 'universal') navigate(AppRoute.UNIVERSAL_TRANSLATE);
                else if (tool.context === 'streaming_video') navigate(AppRoute.STREAM_VIDEO);
                else { setCallContext(tool.context as CallContext); navigate(AppRoute.CALL_MODE); }
              }}
              className="bg-white p-6 rounded-[2.2rem] shadow-lg border border-slate-50 hover:border-indigo-100 transition-all active:scale-95 text-left relative overflow-hidden"
            >
              <div className={`w-14 h-14 ${tool.bgLight} rounded-2xl flex items-center justify-center ${tool.text} mb-4 shadow-inner`}>
                <tool.icon size={28} strokeWidth={2.5} />
              </div>
              <h4 className="font-bold text-slate-900 text-sm tracking-tight">{tool.label}</h4>
              <p className="text-[10px] text-slate-400 mt-1 font-bold tracking-wide leading-tight">{tool.desc}</p>
              
              {tool.hasTrial && (
                <div className="mt-3 inline-flex items-center gap-1 bg-indigo-600 text-white px-2 py-1 rounded-lg">
                  <span className="text-[9px] font-black uppercase tracking-tighter italic">12 Min Free</span>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
