import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, Language, ChatMessage, CallContext } from '../types';
import { Mic, MicOff, PhoneOff, Settings, Volume2, Video, Phone, MessageCircle, Monitor } from 'lucide-react';
import { generateConversationResponse } from '../services/geminiService';

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

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const isCallMode = context !== 'face-to-face';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Speech Recognition Setup
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      // @ts-ignore
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const rec = new SpeechRecognition();
      rec.continuous = isCallMode; // Continuous for call mode
      rec.interimResults = isCallMode; // Real-time captions for call mode
      
      rec.onresult = async (event: any) => {
        let transcript = '';
        if (isCallMode) {
            // For continuous, we might get multiple results. We just want the latest final or interim.
            // Simplified for demo: just take the last result
            const result = event.results[event.results.length - 1];
            transcript = result[0].transcript;
            
            if (result.isFinal) {
                // In Call Mode, we assume we are listening to the PARTNER (Source) and translating to USER (Target)
                // So "Input" is PartnerLang.
                handleNewInput(transcript, 'partner');
            }
        } else {
            transcript = event.results[0][0].transcript;
            const speaker = activeSpeaker; 
            handleNewInput(transcript, speaker);
            setActiveSpeaker('none'); 
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
  }, [activeSpeaker, isContinuousListening, isCallMode]);

  const toggleContinuousListening = () => {
      if (isContinuousListening) {
          setIsContinuousListening(false);
          recognitionRef.current?.stop();
      } else {
          setIsContinuousListening(true);
          // Set lang to partner lang (assuming we are listening to the call)
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
      recognitionRef.current.lang = langCode;
  };

  const handleNewInput = async (text: string, speaker: 'user' | 'partner' | 'none') => {
    if (speaker === 'none') return;

    // Add original message
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: speaker,
      text: text,
      timestamp: Date.now(),
    };
    
    // In Call Mode, we don't necessarily want to see the original text prominently if it's the partner, 
    // we want the translation. But let's stick to the chat format for now, maybe style it differently.
    
    if (isCallMode) {
        // Translate immediately
        // In Call Mode, Input is Partner (Foreign) -> Output User (Native)
        const response = await generateConversationResponse(text, partnerLang, userLang); // Hack: reusing this function for simple translation
        // The service mocks a reply, but here we just want translation. 
        // Let's manually inject the "translation" that the mock service returns in `originalText` field of the previous message logic.
        
        // Actually, let's just create a translated message.
        // For the demo, let's use the same flow:
        // Message appears. Then translation appears.
        
        setMessages(prev => [...prev, newMessage]);
        
        // Mock translation delay
        setTimeout(async () => {
             // We want to translate TEXT from PartnerLang to UserLang
             // The generateConversationResponse mocks a CONVERSATION. We just want translation here.
             // For demo purposes, we will treat the "partner" message as the input, and the "AI" message as the translation.
             
             // Let's pretend the AI translates it.
             const translatedMsg: ChatMessage = {
                 id: (Date.now() + 1).toString(),
                 sender: 'ai', 
                 text: `(Trans) ${text} -> [English Translation Mock]`, // In a real app, call translateText API here
                 timestamp: Date.now()
             };
             // Ideally calls: translateText(text, partnerLang, userLang, 'STANDARD')
             
             setMessages(prev => [...prev, translatedMsg]);
        }, 500);

    } else {
        setMessages(prev => [...prev, newMessage]);

        // Face to Face logic (User speaks, AI replies for Partner)
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
    
    utterance.lang = locale;
    window.speechSynthesis.speak(utterance);
  };

  const renderHeader = () => {
      let title = "Face-to-Face";
      let Icon = Mic;
      let color = "text-gray-800";

      switch(context) {
          case 'phone': title = "Phone Call Assistant"; Icon = Phone; color = "text-green-600"; break;
          case 'whatsapp': title = "WhatsApp Call"; Icon = MessageCircle; color = "text-emerald-500"; break;
          case 'conference': title = "Video Conference"; Icon = Monitor; color = "text-blue-600"; break;
      }

      return (
        <div className="bg-white p-4 shadow-sm flex justify-between items-center z-10">
            <div className="flex items-center gap-2">
                <Icon size={24} className={color} />
                <h2 className="font-bold text-gray-800">{title}</h2>
            </div>
            <div className="flex gap-2">
                <button className="p-2 text-gray-400"><Settings size={20}/></button>
                <button onClick={() => navigate('HOME')} className="p-2 bg-red-50 text-red-500 rounded-full">
                    <PhoneOff size={20} />
                </button>
            </div>
        </div>
      );
  };

  return (
    <div className={`flex flex-col h-[calc(100vh-80px)] relative ${isCallMode ? 'bg-slate-900' : 'bg-slate-50'}`}>
      {renderHeader()}

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <div className={`text-center text-xs ${isCallMode ? 'text-gray-500' : 'text-gray-400'} my-4`}>
            {isCallMode ? 'Listening for audio...' : 'Conversation Started'}
        </div>
        
        {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            const isAI = msg.sender === 'ai';
            
            if (isCallMode) {
                // Call Mode UI (Subtitle style)
                if (isAI) {
                     return (
                        <div key={msg.id} className="animate-fade-in-up">
                            <p className="text-yellow-400 text-xl font-bold leading-relaxed">{msg.text}</p>
                        </div>
                     );
                } else {
                    return (
                        <div key={msg.id} className="opacity-50">
                            <p className="text-gray-400 text-sm">{msg.text}</p>
                        </div>
                    );
                }
            }

            // Standard Face-to-Face UI
            return (
                <div key={msg.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] ${isUser ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'} p-4 rounded-2xl shadow-sm`}>
                        <p className="text-lg">{msg.text}</p>
                        {msg.originalText && (
                            <div className={`mt-2 pt-2 border-t ${isUser ? 'border-indigo-500/30' : 'border-gray-100'}`}>
                                <p className={`text-sm ${isUser ? 'text-indigo-200' : 'text-gray-500'}`}>{msg.originalText}</p>
                            </div>
                        )}
                        <button onClick={() => speakText(msg.text, isUser ? userLang : partnerLang)} className={`mt-2 ${isUser ? 'text-indigo-300' : 'text-gray-400'} hover:text-white`}>
                            <Volume2 size={16} />
                        </button>
                    </div>
                </div>
            );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Controls */}
      {isCallMode ? (
           <div className="bg-slate-800 p-6 rounded-t-3xl shadow-[0_-5px_15px_rgba(0,0,0,0.5)]">
               <div className="flex items-center justify-between mb-4 px-2">
                   <div className="text-gray-400 text-sm">Target: <span className="text-white font-bold">{partnerLang}</span></div>
                   <div className="text-gray-400 text-sm">Translate to: <span className="text-white font-bold">{userLang}</span></div>
               </div>
               <button 
                onClick={toggleContinuousListening}
                className={`w-full py-6 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all ${isContinuousListening ? 'bg-red-500 text-white animate-pulse' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
               >
                   {isContinuousListening ? <MicOff size={24} /> : <Mic size={24} />}
                   {isContinuousListening ? 'Stop Translating' : 'Start Live Translate'}
               </button>
               <p className="text-center text-gray-500 text-xs mt-4">Place device near speaker for best results</p>
           </div>
      ) : (
        <div className="bg-white p-6 rounded-t-3xl shadow-[0_-5px_15px_rgba(0,0,0,0.05)] grid grid-cols-2 gap-4">
            <button 
                onMouseDown={() => startOneShotListening('user')}
                className={`flex flex-col items-center justify-center p-6 rounded-2xl transition-all active:scale-95 ${activeSpeaker === 'user' ? 'bg-indigo-600 text-white ring-4 ring-indigo-200' : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'}`}
            >
                <Mic size={32} className="mb-2" />
                <span className="font-semibold">{userLang}</span>
                <span className="text-xs opacity-70">(Tap to Speak)</span>
            </button>

            <button 
                onMouseDown={() => startOneShotListening('partner')}
                className={`flex flex-col items-center justify-center p-6 rounded-2xl transition-all active:scale-95 ${activeSpeaker === 'partner' ? 'bg-orange-500 text-white ring-4 ring-orange-200' : 'bg-orange-50 text-orange-700 hover:bg-orange-100'}`}
            >
                <Mic size={32} className="mb-2" />
                <span className="font-semibold">{partnerLang}</span>
                <span className="text-xs opacity-70">(Partner Speak)</span>
            </button>
        </div>
      )}
    </div>
  );
};
