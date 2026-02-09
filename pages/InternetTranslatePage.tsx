
import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, Language, TranslationMode } from '../types';
import { 
  ChevronLeft, Sparkles, Globe, Power, 
  X, Palette, ShieldCheck, Activity,
  Settings2, Cpu, Search, Layers, Zap, Timer, AlertCircle,
  ArrowRight, ArrowLeft, RotateCcw, Share2, ExternalLink
} from 'lucide-react';
import { translateText } from '../services/geminiService';

interface InternetTranslatePageProps {
  user: UserProfile;
  navigate: (route: any) => void;
}

export const InternetTranslatePage: React.FC<InternetTranslatePageProps> = ({ user, navigate }) => {
  const [url, setUrl] = useState("https://www.bbc.com/news");
  const [activeUrl, setActiveUrl] = useState("https://www.bbc.com/news");
  const [targetLang, setTargetLang] = useState<Language>(Language.ENGLISH);
  const [isHookActive, setIsHookActive] = useState(false);
  const [translatedCaption, setTranslatedCaption] = useState("");
  const [interimCaption, setInterimCaption] = useState("");
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [isSearchSyncEnabled, setIsSearchSyncEnabled] = useState(true);
  
  const [timeLeft, setTimeLeft] = useState(720); // 12 minutes
  const [trialExpired, setTrialExpired] = useState(false);

  const recognitionRef = useRef<any>(null);

  // Timer Effect
  useEffect(() => {
    if (timeLeft <= 0) {
      setTrialExpired(true);
      setIsHookActive(false);
      stopRecognition();
      return;
    }

    if (isHookActive && !trialExpired) {
      const timer = setInterval(() => setTimeLeft(p => p - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [timeLeft, isHookActive, trialExpired]);

  const formatTime = (s: number) => `${Math.floor(s/60)}:${(s%60).toString().padStart(2, '0')}`;

  const startRecognition = () => {
    if (trialExpired || !('webkitSpeechRecognition' in window)) return;
    
    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const rec = new SpeechRecognition();
    rec.continuous = true;
    rec.interimResults = true;

    rec.onresult = async (event: any) => {
      const result = event.results[event.results.length - 1];
      const transcript = result[0].transcript;
      
      if (result.isFinal) {
        setInterimCaption("");
        setIsAiProcessing(true);
        const translation = await translateText(
          transcript, 
          Language.AUTO_DETECT, 
          targetLang, 
          TranslationMode.AI_SMART,
          isSearchSyncEnabled
        );
        setTranslatedCaption(translation);
        setIsAiProcessing(false);
        setTimeout(() => setTranslatedCaption(""), 5000);
      } else {
        setInterimCaption(transcript);
      }
    };

    rec.onend = () => { if (isHookActive && !trialExpired) try { rec.start(); } catch(e) {} };
    rec.lang = 'en-US'; 
    recognitionRef.current = rec;
    rec.start();
  };

  const stopRecognition = () => {
    recognitionRef.current?.stop();
    setInterimCaption("");
    setTranslatedCaption("");
    setIsAiProcessing(false);
  };

  const toggleHook = () => {
    if (trialExpired) return;
    if (isHookActive) {
      setIsHookActive(false);
      stopRecognition();
    } else {
      setIsHookActive(true);
      startRecognition();
    }
  };

  const handleGo = () => {
    let finalUrl = url;
    if (!url.startsWith('http')) finalUrl = 'https://' + url;
    setActiveUrl(finalUrl);
  };

  return (
    <div className="flex flex-col h-screen bg-[#020617] text-white overflow-hidden relative font-sans">
      {/* HUD System Monitor Header */}
      <div className="p-6 bg-slate-900/90 border-b border-white/5 flex items-center gap-4 z-50">
        <button onClick={() => navigate('HOME')} className="p-3 bg-white/5 rounded-2xl hover:bg-rose-500 transition-all">
          <ChevronLeft size={24} />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-rose-500">Autocratic Internet Hook</h2>
            <div className={`px-2 py-0.5 rounded-full text-[9px] font-black ${timeLeft < 60 ? 'bg-rose-500 animate-pulse' : 'bg-rose-500/10 text-rose-400'} border border-rose-500/20`}>
              {formatTime(timeLeft)} TRIAL
            </div>
          </div>
          <div className="flex items-center gap-4 mt-2">
            <div className="flex-1 bg-black/40 rounded-xl px-4 py-2 border border-white/10 flex items-center gap-3">
              <Globe size={16} className="text-slate-500" />
              <input 
                type="text" 
                value={url} 
                onChange={e => setUrl(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleGo()}
                className="bg-transparent border-none outline-none text-xs w-full text-slate-300 font-medium"
                placeholder="Hook Target URL..."
              />
            </div>
            <button onClick={handleGo} className="p-2.5 bg-rose-600 rounded-xl shadow-lg shadow-rose-600/20 active:scale-95 transition-all">
              <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Main View Area: The "Internet" */}
      <div className="flex-1 relative bg-slate-800">
        {/* Browser Simulator */}
        <div className="absolute inset-0 bg-white overflow-hidden flex flex-col">
            <div className="bg-slate-100 p-2 border-b border-slate-200 flex items-center gap-4 text-slate-400">
               <div className="flex gap-2">
                  <ArrowLeft size={16} />
                  <RotateCcw size={16} />
               </div>
               <div className="flex-1 bg-white border border-slate-200 rounded-lg py-1 px-3 text-[10px] truncate">
                  {activeUrl}
               </div>
               <Share2 size={16} />
            </div>
            <iframe 
              src={activeUrl} 
              className="w-full h-full border-none"
              title="Internet Preview"
            />
        </div>

        {/* AI CAPTION LAYER OVER THE INTERNET */}
        {isHookActive && (
          <div className="absolute inset-0 z-40 pointer-events-none bg-black/20 flex flex-col items-center justify-end pb-48 px-10">
            <div className="max-w-xl w-full text-center space-y-8">
                {isAiProcessing && (
                  <div className="bg-black/90 px-6 py-2.5 rounded-full border border-rose-500/30 flex items-center gap-3 mx-auto w-fit shadow-2xl">
                     <Activity size={16} className="text-rose-400 animate-spin" />
                     <span className="text-[10px] font-black uppercase tracking-widest text-rose-400">Internet Context Sync...</span>
                  </div>
                )}

                {interimCaption && (
                  <p className="text-white/60 text-2xl font-black italic tracking-tight drop-shadow-2xl">
                    "{interimCaption}"
                  </p>
                )}

                {translatedCaption && (
                  <div className="bg-rose-600 p-10 rounded-[3rem] border-4 border-black shadow-[0_40px_100px_rgba(0,0,0,1)] animate-fade-in-up">
                    <p className="text-5xl font-black tracking-tighter leading-none text-white drop-shadow-lg">
                      {translatedCaption}
                    </p>
                  </div>
                )}
            </div>
          </div>
        )}

        {/* Trial Expired Shield */}
        {trialExpired && (
          <div className="absolute inset-0 z-[100] bg-slate-950/95 backdrop-blur-3xl flex items-center justify-center p-10 text-center animate-fade-in-up">
             <div className="max-w-sm space-y-10">
                <div className="w-24 h-24 bg-rose-600/20 rounded-[2.5rem] flex items-center justify-center mx-auto border-2 border-rose-600/40">
                   <Zap size={48} className="text-rose-500" fill="currentColor" />
                </div>
                <div className="space-y-4">
                   <h3 className="text-4xl font-black tracking-tighter uppercase italic">Trial Expired</h3>
                   <p className="text-slate-400 font-bold leading-relaxed text-sm">
                     The Autocratic Internet Hook requires Pro access for persistent browser injection.
                   </p>
                </div>
                <button 
                  onClick={() => navigate('PROFILE')}
                  className="w-full py-5 bg-rose-600 rounded-3xl text-white font-black text-xl shadow-2xl shadow-rose-600/40 active:scale-95 transition-all"
                >
                  Unlock Pro Internet
                </button>
                <button onClick={() => navigate('HOME')} className="text-slate-500 font-black text-xs uppercase tracking-widest hover:text-white transition-colors">Return to Base</button>
             </div>
          </div>
        )}
      </div>

      {/* HUD Control Dock */}
      <div className="p-8 pb-12 bg-slate-900 border-t border-white/5 z-50">
          <div className="grid grid-cols-2 gap-6 mb-8">
             <div className="bg-white/5 p-4 rounded-3xl border border-white/5 flex items-center justify-between">
                <div className="flex flex-col">
                   <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest mb-1">Target Language</span>
                   <select 
                    value={targetLang} 
                    onChange={e => setTargetLang(e.target.value as Language)}
                    className="bg-transparent text-rose-400 font-black outline-none text-lg appearance-none cursor-pointer"
                   >
                     {Object.values(Language).filter(l => l !== Language.AUTO_DETECT).map(l => <option key={l} value={l} className="text-black">{l}</option>)}
                   </select>
                </div>
                <Globe size={20} className="text-slate-600" />
             </div>

             <button 
               onClick={() => setIsSearchSyncEnabled(!isSearchSyncEnabled)}
               className={`p-4 rounded-3xl border transition-all flex items-center justify-between ${isSearchSyncEnabled ? 'bg-rose-600/10 border-rose-600/50 text-rose-500 shadow-lg' : 'bg-white/5 border-white/5 text-slate-500'}`}
             >
                <div className="flex flex-col text-left">
                   <span className="text-[9px] font-black uppercase tracking-widest mb-1">Search Sync</span>
                   <span className="text-xs font-black">{isSearchSyncEnabled ? 'ACTIVE' : 'OFF'}</span>
                </div>
                <Search size={20} />
             </button>
          </div>

          <button 
            onClick={toggleHook}
            disabled={trialExpired}
            className={`w-full py-6 rounded-[2.5rem] font-black text-2xl flex items-center justify-center gap-4 transition-all duration-500 shadow-2xl active:scale-95 ${
              isHookActive 
                ? 'bg-rose-500 text-white shadow-rose-500/40 ring-4 ring-rose-500/20' 
                : 'bg-white text-slate-950 shadow-white/20'
            }`}
          >
             {isHookActive ? <Power size={28} strokeWidth={3} /> : <Zap size={28} fill="currentColor" />}
             {isHookActive ? 'Terminate Hook' : 'Inject AI Hook'}
          </button>
      </div>
    </div>
  );
};
