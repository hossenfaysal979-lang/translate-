import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, Language, TranslationMode } from '../types';
import { Mic, MicOff, PhoneOff, Settings, Volume2, Video, Camera, CameraOff, Sparkles, Timer, AlertCircle } from 'lucide-react';
import { translateText } from '../services/geminiService';

interface PremiumVideoPageProps {
  user: UserProfile;
  navigate: (route: any) => void;
}

export const PremiumVideoPage: React.FC<PremiumVideoPageProps> = ({ user, navigate }) => {
  const [sourceLang, setSourceLang] = useState<Language>(Language.ENGLISH);
  const [targetLang, setTargetLang] = useState<Language>(Language.SPANISH);
  const [isContinuousListening, setIsContinuousListening] = useState(false);
  const [liveCaption, setLiveCaption] = useState("");
  const [translatedCaption, setTranslatedCaption] = useState("");
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const [trialExpired, setTrialExpired] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const recognitionRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Timer logic
  useEffect(() => {
    if (timeLeft <= 0) {
      setTrialExpired(true);
      setIsContinuousListening(false);
      recognitionRef.current?.stop();
      return;
    }

    if (isContinuousListening) {
      const timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timeLeft, isContinuousListening]);

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Camera logic
  useEffect(() => {
    if (isCameraOn && !trialExpired) {
      navigator.mediaDevices.getUserMedia({ video: true, audio: false })
        .then(s => {
          streamRef.current = s;
          if (videoRef.current) videoRef.current.srcObject = s;
        })
        .catch(err => console.error("Camera error:", err));
    } else {
      streamRef.current?.getTracks().forEach(track => track.stop());
    }
    return () => streamRef.current?.getTracks().forEach(track => track.stop());
  }, [isCameraOn, trialExpired]);

  // Recognition logic
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      // @ts-ignore
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;

      rec.onresult = async (event: any) => {
        const result = event.results[event.results.length - 1];
        const transcript = result[0].transcript;
        
        if (result.isFinal) {
          const translation = await translateText(transcript, sourceLang, targetLang, TranslationMode.PREMIUM);
          setTranslatedCaption(translation);
          setLiveCaption("");
        } else {
          setLiveCaption(transcript);
        }
      };

      rec.onend = () => {
        if (isContinuousListening && !trialExpired) {
          try { rec.start(); } catch(e) {}
        }
      };

      recognitionRef.current = rec;
    }
  }, [isContinuousListening, sourceLang, targetLang, trialExpired]);

  const toggleListening = () => {
    if (trialExpired) return;
    if (isContinuousListening) {
      setIsContinuousListening(false);
      recognitionRef.current?.stop();
    } else {
      setIsContinuousListening(true);
      let langCode = 'en-US';
      if (sourceLang === Language.CHINESE_SIMPLIFIED) langCode = 'zh-CN';
      if (sourceLang === Language.SPANISH) langCode = 'es-ES';
      if (sourceLang === Language.JAPANESE) langCode = 'ja-JP';
      if (sourceLang === Language.BENGALI) langCode = 'bn-IN';
      if (sourceLang === Language.HINDI) langCode = 'hi-IN';
      if (sourceLang === Language.INDONESIAN) langCode = 'id-ID';
      recognitionRef.current.lang = langCode;
      try { recognitionRef.current.start(); } catch(e) {}
    }
  };

  return (
    <div className="flex flex-col h-screen bg-black overflow-hidden relative">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-50 p-4 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex items-center gap-2">
          <div className="bg-amber-500 p-2 rounded-lg shadow-lg shadow-amber-500/20">
            <Sparkles size={20} className="text-white" fill="currentColor" />
          </div>
          <div>
            <h2 className="text-white font-bold text-sm tracking-tight">AI Pro Video Captions</h2>
            <div className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest ${timeLeft < 60 ? 'text-rose-400 animate-pulse' : 'text-amber-400'}`}>
              <Timer size={10} />
              <span>Trial: {formatTime(timeLeft)}</span>
            </div>
          </div>
        </div>
        <button onClick={() => navigate('HOME')} className="p-2 bg-white/10 backdrop-blur-md text-white rounded-full hover:bg-rose-500 transition-colors">
          <PhoneOff size={20} />
        </button>
      </div>

      {/* Video View */}
      <div className="flex-1 relative">
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          muted 
          className={`w-full h-full object-cover transition-opacity duration-1000 ${isCameraOn ? 'opacity-70' : 'opacity-0'}`}
        />
        
        {/* Captions Overlay */}
        <div className="absolute inset-0 flex flex-col justify-end p-10 pointer-events-none z-20">
           <div className="max-w-2xl mx-auto w-full space-y-4">
              {liveCaption && (
                <p className="text-white/40 text-lg font-medium italic text-center animate-pulse">
                  "{liveCaption}"
                </p>
              )}
              {translatedCaption && (
                <div className="bg-gradient-to-br from-indigo-600/40 to-violet-600/40 backdrop-blur-2xl p-6 rounded-[2rem] border border-white/20 shadow-2xl animate-fade-in-up">
                  <p className="text-amber-300 text-3xl font-extrabold tracking-tight leading-tight text-center drop-shadow-xl">
                    {translatedCaption}
                  </p>
                </div>
              )}
           </div>
        </div>

        {trialExpired && (
          <div className="absolute inset-0 z-40 bg-black/90 backdrop-blur-md flex items-center justify-center p-8 text-center">
            <div className="space-y-6 animate-fade-in-up">
              <div className="w-20 h-20 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto border border-amber-500/30">
                <AlertCircle size={40} className="text-amber-500" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-white">Trial Expired</h3>
                <p className="text-slate-400">Your 10-minute premium video trial has ended. Upgrade to Pro for unlimited AI captions.</p>
              </div>
              <button 
                onClick={() => navigate('PROFILE')}
                className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-600 rounded-2xl text-white font-bold shadow-xl shadow-amber-500/20 active:scale-95 transition-all"
              >
                Upgrade to Pro
              </button>
              <button onClick={() => navigate('HOME')} className="text-slate-500 font-bold text-sm">Return Home</button>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      {!trialExpired && (
        <div className="bg-gradient-to-t from-black to-transparent p-8 pt-20 z-30">
          <div className="flex items-center justify-between mb-6 px-4">
            <div className="flex flex-col">
              <span className="text-slate-500 text-[10px] uppercase font-bold tracking-widest mb-1">Speaker</span>
              <select 
                value={sourceLang} 
                onChange={(e) => setSourceLang(e.target.value as Language)}
                className="bg-transparent text-white font-bold outline-none cursor-pointer appearance-none text-sm"
              >
                {Object.values(Language).map(l => <option key={l} value={l} className="text-black">{l}</option>)}
              </select>
            </div>
            
            <button onClick={() => setIsCameraOn(!isCameraOn)} className={`p-4 rounded-full transition-all ${isCameraOn ? 'bg-white/10 text-white' : 'bg-rose-500 text-white animate-pulse'}`}>
              {isCameraOn ? <Camera size={24} /> : <CameraOff size={24} />}
            </button>

            <div className="flex flex-col text-right">
              <span className="text-slate-500 text-[10px] uppercase font-bold tracking-widest mb-1">AI Caption</span>
              <select 
                value={targetLang} 
                onChange={(e) => setTargetLang(e.target.value as Language)}
                className="bg-transparent text-amber-400 font-bold outline-none cursor-pointer appearance-none text-sm"
              >
                {Object.values(Language).map(l => <option key={l} value={l} className="text-black">{l}</option>)}
              </select>
            </div>
          </div>

          <button 
            onClick={toggleListening}
            className={`w-full py-6 rounded-[2rem] font-bold text-lg flex items-center justify-center gap-3 transition-all duration-500 shadow-2xl ${
              isContinuousListening 
                ? 'bg-rose-500 text-white shadow-rose-500/40 ring-4 ring-rose-500/20' 
                : 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-indigo-600/40 hover:shadow-indigo-600/60'
            }`}
          >
            {isContinuousListening ? <MicOff size={24} strokeWidth={2.5} /> : <Mic size={24} strokeWidth={2.5} />}
            {isContinuousListening ? 'Pause AI Engine' : 'Start Premium Captions'}
          </button>
        </div>
      )}
    </div>
  );
};