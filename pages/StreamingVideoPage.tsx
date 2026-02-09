
import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, Language, TranslationMode } from '../types';
import { Play, Pause, Search, Share2, ThumbsUp, ChevronLeft, Sparkles, Captions, Radio, Timer, AlertCircle } from 'lucide-react';
import { translateText } from '../services/geminiService';

interface StreamingVideoPageProps {
  user: UserProfile;
  navigate: (route: any) => void;
}

export const StreamingVideoPage: React.FC<StreamingVideoPageProps> = ({ user, navigate }) => {
  const [sourceLang, setSourceLang] = useState<Language>(Language.ENGLISH);
  const [targetLang, setTargetLang] = useState<Language>(Language.CHINESE_SIMPLIFIED);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAiActive, setIsAiActive] = useState(false);
  const [caption, setCaption] = useState("");
  const [videoUrl, setVideoUrl] = useState("https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4");
  const [timeLeft, setTimeLeft] = useState(720); // 12 Minutes synchronized
  const [trialExpired, setTrialExpired] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (timeLeft <= 0) {
      setTrialExpired(true);
      setIsAiActive(false);
      recognitionRef.current?.stop();
      return;
    }
    if (isAiActive && isPlaying) {
      const timer = setInterval(() => setTimeLeft(p => p - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [timeLeft, isAiActive, isPlaying]);

  const formatTime = (s: number) => `${Math.floor(s/60)}:${(s%60).toString().padStart(2,'0')}`;

  const toggleAi = () => {
    if (trialExpired) return;
    if (isAiActive) {
      setIsAiActive(false);
      recognitionRef.current?.stop();
    } else {
      setIsAiActive(true);
      startRecognition();
    }
  };

  const startRecognition = () => {
    if (!('webkitSpeechRecognition' in window)) return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const rec = new SpeechRecognition();
    rec.continuous = true;
    rec.interimResults = true;
    rec.onresult = async (event: any) => {
      const result = event.results[event.results.length - 1];
      if (result.isFinal) {
        const translated = await translateText(result[0].transcript, sourceLang, targetLang, TranslationMode.AI_SMART);
        setCaption(translated);
      }
    };
    rec.onend = () => { if (isAiActive && !trialExpired) try { rec.start(); } catch(e) {} };
    rec.lang = sourceLang === Language.ENGLISH ? 'en-US' : 'zh-CN';
    recognitionRef.current = rec;
    rec.start();
  };

  return (
    <div className="flex flex-col h-screen bg-white overflow-hidden">
      <div className="p-4 flex items-center gap-3 border-b border-slate-100">
        <button onClick={() => navigate('HOME')} className="p-2 -ml-2 text-slate-600 rounded-full"><ChevronLeft size={24} /></button>
        <div className="flex-1 bg-slate-100 rounded-full px-4 py-2 flex items-center gap-2">
          <Search size={18} className="text-slate-400" />
          <input type="text" placeholder="Video URL..." className="bg-transparent border-none outline-none text-sm w-full" value={videoUrl} onChange={e => setVideoUrl(e.target.value)} />
        </div>
      </div>

      <div className="w-full aspect-video bg-black relative">
        <video ref={videoRef} src={videoUrl} className="w-full h-full object-contain" playsInline onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)} />
        <div className="absolute bottom-10 left-0 right-0 pointer-events-none flex justify-center px-6">
           {caption && isAiActive && (
             <div className="bg-black/70 backdrop-blur-xl px-5 py-3 rounded-2xl border border-white/20 shadow-2xl animate-fade-in-up">
               <p className="text-yellow-400 text-lg font-bold text-center caption-glow">{caption}</p>
             </div>
           )}
        </div>
        {!isPlaying && <div className="absolute inset-0 flex items-center justify-center bg-black/30"><div className="w-16 h-16 bg-white/20 backdrop-blur-2xl rounded-full flex items-center justify-center border border-white/20"><Play size={32} fill="white" className="text-white ml-1" /></div></div>}
        
        {trialExpired && (
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-8 text-center">
            <div className="space-y-6 animate-fade-in-up">
              <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto border border-red-500/30"><AlertCircle size={40} className="text-red-500" /></div>
              <h3 className="text-2xl font-black text-white">Trial Expired</h3>
              <p className="text-slate-400 text-sm">Your 12-minute Stream Translate trial is over. Upgrade to Pro for unlimited web video captions.</p>
              <button onClick={() => navigate('PROFILE')} className="w-full py-4 bg-red-600 text-white rounded-2xl font-bold shadow-xl shadow-red-500/20">Upgrade Now</button>
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="flex justify-between items-start">
          <h1 className="text-lg font-bold text-slate-900 leading-tight">Pro Stream: {videoUrl.split('/').pop()}</h1>
          <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase flex items-center gap-1.5 ${timeLeft < 60 ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-slate-100 text-slate-500'}`}>
            <Timer size={12} /> {formatTime(timeLeft)}
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-slate-200"></div><p className="text-sm font-bold">AI Studio Content</p></div>
          <button className="bg-slate-900 text-white px-5 py-2 rounded-full text-xs font-bold">Subscribe</button>
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar"><button className="flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap"><ThumbsUp size={14} /> Like</button><button className="flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap"><Share2 size={14} /> Share</button></div>
      </div>

      <div className="bg-white border-t p-6 shadow-2xl">
         <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-red-600 font-bold uppercase text-[10px] tracking-widest"><Sparkles size={16} /> Live AI Engine</div>
            <div className="flex items-center gap-3 text-[10px] font-bold">
               <span className="text-slate-400">{sourceLang}</span>
               <span className="text-slate-300">→</span>
               <span className="text-red-600">{targetLang}</span>
            </div>
         </div>
         <button onClick={toggleAi} className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all ${isAiActive ? 'bg-red-600 text-white shadow-lg' : 'bg-slate-100 text-slate-600'}`}>
           {isAiActive ? <Radio size={20} className="animate-pulse" /> : <Captions size={20} />}
           {isAiActive ? 'Listening...' : 'Start 12 Min Trial'}
         </button>
      </div>
    </div>
  );
};
