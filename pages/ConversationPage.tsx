import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, Language, ChatMessage, CallContext } from '../types';
import { Mic, MicOff, PhoneOff, Settings, Volume2, Video, Phone, MessageCircle, Monitor, Camera, CameraOff } from 'lucide-react';
import { generateConversationResponse, translateText } from '../services/geminiService';
import { TranslationMode } from '../types';

interface ConversationPageProps {
  user: UserProfile;
  navigate: (route: any) => void;
  context: CallContext;
}

export const ConversationPage: React.FC<ConversationPageProps> = ({ user, navigate, context }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userLang, setUserLang] = useState<Language>(Language.ENGLISH);
  const [partnerLang, setPartnerLang] = useState<Language>(Language.CHINESE_SIMPLIFIED);
  const [activeSpeaker, setActiveSpeaker] = useState<'none' | 'user' | 'partner'>('none');
  const [isContinuousListening, setIsContinuousListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCameraOn, setIsCameraOn] = useState(context === 'video');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const isCallMode = context !== 'face-to-face';
  const isVideoMode = context === 'video';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle Camera for Video Mode
  useEffect(() => {
    if (isVideoMode && isCameraOn) {
      navigator.mediaDevices.getUserMedia({ video: true, audio: false })
        .then(s => {
          setStream(s);
          if (videoRef.current) videoRef.current.srcObject = s;
        })
        .catch(err => console.error("Camera error:", err));
    } else {
      stream?.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    return () => stream?.getTracks().forEach(track => track.stop());
  }, [isVideoMode, isCameraOn]);

  // Speech Recognition Setup
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      // @ts-ignore
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const rec = new SpeechRecognition();
      rec.continuous = isCallMode; 
      rec.interimResults = true; 
      
      rec.onresult = async (event: any) => {
        let transcript = '';
        const result = event.results[event.results.length - 1];
        transcript = result[0].transcript;
        
        if (result.isFinal) {
            handleNewInput(transcript, isVideoMode ? 'partner' : (isCallMode ? 'partner' : activeSpeaker));
        } else if (isVideoMode) {
            // Live preview for captions in video mode
            setLiveCaption(transcript);
        }
      };

      rec.onerror = (e: any) => {
        console.error("Speech error", e);
        if (!isContinuousListening) setActiveSpeaker('none');
      };

      rec.onend = () => {
         if (isContinuousListening) {
             try { rec.start(); } catch(e) {}
         } else {
             setActiveSpeaker('none');
         }
      };

      setRecognition(rec);
      recognitionRef.current = rec;
    }
  }, [activeSpeaker, isContinuousListening, isCallMode, isVideoMode]);

  const [liveCaption, setLiveCaption] = useState("");
  const [translatedCaption, setTranslatedCaption] = useState("");

  const toggleContinuousListening = () => {
      if (isContinuousListening) {
          setIsContinuousListening(false);
          recognitionRef.current?.stop();
          setLiveCaption("");
          setTranslatedCaption("");
      } else {
          setIsContinuousListening(true);
          setRecognitionLang(partnerLang);
          try { recognitionRef.current?.start(); } catch(e) {}
      }
  };

  const startOneShotListening = (speaker: 'user' | 'partner') => {
    if (!recognition) {
        alert("Speech API not supported");
        return;
    }
    setActiveSpeaker(speaker);
    setRecognitionLang(speaker === 'user' ? userLang : partnerLang);
    try {
        recognition.start();
    } catch(e) {
        recognition.stop();
        setTimeout(() => recognition.start(), 200);
    }
  };

  const setRecognitionLang = (lang: Language) => {
      if (!recognitionRef.current) return;
      let langCode = 'en-US';
      if (lang === Language.CHINESE_SIMPLIFIED) langCode = 'zh-CN';
      if (lang === Language.SPANISH) langCode = 'es-ES';
      if (lang === Language.JAPANESE) langCode = 'ja-JP';
      if (lang === Language.KOREAN) langCode = 'ko-KR';
      if (lang === Language.FRENCH) langCode = 'fr-FR';
      if (lang === Language.GERMAN) langCode = 'de-DE';
      if (lang === Language.BENGALI) langCode = 'bn-IN';
      if (lang === Language.HINDI) langCode = 'hi-IN';
      if (lang === Language.URDU) langCode = 'ur-PK';
      if (lang === Language.ARABIC) langCode = 'ar-SA';
      if (lang === Language.INDONESIAN) langCode = 'id-ID';
      recognitionRef.current.lang = langCode;
  };

  const handleNewInput = async (text: string, speaker: 'user' | 'partner' | 'none') => {
    if (speaker === 'none') return;

    if (isVideoMode) {
        // Translate the final result for captions
        const translation = await translateText(text, partnerLang, userLang, TranslationMode.STANDARD);
        setTranslatedCaption(translation);
        
        const newMessage: ChatMessage = {
          id: Date.now().toString(),
          sender: 'partner',
          text: text,
          originalText: translation,
          timestamp: Date.now(),
        };
        setMessages(prev => [...prev, newMessage]);
        return;
    }

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: speaker,
      text: text,
      timestamp: Date.now(),
    };
    
    if (isCallMode) {
        setMessages(prev => [...prev, newMessage]);
        const response = await translateText(text, partnerLang, userLang, TranslationMode.STANDARD);
        
        setTimeout(() => {
             const translatedMsg: ChatMessage = {
                 id: (Date.now() + 1).toString(),
                 sender: 'ai', 
                 text: response,
                 timestamp: Date.now()
             };
             setMessages(prev => [...prev, translatedMsg]);
        }, 300);

    } else {
        setMessages(prev => [...prev, newMessage]);
        if (speaker === 'user') {
           setTimeout(async () => {
               const response = await generateConversationResponse(text, userLang, partnerLang);
               const partnerMsg: ChatMessage = {
                   id: (Date.now() + 1).toString(),
                   sender: 'partner', 
                   text: response.original,
                   originalText: response.translated, 
                   timestamp: Date.now()
               };
               setMessages(prev => [...prev, partnerMsg]);
               speakText(response.original, partnerLang);
           }, 1000);
        }
    }
  };

  const speakText = (text: string, lang: Language) => {
    const utterance = new SpeechSynthesisUtterance(text);
    let locale = 'en-US';
    if (lang === Language.CHINESE_SIMPLIFIED) locale = 'zh-CN';
    if (lang === Language.SPANISH) locale = 'es-ES';
    if (lang === Language.JAPANESE) locale = 'ja-JP';
    if (lang === Language.KOREAN) locale = 'ko-KR';
    if (lang === Language.FRENCH) locale = 'fr-FR';
    if (lang === Language.GERMAN) locale = 'de-DE';
    if (lang === Language.BENGALI) locale = 'bn-IN';
    if (lang === Language.HINDI) locale = 'hi-IN';
    if (lang === Language.URDU) locale = 'ur-PK';
    if (lang === Language.ARABIC) locale = 'ar-SA';
    if (lang === Language.INDONESIAN) locale = 'id-ID';
    
    utterance.lang = locale;
    window.speechSynthesis.speak(utterance);
  };

  const renderHeader = () => {
      let title = "Face-to-Face";
      let Icon = Mic;
      let color = "text-gray-800";

      switch(context) {
          case 'phone': title = "Phone Assistant"; Icon = Phone; color = "text-green-600"; break;
          case 'whatsapp': title = "WhatsApp Call"; Icon = MessageCircle; color = "text-emerald-500"; break;
          case 'conference': title = "Meeting"; Icon = Monitor; color = "text-blue-600"; break;
          case 'video': title = "Video Translate"; Icon = Video; color = "text-purple-600"; break;
      }

      return (
        <div className="bg-white/90 backdrop-blur-md p-4 shadow-sm flex justify-between items-center z-50 absolute top-0 left-0 right-0 border-b border-slate-100">
            <div className="flex items-center gap-2">
                <Icon size={24} className={color} />
                <h2 className="font-bold text-slate-800">{title}</h2>
            </div>
            <div className="flex gap-2">
                {isVideoMode && (
                    <button onClick={() => setIsCameraOn(!isCameraOn)} className={`p-2 rounded-full ${isCameraOn ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>
                        {isCameraOn ? <Camera size={20}/> : <CameraOff size={20}/>}
                    </button>
                )}
                <button onClick={() => navigate('HOME')} className="p-2 bg-rose-50 text-rose-500 rounded-full hover:bg-rose-100 transition-colors">
                    <PhoneOff size={20} />
                </button>
            </div>
        </div>
      );
  };

  return (
    <div className={`flex flex-col h-screen relative ${isCallMode ? 'bg-slate-950' : 'bg-slate-50'}`}>
      {renderHeader()}

      {/* Main View Area */}
      <div className="flex-1 overflow-hidden relative pt-20">
        
        {/* Video Preview Overlay for Video Mode */}
        {isVideoMode && isCameraOn && (
          <div className="absolute inset-0 z-0 bg-black">
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted 
              className="w-full h-full object-cover opacity-60"
            />
          </div>
        )}

        {/* Captions Overlay for Video Mode */}
        {isVideoMode && (
          <div className="absolute inset-0 z-10 pointer-events-none flex flex-col justify-end p-8 bg-gradient-to-t from-black/80 via-transparent to-transparent">
             <div className="space-y-4 max-w-xl mx-auto text-center">
                {liveCaption && (
                  <p className="text-white/60 text-lg font-medium italic animate-pulse">
                    "{liveCaption}"
                  </p>
                )}
                {translatedCaption && (
                  <div className="bg-slate-900/40 backdrop-blur-xl p-4 rounded-2xl border border-white/10 shadow-2xl">
                    <p className="text-yellow-400 text-3xl font-bold tracking-tight leading-tight">
                      {translatedCaption}
                    </p>
                  </div>
                )}
             </div>
          </div>
        )}

        {/* Standard Chat Area (if not Video Mode or overlaying it) */}
        {!isVideoMode && (
          <div className="h-full overflow-y-auto p-4 space-y-6 pb-32">
            <div className={`text-center text-xs ${isCallMode ? 'text-slate-500' : 'text-slate-400'} my-4 pt-4`}>
                {isCallMode ? 'Listening for audio...' : 'Tap a button below to begin...'}
            </div>
            
            {messages.map((msg) => {
                const isUser = msg.sender === 'user';
                const isAI = msg.sender === 'ai';
                
                if (isCallMode) {
                    if (isAI) {
                         return (
                            <div key={msg.id} className="animate-fade-in-up px-4">
                                <p className="text-yellow-400 text-2xl font-bold leading-relaxed">{msg.text}</p>
                            </div>
                         );
                    } else {
                        return (
                            <div key={msg.id} className="opacity-40 px-4">
                                <p className="text-slate-400 text-sm font-medium">{msg.text}</p>
                            </div>
                        );
                    }
                }

                return (
                    <div key={msg.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] ${isUser ? 'bg-indigo-600 text-white rounded-br-none shadow-indigo-500/20' : 'bg-white text-slate-800 border border-slate-100 rounded-bl-none shadow-sm'} p-5 rounded-[1.5rem] shadow-lg animate-fade-in-up`}>
                            <p className="text-lg font-medium leading-relaxed">{msg.text}</p>
                            {msg.originalText && (
                                <div className={`mt-3 pt-3 border-t ${isUser ? 'border-indigo-500/30' : 'border-slate-50'}`}>
                                    <p className={`text-sm ${isUser ? 'text-indigo-200' : 'text-slate-400'} font-medium`}>{msg.originalText}</p>
                                </div>
                            )}
                            <button onClick={() => speakText(msg.text, isUser ? userLang : partnerLang)} className={`mt-3 ${isUser ? 'text-indigo-300' : 'text-slate-400'} hover:text-white transition-colors`}>
                                <Volume2 size={18} />
                            </button>
                        </div>
                    </div>
                );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Controls Bar */}
      <div className={`p-6 pb-12 z-20 ${isVideoMode ? 'bg-transparent' : (isCallMode ? 'bg-slate-900 border-t border-slate-800' : 'bg-white shadow-[0_-10px_40px_rgba(0,0,0,0.05)]')}`}>
          {isVideoMode || isCallMode ? (
              <div className="space-y-4">
                  <div className="flex items-center justify-between px-2">
                      <div className="flex flex-col">
                        <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Source Language</span>
                        <select 
                          value={partnerLang} 
                          onChange={(e) => setPartnerLang(e.target.value as Language)}
                          className="bg-transparent text-white font-bold outline-none cursor-pointer text-sm appearance-none"
                        >
                          {Object.values(Language).map(l => <option key={l} value={l} className="text-black">{l}</option>)}
                        </select>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-500">
                          <Captions size={16} />
                      </div>
                      <div className="flex flex-col text-right">
                        <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Target Captions</span>
                        <select 
                          value={userLang} 
                          onChange={(e) => setUserLang(e.target.value as Language)}
                          className="bg-transparent text-indigo-400 font-bold outline-none cursor-pointer text-sm appearance-none"
                        >
                          {Object.values(Language).map(l => <option key={l} value={l} className="text-black">{l}</option>)}
                        </select>
                      </div>
                  </div>
                  
                  <button 
                    onClick={toggleContinuousListening}
                    className={`w-full py-5 rounded-[1.5rem] font-bold text-lg flex items-center justify-center gap-3 transition-all duration-500 shadow-xl ${
                      isContinuousListening 
                        ? 'bg-rose-500 text-white shadow-rose-500/30 scale-[1.02]' 
                        : 'bg-indigo-600 text-white shadow-indigo-600/30 hover:bg-indigo-700 active:scale-95'
                    }`}
                  >
                      {isContinuousListening ? <MicOff size={24} strokeWidth={2.5} /> : <Mic size={24} strokeWidth={2.5} />}
                      {isContinuousListening ? 'Stop Captioning' : 'Start Translation'}
                  </button>
                  {isVideoMode && <p className="text-center text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-4">Point at a screen or a speaker</p>}
              </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
                <button 
                    onMouseDown={() => startOneShotListening('user')}
                    className={`flex flex-col items-center justify-center p-8 rounded-[2rem] transition-all duration-300 active:scale-95 border-2 ${
                      activeSpeaker === 'user' 
                        ? 'bg-indigo-600 border-indigo-400 text-white shadow-2xl shadow-indigo-500/30' 
                        : 'bg-indigo-50 border-transparent text-indigo-700 hover:bg-indigo-100 shadow-sm'
                    }`}
                >
                    <div className="mb-3 p-3 bg-white/20 rounded-2xl">
                      <Mic size={28} strokeWidth={2.5} />
                    </div>
                    <span className="font-extrabold text-sm">{userLang}</span>
                    <span className="text-[10px] font-bold uppercase opacity-60 mt-1">My Turn</span>
                </button>

                <button 
                    onMouseDown={() => startOneShotListening('partner')}
                    className={`flex flex-col items-center justify-center p-8 rounded-[2rem] transition-all duration-300 active:scale-95 border-2 ${
                      activeSpeaker === 'partner' 
                        ? 'bg-emerald-500 border-emerald-300 text-white shadow-2xl shadow-emerald-500/30' 
                        : 'bg-emerald-50 border-transparent text-emerald-700 hover:bg-emerald-100 shadow-sm'
                    }`}
                >
                    <div className="mb-3 p-3 bg-white/20 rounded-2xl">
                      <Mic size={28} strokeWidth={2.5} />
                    </div>
                    <span className="font-extrabold text-sm">{partnerLang}</span>
                    <span className="text-[10px] font-bold uppercase opacity-60 mt-1">Their Turn</span>
                </button>
            </div>
          )}
      </div>
    </div>
  );
};

const Captions = ({ size, className = "" }: { size: number, className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2.5" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <rect width="18" height="14" x="3" y="5" rx="2" ry="2"/>
    <path d="M7 15h4"/>
    <path d="M15 15h2"/>
    <path d="M7 11h2"/>
    <path d="M13 11h4"/>
  </svg>
);