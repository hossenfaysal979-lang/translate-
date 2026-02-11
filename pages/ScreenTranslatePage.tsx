
import React, { useState, useEffect } from 'react';
import { UserProfile, Language, HistoryItem, TranslationMode } from '../types';
import { 
  ChevronLeft, Sparkles, X, Loader2, Globe, Layers, 
  Search, Settings, MessageSquare, Heart, Share2, 
  Smartphone, Zap, Power, ShieldCheck
} from 'lucide-react';
import { translateText } from '../services/geminiService';

interface ScreenTranslatePageProps {
  user: UserProfile;
  navigate: (route: any) => void;
  addToHistory: (item: HistoryItem) => void;
}

export const ScreenTranslatePage: React.FC<ScreenTranslatePageProps> = ({ user, navigate, addToHistory }) => {
  const [targetLang, setTargetLang] = useState<Language>(Language.ENGLISH);
  const [isEngineActive, setIsEngineActive] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [translatedItems, setTranslatedItems] = useState<Record<string, string>>({});
  const [showFloatingBubble, setShowFloatingBubble] = useState(true);

  // Simulated Foreign App Content
  const mockPosts = [
    { id: 'p1', author: 'Hiroshi', text: '今日は本当に素晴らしい天気ですね！散歩に行きたいです。', time: '2m' },
    { id: 'p2', author: 'Elena', text: 'Esta nueva actualización es increíble. Me encanta la interfaz.', time: '15m' },
    { id: 'p3', author: 'Zhang', text: '这里有谁想和我一起去吃晚饭吗？我很饿。', time: '1h' }
  ];

  const handleTranslateScreen = async () => {
    if (isScanning) return;
    setIsScanning(true);
    
    // Simulate multiple parallel translations for different screen elements
    const results: Record<string, string> = {};
    for (const post of mockPosts) {
      if (!translatedItems[post.id]) {
        const translated = await translateText(post.text, Language.AUTO_DETECT, targetLang, TranslationMode.AI_SMART);
        results[post.id] = translated;
      }
    }

    setTranslatedItems(prev => ({ ...prev, ...results }));
    setIsScanning(false);

    // Record only the first translation to history for logging
    if (mockPosts.length > 0 && results[mockPosts[0].id]) {
      addToHistory({
        id: Date.now().toString(),
        sourceText: "[On-Screen Buffer Capture]",
        targetText: `Translated ${Object.keys(results).length} screen elements to ${targetLang}`,
        sourceLang: Language.AUTO_DETECT,
        targetLang,
        mode: TranslationMode.AI_SMART,
        timestamp: Date.now()
      });
    }
  };

  const toggleEngine = () => {
    if (isEngineActive) {
      setIsEngineActive(false);
      setTranslatedItems({});
    } else {
      setIsEngineActive(true);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 relative overflow-hidden font-sans">
      {/* HUD System Bar */}
      <div className="bg-white/90 backdrop-blur-xl p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('HOME')} className="p-2 -ml-2 text-slate-400 hover:bg-slate-50 rounded-full transition-colors">
            <ChevronLeft size={24} />
          </button>
          <div>
            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-slate-900 leading-none italic">On-Screen Engine</h2>
            <div className="flex items-center gap-1.5 mt-1.5">
               <div className={`w-1.5 h-1.5 rounded-full ${isEngineActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></div>
               <span className="text-[9px] font-black text-slate-400 tracking-widest uppercase">
                 {isEngineActive ? 'Unlimited Mode: Active' : 'Engine: Standby'}
               </span>
            </div>
          </div>
        </div>
        <button 
          onClick={toggleEngine}
          className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all font-black text-[10px] uppercase tracking-widest ${
            isEngineActive ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20' : 'bg-slate-900 text-white'
          }`}
        >
          {isEngineActive ? <X size={14} strokeWidth={3} /> : <Power size={14} strokeWidth={3} />}
          {isEngineActive ? 'Stop' : 'Launch'}
        </button>
      </div>

      {/* Main Simulation Area */}
      <div className="flex-1 p-6 relative flex flex-col items-center justify-center">
        
        {/* The Mock Mobile UI */}
        <div className="w-full max-w-sm aspect-[9/19] bg-white rounded-[3rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.1)] border-[10px] border-slate-900 overflow-hidden relative group">
          
          {/* Mock Status Bar */}
          <div className="h-10 bg-white flex items-center justify-between px-8 pt-2">
            <span className="text-xs font-black">9:41</span>
            <div className="flex gap-1.5">
               <div className="w-4 h-2 bg-slate-900 rounded-sm"></div>
               <div className="w-3 h-3 bg-slate-900 rounded-full"></div>
            </div>
          </div>

          {/* Mock App Header */}
          <div className="p-6 flex items-center justify-between border-b border-slate-50">
             <h3 className="text-xl font-black italic text-indigo-600">InstaAI</h3>
             <div className="flex items-center gap-2">
                <span className="text-[8px] font-black text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full">FREE</span>
                <MessageSquare size={20} className="text-slate-400" />
             </div>
          </div>

          {/* Mock App Content */}
          <div className="p-6 space-y-10 overflow-y-auto h-full pb-32">
            {mockPosts.map((post) => (
              <div key={post.id} className="space-y-4">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-bold text-xs uppercase">
                      {post.author[0]}
                   </div>
                   <div className="flex flex-col">
                      <span className="text-xs font-black text-slate-900 tracking-tight">{post.author}</span>
                      <span className="text-[10px] text-slate-400 font-bold">{post.time} ago</span>
                   </div>
                </div>

                <div className="relative">
                  {/* Original Text */}
                  <p className={`text-base font-medium leading-relaxed transition-all duration-700 ${translatedItems[post.id] ? 'opacity-0 scale-95 blur-md' : 'text-slate-700'}`}>
                    {post.text}
                  </p>
                  
                  {/* Translated Overlay */}
                  {translatedItems[post.id] && (
                    <div className="absolute inset-0 bg-indigo-50/50 rounded-2xl p-4 border border-indigo-100 animate-fade-in-up">
                      <div className="flex items-center gap-2 mb-2">
                         <Sparkles size={10} className="text-indigo-600" fill="currentColor" />
                         <span className="text-[8px] font-black text-indigo-400 uppercase tracking-widest">AI Result</span>
                      </div>
                      <p className="text-sm font-bold text-slate-900 leading-snug">
                        {translatedItems[post.id]}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-6 text-slate-300">
                   <Heart size={20} />
                   <MessageSquare size={20} />
                   <Share2 size={20} />
                </div>
              </div>
            ))}
          </div>

          {/* Floating Bubble UI (The Core of On-Screen Translation) */}
          {isEngineActive && showFloatingBubble && (
            <button 
              onClick={handleTranslateScreen}
              className={`absolute right-4 top-[35%] w-16 h-16 rounded-[1.75rem] shadow-2xl flex items-center justify-center transition-all duration-500 transform hover:scale-110 active:scale-90 z-50 overflow-hidden ${
                isScanning ? 'bg-slate-900 cursor-not-allowed' : 'bg-emerald-600 shadow-emerald-500/40 animate-[float_4s_infinite]'
              }`}
            >
               {isScanning ? (
                 <Loader2 size={32} className="text-emerald-400 animate-spin" />
               ) : (
                 <div className="relative">
                    <Layers size={32} className="text-white" />
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full border-2 border-emerald-600 animate-pulse"></div>
                 </div>
               )}
            </button>
          )}

          {/* Scan Animation Over the Simulated Screen */}
          {isScanning && (
            <div className="absolute inset-0 z-40 bg-emerald-950/20 pointer-events-none">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-500/20 to-transparent h-20 animate-[scan_1.5s_infinite]"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                 <div className="bg-white px-6 py-2.5 rounded-full shadow-2xl flex items-center gap-3 animate-pulse border border-emerald-100">
                    <Smartphone size={16} className="text-emerald-600" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">Scanning Pixels...</span>
                 </div>
              </div>
            </div>
          )}
        </div>

        {/* Floating Controls Background Overlay */}
        <div className="absolute -bottom-10 inset-x-0 h-64 bg-gradient-to-t from-slate-50 via-slate-50 to-transparent pointer-events-none"></div>
      </div>

      {/* Controller Dock */}
      <div className="p-8 pb-14 bg-white shadow-[0_-20px_50px_rgba(0,0,0,0.05)] rounded-t-[4rem] z-50 border-t border-slate-50 space-y-10 animate-fade-in-up">
        
        {!isEngineActive ? (
          <div className="space-y-6 text-center">
             <div className="w-20 h-20 bg-emerald-50 rounded-[2.5rem] flex items-center justify-center mx-auto text-emerald-600 mb-2">
                <Layers size={40} strokeWidth={2.5} />
             </div>
             <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-500 rounded-full text-white font-black text-[10px] tracking-widest uppercase mb-2">
                   <Sparkles size={12} fill="white" />
                   Fully Free Unlimited
                </div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tighter">Mobile Overlay Hook</h3>
                <p className="text-sm text-slate-400 font-bold max-w-xs mx-auto leading-relaxed">
                  Translate text inside <span className="text-emerald-600">any third-party app</span> with zero limits. 100% free for all users.
                </p>
             </div>
             <button 
                onClick={toggleEngine}
                className="w-full py-6 bg-slate-900 text-white rounded-[2rem] font-black text-xl shadow-2xl shadow-slate-900/20 active:scale-95 transition-all"
             >
                Start Injection Engine
             </button>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="flex items-center justify-between px-4">
               <div className="flex flex-col">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Engine Sensitivity</span>
                  <div className="flex items-center gap-3">
                     <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                     <span className="text-sm font-black text-slate-900 uppercase">Neural Pixel Hook</span>
                  </div>
               </div>
               
               <div className="flex flex-col text-right">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Target Language</span>
                  <select 
                    value={targetLang} 
                    onChange={e => setTargetLang(e.target.value as Language)}
                    className="bg-transparent text-emerald-600 font-black outline-none text-base appearance-none cursor-pointer"
                  >
                    {Object.values(Language).filter(l => l !== Language.AUTO_DETECT).map(l => <option key={l} value={l} className="text-black">{l}</option>)}
                  </select>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <button 
                onClick={() => setShowFloatingBubble(!showFloatingBubble)}
                className={`p-6 rounded-[2.2rem] border-2 transition-all flex flex-col items-center gap-3 ${
                  showFloatingBubble ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-slate-50 border-slate-100 text-slate-400'
                }`}
               >
                  <Zap size={24} fill={showFloatingBubble ? 'currentColor' : 'none'} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Floating Icon</span>
               </button>
               <button className="bg-slate-50 border-2 border-slate-100 p-6 rounded-[2.2rem] flex flex-col items-center gap-3 text-slate-400">
                  <ShieldCheck size={24} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Pixel Privacy</span>
               </button>
            </div>

            <p className="text-center text-[9px] font-black text-slate-300 uppercase tracking-[0.3em]">
               Unlimited Mode Active &bull; Neural Hook v5.1.0-Alpha
            </p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes scan {
          0% { transform: translateY(-100%); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateY(400%); opacity: 0; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  );
};
