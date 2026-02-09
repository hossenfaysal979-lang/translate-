import React, { useState, useRef } from 'react';
import { Language, TranslationMode, HistoryItem, UserProfile, CallContext, AppRoute } from '../types';
import { translateText, translateImage } from '../services/geminiService';
import { ArrowRightLeft, Mic, Camera, Send, X, Loader2, ChevronDown, Sparkles } from 'lucide-react';
import { TranslationCard } from '../components/TranslationCard';
import { QUICK_ACTIONS, COMMUNICATION_TOOLS, MODE_PRICING, SUPPORTED_LANGUAGES } from '../constants';

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
  const [isListening, setIsListening] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Recent 3 history items
  const recentHistory = history.slice(0, 3);

  const swapLanguages = () => {
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
  };

  const handleTranslate = async () => {
    if (!inputText.trim() || user.points <= 0) return;

    const cost = MODE_PRICING[selectedMode];
    if (user.points < cost) {
      alert("Insufficient points! Please recharge.");
      return;
    }

    setIsTranslating(true);
    const result = await translateText(inputText, sourceLang, targetLang, selectedMode);
    
    // Decrease points
    updateUserPoints(user.points - cost);

    // Add to history
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

  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert("Speech recognition not supported in this browser.");
      return;
    }
    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    let langCode = 'en-US';
    if (sourceLang === Language.CHINESE_SIMPLIFIED) langCode = 'zh-CN';
    if (sourceLang === Language.SPANISH) langCode = 'es-ES';
    if (sourceLang === Language.JAPANESE) langCode = 'ja-JP';
    if (sourceLang === Language.KOREAN) langCode = 'ko-KR';
    if (sourceLang === Language.FRENCH) langCode = 'fr-FR';
    if (sourceLang === Language.GERMAN) langCode = 'de-DE';
    if (sourceLang === Language.BENGALI) langCode = 'bn-IN';
    if (sourceLang === Language.HINDI) langCode = 'hi-IN';
    if (sourceLang === Language.URDU) langCode = 'ur-PK';
    if (sourceLang === Language.ARABIC) langCode = 'ar-SA';
    
    recognition.lang = langCode;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    setIsListening(true);

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInputText(transcript);
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const cost = MODE_PRICING[TranslationMode.PREMIUM];
    if (user.points < cost) {
      alert("Insufficient points for image translation.");
      return;
    }

    setIsTranslating(true);
    
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      const result = await translateImage(base64String, sourceLang, targetLang);
      
      updateUserPoints(user.points - cost);
      
      addToHistory({
        id: Date.now().toString(),
        sourceText: "[Image Translation]",
        targetText: result,
        sourceLang,
        targetLang,
        mode: TranslationMode.PREMIUM,
        timestamp: Date.now()
      });
      
      setIsTranslating(false);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="pb-32 pt-2 px-5 space-y-6">
      
      {/* Header Language Selector */}
      <div className="sticky top-4 z-40 bg-white/80 backdrop-blur-xl rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60 p-1.5 flex items-center justify-between">
         <div className="relative flex-1 group">
            <select 
              value={sourceLang} 
              onChange={(e) => setSourceLang(e.target.value as Language)}
              className="w-full appearance-none bg-transparent py-2.5 pl-4 pr-8 text-sm font-bold text-slate-700 outline-none cursor-pointer"
            >
              {SUPPORTED_LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
         </div>

         <button onClick={swapLanguages} className="p-2.5 rounded-full bg-slate-100 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 transition-colors shadow-sm mx-1">
            <ArrowRightLeft size={16} strokeWidth={2.5} />
         </button>

         <div className="relative flex-1 group">
            <select 
              value={targetLang} 
              onChange={(e) => setTargetLang(e.target.value as Language)}
              className="w-full appearance-none bg-transparent py-2.5 pl-8 pr-4 text-sm font-bold text-indigo-600 outline-none text-right cursor-pointer dir-rtl"
              style={{ direction: 'rtl' }}
            >
              {SUPPORTED_LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
            <ChevronDown size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-300 pointer-events-none" />
         </div>
      </div>

      {/* Main Input Card */}
      <div className="bg-white rounded-[2rem] p-5 shadow-[0_20px_40px_-12px_rgba(0,0,0,0.08)] border border-indigo-50 relative group transition-all duration-500 hover:shadow-[0_25px_50px_-12px_rgba(99,102,241,0.15)]">
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={`Enter text to translate...`}
          className="w-full h-32 resize-none outline-none text-xl font-medium text-slate-800 placeholder-slate-300 bg-transparent leading-relaxed"
        />
        
        {inputText && (
          <button 
            onClick={() => setInputText('')} 
            className="absolute top-5 right-5 p-1 bg-slate-100 rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors"
          >
            <X size={16} />
          </button>
        )}

        <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-50">
          <div className="flex gap-2">
            <button 
              onClick={handleVoiceInput}
              className={`p-3 rounded-xl transition-all duration-300 ${isListening ? 'bg-rose-100 text-rose-500 ring-2 ring-rose-200 animate-pulse' : 'bg-slate-50 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600'}`}
            >
              <Mic size={22} />
            </button>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="p-3 bg-slate-50 rounded-xl text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 transition-all duration-300"
            >
              <Camera size={22} />
            </button>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
          </div>

          <button 
            onClick={handleTranslate}
            disabled={!inputText.trim() || isTranslating}
            className={`flex items-center gap-2 pl-6 pr-6 py-3 rounded-full font-bold text-white transition-all duration-300 shadow-lg ${
              !inputText.trim() 
                ? 'bg-slate-200 shadow-none cursor-not-allowed text-slate-400' 
                : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:shadow-indigo-500/30 hover:-translate-y-0.5 active:translate-y-0'
            }`}
          >
            {isTranslating ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
            <span>Translate</span>
          </button>
        </div>
      </div>

      {/* Translation Modes */}
      <div>
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 px-1">
          {Object.values(TranslationMode).map((mode) => (
            <button
              key={mode}
              onClick={() => setSelectedMode(mode)}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold border transition-all duration-300 ${
                selectedMode === mode
                  ? 'bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-900/20'
                  : 'bg-white text-slate-500 border-slate-200 hover:border-indigo-200 hover:text-indigo-600'
              }`}
            >
              {mode}
              {mode === TranslationMode.PREMIUM && <span className="ml-1 text-yellow-300">★</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        {QUICK_ACTIONS.map((action) => (
          <button
            key={action.id}
            onClick={() => {
              if (action.mode) setSelectedMode(action.mode);
            }}
            className={`${action.color} ${action.shadow} p-5 rounded-[1.5rem] text-white relative overflow-hidden group active:scale-[0.98] transition-all duration-300`}
          >
            <div className="absolute right-[-20px] bottom-[-20px] opacity-20 transform rotate-12 group-hover:scale-125 group-hover:rotate-6 transition-transform duration-500">
              <action.icon size={80} />
            </div>
            <div className="relative z-10 flex flex-col items-start gap-3">
              <div className="bg-white/20 p-2.5 rounded-2xl backdrop-blur-md shadow-inner border border-white/20">
                <action.icon size={22} strokeWidth={2.5} />
              </div>
              <span className="font-bold text-base tracking-tight">{action.label}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Communication Grid */}
      <div className="space-y-4">
        <h3 className="text-slate-400 font-bold text-xs uppercase tracking-wider pl-2">Communication Tools</h3>
        <div className="grid grid-cols-2 gap-4">
          {COMMUNICATION_TOOLS.map((tool) => (
            <button
              key={tool.id}
              onClick={() => {
                setCallContext(tool.context as CallContext);
                navigate(AppRoute.CALL_MODE);
              }}
              className="bg-white p-5 rounded-[1.5rem] shadow-[0_10px_30px_-10px_rgba(0,0,0,0.05)] border border-slate-100 hover:border-indigo-100 hover:shadow-[0_20px_40px_-10px_rgba(99,102,241,0.1)] transition-all duration-300 active:scale-[0.98] text-left group"
            >
              <div className={`w-12 h-12 ${tool.bgLight} rounded-2xl flex items-center justify-center ${tool.text} mb-3 shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                <tool.icon size={22} strokeWidth={2.5} />
              </div>
              <h4 className="font-bold text-slate-800 text-sm">{tool.label}</h4>
              <p className="text-[11px] text-slate-400 mt-1 font-medium">{tool.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Recent History */}
      {recentHistory.length > 0 && (
        <div className="pt-2">
          <h3 className="text-slate-400 font-bold text-xs uppercase tracking-wider pl-2 mb-3">Recent</h3>
          <div className="flex flex-col-reverse gap-4">
            {recentHistory.map((item) => (
              <TranslationCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
