
import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, Language, TranslationMode } from '../types';
import { Play, Pause, Upload, PhoneOff, Sparkles, Timer, AlertCircle, Volume2, Maximize, FileVideo, Loader2 } from 'lucide-react';
import { translateText } from '../services/geminiService';

interface VideoFileTranslatorPageProps {
  user: UserProfile;
  navigate: (route: any) => void;
}

export const VideoFileTranslatorPage: React.FC<VideoFileTranslatorPageProps> = ({ user, navigate }) => {
  const [sourceLang, setSourceLang] = useState<Language>(Language.ENGLISH);
  const [targetLang, setTargetLang] = useState<Language>(Language.SPANISH);
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [translatedCaption, setTranslatedCaption] = useState("");
  const [interimCaption, setInterimCaption] = useState("");
  const [timeLeft, setTimeLeft] = useState(720); // 12 minutes
  const [trialExpired, setTrialExpired] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const recognitionRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Trial Timer
  useEffect(() => {
    if (timeLeft <= 0) {
      setTrialExpired(true);
      stopTranslation();
      return;
    }

    if (isPlaying && isProcessing) {
      const timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timeLeft, isPlaying, isProcessing]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setVideoSrc(url);
      setTranslatedCaption("");
      setInterimCaption("");
    }
  };

  const startTranslation = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert("Speech recognition not supported in your browser.");
      return;
    }
    
    setIsProcessing(true);
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
        const translation = await translateText(transcript, sourceLang, targetLang, TranslationMode.PREMIUM);
        setTranslatedCaption(translation);
      } else {
        setInterimCaption(transcript);
      }
    };

    rec.onend = () => {
      if (isProcessing && isPlaying && !trialExpired) {
        try { rec.start(); } catch(e) {}
      }
    };

    let langCode = 'en-US';
    if (sourceLang === Language.CHINESE_SIMPLIFIED) langCode = 'zh-CN';
    if (sourceLang === Language.SPANISH) langCode = 'es-ES';
    if (sourceLang === Language.JAPANESE) langCode = 'ja-JP';
    if (sourceLang === Language.INDONESIAN) langCode = 'id-ID';
    rec.lang = langCode;

    recognitionRef.current = rec;
    rec.start();
  };

  const stopTranslation = () => {
    setIsProcessing(false);
    recognitionRef.current?.stop();
    setInterimCaption("");
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
      stopTranslation();
    } else {
      videoRef.current.play();
      setIsPlaying(true);
      startTranslation();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-950 overflow-hidden relative text-white">
      {/* Cinematic Header */}
      <div className="absolute top-0 left-0 right-0 z-50 p-6 flex justify-between items-center bg-gradient-to-b from-black/90 via-black/40 to-transparent">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2.5 rounded-2xl shadow-lg shadow-blue-500/20">
            <Sparkles size={20} className="text-white" fill="currentColor" />
          </div>
          <div>
            <h2 className="text-white font-extrabold text-base tracking-tight">Pro Video Translator</h2>
            <div className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest ${timeLeft < 60 ? 'text-rose-400 animate-pulse' : 'text-blue-400'}`}>
              <Timer size={10} />
              <span>FREE TRIAL: {formatTime(timeLeft)}</span>
            </div>
          </div>
        </div>
        <button onClick={() => navigate('HOME')} className="p-2.5 bg-white/10 backdrop-blur-xl text-white rounded-full hover:bg-rose-500 transition-all active:scale-95">
          <PhoneOff size={20} />
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col items-center justify-center relative group">
        {!videoSrc ? (
          <div className="flex flex-col items-center space-y-6 max-w-xs text-center animate-fade-in-up">
            <div className="w-24 h-24 bg-slate-900 rounded-[2.5rem] flex items-center justify-center border border-white/5 shadow-2xl">
              <FileVideo size={48} className="text-slate-500" strokeWidth={1.5} />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold">Select a Video</h3>
              <p className="text-slate-400 text-sm">Upload a movie or recording to see AI-powered translated captions.</p>
              <div className="inline-block px-3 py-1 bg-blue-500/10 border border-blue-500/30 rounded-full">
                <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">12 Minute Free Trial</span>
              </div>
            </div>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-4 bg-white text-slate-950 rounded-2xl font-bold shadow-xl hover:bg-indigo-50 transition-all flex items-center justify-center gap-2 group-active:scale-95"
            >
              <Upload size={20} />
              Browse Media
            </button>
            <input type="file" ref={fileInputRef} className="hidden" accept="video/*" onChange={handleFileUpload} />
          </div>
        ) : (
          <div className="w-full h-full relative">
            <video 
              ref={videoRef}
              src={videoSrc}
              className="w-full h-full object-contain"
              onEnded={() => { setIsPlaying(false); stopTranslation(); }}
            />
            
            {/* Captions Layer */}
            <div className="absolute inset-0 z-20 pointer-events-none flex flex-col justify-end items-center p-12 bg-gradient-to-t from-black/60 via-transparent to-transparent">
               <div className="max-w-3xl w-full text-center space-y-4">
                  {interimCaption && (
                    <p className="text-white/40 text-lg font-medium italic animate-pulse">
                      "{interimCaption}"
                    </p>
                  )}
                  {translatedCaption && (
                    <div className="bg-slate-900/60 backdrop-blur-3xl p-6 rounded-[2.5rem] border border-white/10 shadow-[0_30px_60px_-12px_rgba(0,0,0,0.5)] animate-fade-in-up">
                      <p className="text-yellow-400 text-4xl font-black tracking-tight leading-tight drop-shadow-2xl">
                        {translatedCaption}
                      </p>
                    </div>
                  )}
               </div>
            </div>

            {/* Trial Overlay */}
            {trialExpired && (
              <div className="absolute inset-0 z-40 bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-10 text-center">
                <div className="space-y-8 animate-fade-in-up max-w-sm">
                  <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto border border-blue-500/20">
                    <AlertCircle size={40} className="text-blue-500" />
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-3xl font-black text-white">Trial Finished</h3>
                    <p className="text-slate-400 font-medium">Your 12-minute pro video translation trial is complete. Get Pro for unlimited media translation.</p>
                  </div>
                  <button 
                    onClick={() => navigate('PROFILE')}
                    className="w-full py-5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl text-white font-extrabold shadow-2xl shadow-blue-500/40 active:scale-95 transition-all"
                  >
                    Unlock Pro Mode
                  </button>
                  <button onClick={() => navigate('HOME')} className="text-slate-500 font-bold text-sm hover:text-white transition-colors">Maybe Later</button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Video Player Controls */}
      {videoSrc && !trialExpired && (
        <div className="p-8 pb-12 bg-gradient-to-t from-black via-black/80 to-transparent">
          <div className="flex items-center gap-6 mb-8 px-2">
            <div className="flex flex-col flex-1">
              <span className="text-slate-500 text-[10px] uppercase font-bold tracking-widest mb-1.5">Voice Source</span>
              <select 
                value={sourceLang} 
                onChange={(e) => setSourceLang(e.target.value as Language)}
                className="bg-slate-900/50 p-2 rounded-lg text-white font-bold outline-none cursor-pointer appearance-none text-xs border border-white/5"
              >
                {Object.values(Language).map(l => <option key={l} value={l} className="text-black">{l}</option>)}
              </select>
            </div>

            <button 
              onClick={togglePlay}
              className="w-20 h-20 rounded-full bg-white text-slate-950 flex items-center justify-center shadow-2xl shadow-white/20 hover:scale-105 active:scale-90 transition-all"
            >
              {isPlaying ? <Pause size={32} fill="currentColor" /> : <Play size={32} className="ml-1" fill="currentColor" />}
            </button>

            <div className="flex flex-col flex-1 text-right">
              <span className="text-slate-500 text-[10px] uppercase font-bold tracking-widest mb-1.5">Pro Captions</span>
              <select 
                value={targetLang} 
                onChange={(e) => setTargetLang(e.target.value as Language)}
                className="bg-slate-900/50 p-2 rounded-lg text-yellow-400 font-bold outline-none cursor-pointer appearance-none text-xs border border-white/5"
              >
                {Object.values(Language).map(l => <option key={l} value={l} className="text-black">{l}</option>)}
              </select>
            </div>
          </div>

          <div className="flex justify-center gap-8 text-slate-500">
             <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 text-xs font-bold hover:text-white transition-colors">
               <Upload size={14} /> New File
             </button>
             <button className="flex items-center gap-2 text-xs font-bold hover:text-white transition-colors">
               <Volume2 size={14} /> Audio Path
             </button>
             <button className="flex items-center gap-2 text-xs font-bold hover:text-white transition-colors">
               <Maximize size={14} /> Full Screen
             </button>
          </div>
        </div>
      )}
    </div>
  );
};
