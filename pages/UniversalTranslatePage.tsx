
import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, Language, TranslationMode } from '../types';
import { 
  ChevronLeft, Sparkles, MessageCircle, Monitor, Globe, Power, 
  X, Palette, ShieldCheck, BrainCircuit, Activity,
  Maximize2, Languages, Settings2, ShieldAlert, Cpu,
  Smartphone, Search, Layers, Zap as LucideZap, Timer, AlertCircle, Send
} from 'lucide-react';
import { translateText } from '../services/geminiService';

interface UniversalTranslatePageProps {
  user: UserProfile;
  navigate: (route: any) => void;
}

type CaptionStyle = 'cinema' | 'cyber' | 'minimal' | 'contrast';

export const UniversalTranslatePage: React.FC<UniversalTranslatePageProps> = ({ user, navigate }) => {
  const [sourceLang, setSourceLang] = useState<Language>(Language.AUTO_DETECT);
  const [targetLang, setTargetLang] = useState<Language>(Language.ENGLISH);
  const [isOverlayActive, setIsOverlayActive] = useState(false);
  const [currentApp, setCurrentApp] = useState<string | null>(null);
  const [translatedCaption, setTranslatedCaption] = useState("");
  const [interimCaption, setInterimCaption] = useState("");
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isFloatingBubbleVisible, setIsFloatingBubbleVisible] = useState(true);
  const [captionStyle, setCaptionStyle] = useState<CaptionStyle>('contrast');
  const [isAutocraticEnabled, setIsAutocraticEnabled] = useState(true);
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [detectedLangName, setDetectedLangName] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Trial State
  const [timeLeft, setTimeLeft] = useState(720); // 12 minutes in seconds
  const [trialExpired, setTrialExpired] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const recognitionRef = useRef<any>(null);

  const apps = [
    { name: 'WhatsApp', icon: MessageCircle, color: 'bg-[#25D366]', desc: 'Direct Audio Hook' },
    { name: 'WeChat', icon: () => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M7 10c0-3.314 2.686-6 6-6s6 2.686 6 6-2.686 6-6 6c-.53 0-1.034-.07-1.512-.198L8 18l.42-3.146C7.545 14.07 7 12.11 7 10z" />
        <path d="M3 13c0-2.209 1.791-4 4-4s4 1.791 4 4-1.791 4-4 4c-.354 0-.689-.046-1.008-.132L4 18l.28-2.097C3.526 15.253 3 14.193 3 13z" />
      </svg>
    ), color: 'bg-[#07C160]', desc: 'AI Vision Overlay' },
    // Fix: Added Send to the lucide-react import list.
    { name: 'Telegram', icon: Send, color: 'bg-[#229ED9]', desc: 'API Bridge' },
    { name: 'IMO', icon: Globe, color: 'bg-[#00adef]', desc: 'Smart Inject' },
    { name: 'Messenger', icon: MessageCircle, color: 'bg-[#0084FF]', desc: 'Meta Hook' },
    { name: 'Zoom', icon: Monitor, color: 'bg-[#2D8CFF]', desc: 'Meeting Sync' },
  ];

  const filteredApps = apps.filter(app => app.name.toLowerCase().includes(searchQuery.toLowerCase()));

  // Trial Timer Effect
  useEffect(() => {
    if (timeLeft <= 0) {
      setTrialExpired(true);
      setIsOverlayActive(false);
      stopRecognition();
      return;
    }

    if (isOverlayActive && !trialExpired) {
      const timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timeLeft, isOverlayActive, trialExpired]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (isOverlayActive && isCameraOn) {
      navigator.mediaDevices.getUserMedia({ video: true, audio: false })
        .then(s => { if (videoRef.current) videoRef.current.srcObject = s; })
        .catch(err => console.error("Camera hook failed:", err));
    }
  }, [isOverlayActive, isCameraOn]);

  const startRecognition = () => {
    if (trialExpired) return;
    if (!('webkitSpeechRecognition' in window)) {
      alert("Autocratic Voice Capture not supported in this browser.");
      return;
    }
    
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
        
        const sourceMode = isAutocraticEnabled ? Language.AUTO_DETECT : sourceLang;
        const translation = await translateText(transcript, sourceMode, targetLang, TranslationMode.AI_SMART);
        
        setTranslatedCaption(translation);
        setIsAiProcessing(false);
        
        if (isAutocraticEnabled) {
          setDetectedLangName("AI Transition Verified");
        }

        setTimeout(() => {
          setTranslatedCaption("");
          setDetectedLangName(null);
        }, 5000);
      } else {
        setInterimCaption(transcript);
      }
    };

    rec.onend = () => {
      if (isOverlayActive && !trialExpired) {
        try { rec.start(); } catch(e) {}
      }
    };

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

  const toggleOverlay = () => {
    if (trialExpired) return;
    if (isOverlayActive) {
      setIsOverlayActive(false);
      stopRecognition();
    } else {
      setIsOverlayActive(true);
      startRecognition();
    }
  };

  const selectedAppData = apps.find(a => a.name === currentApp);

  const getCaptionStyles = () => {
    switch(captionStyle) {
      case 'cyber':
        return "bg-black/95 border-cyan-400 text-cyan-400 font-mono shadow-[0_0_40px_rgba(6,182,212,0.8)]";
      case 'minimal':
        return "bg-black/50 backdrop-blur-md border-transparent text-white font-medium italic";
      case 'contrast':
        return "bg-[#ffff00] border-[5px] border-black text-black font-[900] shadow-[0_40px_100px_rgba(0,0,0,1)] scale-110";
      case 'cinema':
      default:
        return "bg-slate-950 border-white/20 text-[#facc15] font-black tracking-tighter uppercase px-12 py-10";
    }
  };

  if (isOverlayActive) {
    return (
      <div className="flex flex-col h-screen bg-black relative overflow-hidden">
        {/* Call Environment Simulator */}
        <div className="absolute inset-0 z-0 bg-slate-900">
          {isCameraOn ? (
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover grayscale-[20%] opacity-40 blur-[1px]" />
          ) : (
            <div className="w-full h-full flex items-center justify-center opacity-10">
               <Cpu size={140} className="text-white animate-pulse" />
            </div>
          )}
        </div>

        {/* Floating Side Action Hub */}
        <div className="absolute right-6 top-1/2 -translate-y-1/2 z-[60] flex flex-col gap-6">
          <button 
            onClick={() => setIsAutocraticEnabled(!isAutocraticEnabled)}
            className={`w-16 h-16 rounded-[1.75rem] shadow-[0_15px_40px_rgba(0,0,0,0.5)] flex items-center justify-center transition-all duration-300 transform active:scale-90 ${isAutocraticEnabled ? 'bg-emerald-500 ring-4 ring-emerald-500/40' : 'bg-slate-800'}`}
          >
            <LucideZap size={28} className="text-white" fill={isAutocraticEnabled ? "white" : "none"} />
          </button>
          
          <button 
            onClick={() => setIsFloatingBubbleVisible(!isFloatingBubbleVisible)}
            className={`w-16 h-16 rounded-[1.75rem] shadow-[0_15px_40px_rgba(0,0,0,0.5)] flex items-center justify-center transition-all duration-300 transform active:scale-90 ${isFloatingBubbleVisible ? 'bg-indigo-600' : 'bg-slate-800'}`}
          >
            <Sparkles size={28} className="text-white" fill={isFloatingBubbleVisible ? "white" : "none"} />
          </button>
        </div>

        {/* HUD System Monitor Header */}
        <div className="absolute top-0 left-0 right-0 z-40 p-8 flex justify-between items-start bg-gradient-to-b from-black/95 via-black/40 to-transparent">
            <div className="flex items-center gap-5">
               <div className={`w-16 h-16 rounded-[2.2rem] flex items-center justify-center ${selectedAppData?.color || 'bg-slate-700'} shadow-2xl ring-2 ring-white/10`}>
                  {React.createElement(selectedAppData?.icon || Globe, { size: 36, className: "text-white" })}
               </div>
               <div className="text-white">
                  <h2 className="font-black text-2xl tracking-tighter leading-none">{currentApp} Transition</h2>
                  <div className="flex items-center gap-2.5 mt-2.5">
                    <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-500/40 ${timeLeft < 60 ? 'animate-pulse ring-2 ring-rose-500/50' : ''}`}>
                       <Timer size={12} className={timeLeft < 60 ? 'text-rose-400' : 'text-indigo-400'} />
                       <span className={`text-[10px] font-black tracking-widest ${timeLeft < 60 ? 'text-rose-400' : 'text-indigo-400'}`}>
                         FREE TRIAL: {formatTime(timeLeft)}
                       </span>
                    </div>
                  </div>
               </div>
            </div>
            <button onClick={toggleOverlay} className="w-16 h-16 bg-rose-600 text-white rounded-full shadow-2xl flex items-center justify-center transform active:scale-95 transition-transform border-4 border-black/40">
               <X size={32} strokeWidth={4} />
            </button>
        </div>

        {/* THE PROJECTOR CAPTIONS AREA */}
        {isFloatingBubbleVisible && (
          <div className="absolute inset-x-0 bottom-48 z-50 px-10 flex flex-col items-center pointer-events-none animate-fade-in-up">
            <div className="max-w-xl w-full text-center">
                {isAiProcessing && (
                  <div className="mb-8 px-6 py-2.5 bg-black/90 text-white text-[11px] font-black uppercase tracking-widest inline-flex items-center gap-3 rounded-full border border-white/20 shadow-2xl">
                     <Activity size={16} className="text-indigo-400 animate-spin" />
                     <span>AI Transition Process...</span>
                  </div>
                )}
                
                {detectedLangName && !isAiProcessing && (
                  <div className="mb-8 px-6 py-2.5 bg-emerald-500 text-black text-[11px] font-black uppercase tracking-widest inline-flex items-center gap-3 rounded-full shadow-2xl">
                     <ShieldCheck size={16} />
                     {detectedLangName}
                  </div>
                )}

                {interimCaption && (
                  <div className="mb-12">
                    <p className="text-white text-3xl font-black drop-shadow-[0_10px_20px_rgba(0,0,0,1)] tracking-tight opacity-50 italic">
                      "{interimCaption}..."
                    </p>
                  </div>
                )}

                {translatedCaption && (
                  <div className={`p-12 rounded-[3.5rem] transition-all duration-300 transform-gpu ${getCaptionStyles()}`}>
                    <p className="text-6xl font-black tracking-tighter leading-[0.9] drop-shadow-[0_4px_2px_rgba(255,255,255,0.05)]">
                      {translatedCaption}
                    </p>
                  </div>
                )}
            </div>
          </div>
        )}

        {/* HUD Navigation Panel */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-50 w-full px-8 max-sm">
           <div className="bg-black/95 backdrop-blur-3xl p-7 rounded-[4rem] border border-white/10 shadow-[0_40px_80px_rgba(0,0,0,1)] flex items-center justify-between">
              <div className="flex items-center gap-5">
                 <button 
                  onClick={() => setCaptionStyle(s => s === 'cinema' ? 'cyber' : s === 'cyber' ? 'minimal' : s === 'minimal' ? 'contrast' : 'cinema')}
                  className="bg-indigo-600 w-14 h-14 rounded-[1.75rem] text-white flex items-center justify-center active:scale-90 transition-transform shadow-xl shadow-indigo-600/40"
                 >
                    <Palette size={26} />
                 </button>
                 <span className="text-white/40 font-black text-[10px] uppercase tracking-[0.2em]">{captionStyle}</span>
              </div>
              
              <div className="h-12 w-px bg-white/10 mx-2"></div>

              <select 
                value={targetLang} 
                onChange={e => setTargetLang(e.target.value as Language)} 
                className="bg-transparent text-indigo-400 font-black outline-none text-lg text-right appearance-none cursor-pointer hover:text-indigo-300 transition-colors"
              >
                {Object.values(Language).filter(l => l !== Language.AUTO_DETECT).map(l => <option key={l} value={l} className="text-black">{l}</option>)}
              </select>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9ff] pb-32">
      {/* Mobile System Header */}
      <div className="p-6 bg-white/90 backdrop-blur-xl border-b border-slate-100 flex items-center gap-4 sticky top-0 z-50 shadow-sm">
        <button onClick={() => navigate('HOME')} className="p-2.5 -ml-2 text-slate-400 hover:bg-slate-50 rounded-full transition-colors">
          <ChevronLeft size={24} />
        </button>
        <div className="flex-1">
          <h2 className="text-lg font-black text-slate-900 tracking-tight leading-none uppercase italic">AI Transition Hook</h2>
          <div className="flex items-center gap-2 mt-2">
             <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
             <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Injection Engine Ready</p>
          </div>
        </div>
        <div className="bg-indigo-50 p-3 rounded-2xl">
          <Smartphone size={20} className="text-indigo-600" />
        </div>
      </div>

      <div className="p-8 space-y-12 animate-fade-in-up">
        {/* Setup Environment Hero */}
        <div className="bg-slate-950 rounded-[4rem] p-12 text-white relative overflow-hidden shadow-2xl shadow-indigo-900/20">
           <div className="relative z-10 space-y-8">
              <div className="w-fit bg-emerald-500/10 border border-emerald-500/20 px-6 py-2 rounded-full flex items-center gap-3">
                 <Cpu size={18} className="text-emerald-400" />
                 <span className="text-[12px] font-black uppercase tracking-[0.3em] text-emerald-400">Engine: AI Transition</span>
              </div>
              <h3 className="text-5xl font-black leading-[0.95] tracking-tighter">Hook App <br/><span className="text-indigo-500 italic">Transition</span>.</h3>
              <p className="text-slate-400 text-lg leading-relaxed font-bold max-w-xs">
                Select your preferred mobile application to start the 12-minute Pro trial of AI Transition.
              </p>
           </div>
           {/* Visual Polish */}
           <div className="absolute -top-16 -right-16 w-64 h-64 bg-indigo-600/30 rounded-full blur-[100px]"></div>
           <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-emerald-500/10 rounded-full blur-[80px]"></div>
        </div>

        {/* SEARCH & FILTER */}
        <div className="relative">
           <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
           <input 
            type="text" 
            placeholder="Search Target App..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-white h-16 pl-14 pr-6 rounded-3xl border border-slate-100 shadow-sm outline-none focus:ring-4 ring-indigo-500/5 transition-all font-bold text-slate-700 placeholder-slate-300"
           />
        </div>

        {/* MOBILE APP GRID */}
        <div className="space-y-8">
          <div className="flex items-center justify-between px-4">
            <h4 className="text-slate-400 font-black text-[11px] uppercase tracking-[0.4em]">Step 1: Application Hook</h4>
            <span className="text-[10px] font-black text-indigo-500 uppercase bg-indigo-50 px-3 py-1.5 rounded-full border border-indigo-100">
               {filteredApps.length} Apps Ready
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-6">
            {filteredApps.map((app) => (
              <button 
                key={app.name}
                onClick={() => setCurrentApp(app.name)}
                className={`group p-10 rounded-[3.5rem] border-4 transition-all duration-300 flex flex-col items-center gap-6 active:scale-95 ${
                  currentApp === app.name 
                  ? 'border-indigo-600 bg-white shadow-2xl scale-[1.03]' 
                  : 'border-white bg-white shadow-sm hover:border-slate-100'
                }`}
              >
                <div className={`w-20 h-20 ${app.color} rounded-[2.5rem] flex items-center justify-center text-white shadow-xl transition-transform group-hover:rotate-12`}>
                   {React.createElement(app.icon as any, { size: 40 })}
                </div>
                <div className="text-center">
                  <span className={`font-black text-xl block tracking-tight ${currentApp === app.name ? 'text-indigo-950' : 'text-slate-700'}`}>{app.name}</span>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">{app.desc}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* INJECTION ENGINE CONFIG */}
        <div className="bg-white p-10 rounded-[4.5rem] shadow-2xl border border-slate-50 space-y-10 relative overflow-hidden">
           {trialExpired && (
             <div className="absolute inset-0 z-50 bg-slate-900/95 backdrop-blur-xl flex items-center justify-center p-12 text-center animate-fade-in-up">
                <div className="space-y-8 max-w-sm">
                   <div className="w-24 h-24 bg-rose-500/20 rounded-full flex items-center justify-center mx-auto border border-rose-500/30">
                      <AlertCircle size={48} className="text-rose-500" />
                   </div>
                   <div className="space-y-3">
                      <h3 className="text-3xl font-black text-white tracking-tighter">Trial Finished</h3>
                      <p className="text-slate-400 font-bold leading-relaxed">
                        Your 12-minute pro transition trial is complete. Unlock unlimited hooks and autocratic detection.
                      </p>
                   </div>
                   <button 
                     onClick={() => navigate('PROFILE')}
                     className="w-full py-5 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-[2rem] text-white font-black text-xl shadow-2xl shadow-indigo-600/40 active:scale-95 transition-all"
                   >
                     Get Unlimited Pro
                   </button>
                   <button onClick={() => navigate('HOME')} className="text-slate-500 font-black text-sm uppercase tracking-widest hover:text-white">Maybe Later</button>
                </div>
             </div>
           )}

           <div className="flex items-center justify-between px-4">
              <div className="flex items-center gap-4">
                 <Settings2 size={24} className="text-slate-400" />
                 <span className="text-slate-500 text-[13px] font-black uppercase tracking-[0.25em]">Step 2: AI Config</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full">
                 <Timer size={14} />
                 <span className="text-[11px] font-black uppercase tracking-tighter">{formatTime(timeLeft)} Free Trial</span>
              </div>
           </div>

           <div className="space-y-8">
              {/* AUTOCRATIC ENGINE TOGGLE */}
              <button 
                onClick={() => setIsAutocraticEnabled(!isAutocraticEnabled)}
                className={`w-full flex items-center justify-between p-8 rounded-[3.5rem] border-[4px] transition-all text-left ${isAutocraticEnabled ? 'bg-slate-950 border-indigo-600 text-white shadow-2xl' : 'bg-slate-50 border-transparent text-slate-900'}`}
              >
                <div className="flex items-center gap-6">
                   <div className={`w-16 h-16 rounded-[2.2rem] flex items-center justify-center ${isAutocraticEnabled ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-400'}`}>
                      <LucideZap size={32} fill={isAutocraticEnabled ? "white" : "none"} />
                   </div>
                   <div className="flex flex-col">
                      <span className="font-black text-2xl leading-none tracking-tight">AI Transition</span>
                      <span className={`text-[12px] font-black uppercase tracking-widest mt-2 ${isAutocraticEnabled ? 'text-indigo-400' : 'text-slate-400'}`}>
                        {isAutocraticEnabled ? 'AUTOCRATIC ON' : 'MANUAL INJECT'}
                      </span>
                   </div>
                </div>
                <div className={`w-18 h-9 rounded-full relative transition-colors duration-300 ${isAutocraticEnabled ? 'bg-indigo-600' : 'bg-slate-300'}`}>
                   <div className={`absolute top-1 w-7 h-7 bg-white rounded-full transition-transform duration-300 shadow-xl ${isAutocraticEnabled ? 'translate-x-10' : 'translate-x-1'}`}></div>
                </div>
              </button>

              {/* TARGET SELECT */}
              <div className="bg-slate-50 p-8 rounded-[3.5rem] border border-slate-100 flex items-center justify-between">
                <div className="flex flex-col">
                   <span className="text-slate-400 font-black text-[12px] uppercase tracking-widest mb-2">Target Goal</span>
                   <select 
                    value={targetLang} 
                    onChange={e => setTargetLang(e.target.value as Language)} 
                    className="bg-transparent text-indigo-600 font-black outline-none text-3xl cursor-pointer appearance-none tracking-tighter"
                  >
                    {Object.values(Language).filter(l => l !== Language.AUTO_DETECT).map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <Languages size={36} className="text-slate-300" />
                  <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Target</span>
                </div>
              </div>

              {/* STYLE HUD PREVIEW */}
              <div className="bg-slate-50 p-8 rounded-[3.5rem] border border-slate-100 space-y-8">
                 <div className="flex justify-between items-center px-4">
                    <span className="text-slate-700 font-black text-sm tracking-widest uppercase">Visual Contrast</span>
                    <Palette size={24} className="text-slate-400" />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                   {(['contrast', 'cinema'] as CaptionStyle[]).map(style => (
                    <button
                      key={style}
                      onClick={() => setCaptionStyle(style)}
                      className={`py-6 rounded-[2.2rem] text-[12px] font-black uppercase transition-all border-[3px] tracking-[0.2em] ${
                        captionStyle === style 
                        ? 'bg-slate-900 text-white border-slate-900 shadow-2xl scale-105' 
                        : 'bg-white text-slate-400 border-slate-100'
                      }`}
                    >
                      {style}
                    </button>
                   ))}
                 </div>
              </div>
           </div>
           
           <button 
             onClick={toggleOverlay}
             disabled={!currentApp || trialExpired}
             className={`w-full py-12 rounded-[4rem] font-black text-4xl shadow-2xl transition-all flex items-center justify-center gap-6 active:scale-95 ${
               (!currentApp || trialExpired)
               ? 'bg-slate-100 text-slate-300 cursor-not-allowed shadow-none' 
               : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-600/30'
             }`}
           >
              <Power size={48} strokeWidth={5} />
              Inject Transition
           </button>
        </div>

        {/* SYSTEM STATUS FOOTER */}
        <div className="p-12 bg-white rounded-[5rem] border-2 border-slate-100 flex flex-col items-center text-center gap-8 shadow-sm">
           <div className="w-24 h-24 bg-indigo-50 rounded-[2.5rem] flex items-center justify-center text-indigo-600 shadow-inner">
              <Layers size={48} strokeWidth={3} />
           </div>
           <div className="space-y-4">
              <h5 className="font-black text-slate-900 text-2xl tracking-tighter leading-tight">AI Integrity: Clear</h5>
              <p className="text-base text-slate-400 leading-relaxed font-bold max-w-sm">
                The AI Transition Hook is ready for low-latency injection across all verified communication platforms.
              </p>
           </div>
        </div>
      </div>
    </div>
  );
};
