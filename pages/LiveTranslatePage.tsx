
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Blob } from '@google/genai';
import { UserProfile, Language } from '../types';
import { PhoneOff, Mic, MicOff, Camera, CameraOff, Volume2, VolumeX, Radio, Sparkles } from 'lucide-react';

interface LiveTranslatePageProps {
  user: UserProfile;
  navigate: (route: any) => void;
}

export const LiveTranslatePage: React.FC<LiveTranslatePageProps> = ({ user, navigate }) => {
  const [sourceLang, setSourceLang] = useState<Language>(Language.ENGLISH);
  const [targetLang, setTargetLang] = useState<Language>(Language.CHINESE_SIMPLIFIED);
  const [isActive, setIsActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [caption, setCaption] = useState("");
  const [inputCaption, setInputCaption] = useState("");

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Gemini Live API state
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  // Manual implementation of encoding as per guidelines
  const encode = (bytes: Uint8Array) => {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  // Manual implementation of decoding as per guidelines
  const decode = (base64: string) => {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  };

  const decodeAudioData = async (
    data: Uint8Array,
    ctx: AudioContext,
    sampleRate: number,
    numChannels: number,
  ): Promise<AudioBuffer> => {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
      }
    }
    return buffer;
  };

  const createBlob = (data: Float32Array): Blob => {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
      int16[i] = data[i] * 32768;
    }
    return {
      data: encode(new Uint8Array(int16.buffer)),
      mimeType: 'audio/pcm;rate=16000',
    };
  };

  const startLiveSession = async () => {
    if (isActive) return;

    try {
      // Use process.env.API_KEY directly for initialization
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: isCameraOn });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;

      const inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      audioContextRef.current = outputAudioContext;

      // Use sessionPromise to prevent race conditions when sending realtime input
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            console.log("Live session opened");
            setIsActive(true);
            
            // Stream audio from mic to session
            const source = inputAudioContext.createMediaStreamSource(stream);
            const scriptProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (e) => {
              if (isMuted) return;
              const inputData = e.inputBuffer.getChannelData(0);
              const pcmBlob = createBlob(inputData);
              // Send input only after session resolves
              sessionPromise.then(session => session.sendRealtimeInput({ media: pcmBlob }));
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputAudioContext.destination);

            // Stream synchronized video frames
            if (isCameraOn) {
              const interval = setInterval(() => {
                if (!videoRef.current || !canvasRef.current || !isActive) return;
                const canvas = canvasRef.current;
                const video = videoRef.current;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                  canvas.width = 320;
                  canvas.height = 240;
                  ctx.drawImage(video, 0, 0, 320, 240);
                  canvas.toBlob((blob) => {
                    if (blob) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        const base64 = (reader.result as string).split(',')[1];
                        sessionPromise.then(s => s.sendRealtimeInput({ media: { data: base64, mimeType: 'image/jpeg' } }));
                      };
                      reader.readAsDataURL(blob);
                    }
                  }, 'image/jpeg', 0.5);
                }
              }, 1000);
              (window as any)._videoInterval = interval;
            }
          },
          onmessage: async (message: LiveServerMessage) => {
            // Process model audio with accurate scheduling
            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData.data;
            if (base64Audio) {
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputAudioContext.currentTime);
              const buffer = await decodeAudioData(decode(base64Audio), outputAudioContext, 24000, 1);
              const source = outputAudioContext.createBufferSource();
              source.buffer = buffer;
              source.connect(outputAudioContext.destination);
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buffer.duration;
              sourcesRef.current.add(source);
              source.onended = () => sourcesRef.current.delete(source);
            }

            // Handle transcriptions
            if (message.serverContent?.outputTranscription) {
              setCaption(prev => (prev + " " + message.serverContent?.outputTranscription?.text).slice(-100));
            }
            if (message.serverContent?.inputTranscription) {
              setInputCaption(message.serverContent?.inputTranscription?.text || "");
            }
            if (message.serverContent?.turnComplete) {
              setCaption("");
              setInputCaption("");
            }

            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => s.stop());
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onclose: () => {
            setIsActive(false);
            console.log("Live session closed");
          },
          onerror: (e) => console.error("Live error:", e),
        },
        config: {
          responseModalities: [Modality.AUDIO],
          outputAudioTranscription: {},
          inputAudioTranscription: {},
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
          },
          systemInstruction: `You are a real-time translator. Listen to the input (audio/video) in ${sourceLang} and translate it immediately into ${targetLang}. Speak only the translation. Be fast and concise. If nothing is being said, remain silent.`,
        },
      });

      sessionRef.current = await sessionPromise;
    } catch (err) {
      console.error("Failed to start session:", err);
    }
  };

  const stopLiveSession = () => {
    setIsActive(false);
    sessionRef.current?.close();
    streamRef.current?.getTracks().forEach(t => t.stop());
    if ((window as any)._videoInterval) clearInterval((window as any)._videoInterval);
  };

  useEffect(() => {
    return () => stopLiveSession();
  }, []);

  return (
    <div className="flex flex-col h-screen bg-black relative overflow-hidden text-white">
      {/* Background Video */}
      <div className="absolute inset-0 z-0 bg-slate-900">
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          className="w-full h-full object-cover opacity-60"
        />
        <canvas ref={canvasRef} className="hidden" />
      </div>

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-50 p-6 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex items-center gap-3">
          <div className="bg-rose-500 p-2.5 rounded-2xl shadow-lg shadow-rose-500/30 animate-pulse">
            <Radio size={20} className="text-white" />
          </div>
          <div>
            <h2 className="text-white font-extrabold text-base tracking-tight">Live AI Translate</h2>
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-rose-400">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping"></span>
              {isActive ? 'Connected' : 'Ready'}
            </div>
          </div>
        </div>
        <button onClick={() => navigate('HOME')} className="p-2.5 bg-white/10 backdrop-blur-xl text-white rounded-full hover:bg-rose-500 transition-all active:scale-95">
          <PhoneOff size={20} />
        </button>
      </div>

      {/* Captions Overlay */}
      <div className="flex-1 flex flex-col justify-end items-center p-12 pointer-events-none z-20">
        <div className="max-w-2xl w-full space-y-4 text-center">
           {inputCaption && (
             <div className="px-4 py-2 bg-black/30 backdrop-blur-md rounded-full inline-block animate-fade-in-up">
               <p className="text-white/60 text-sm font-medium">"{inputCaption}"</p>
             </div>
           )}
           {caption && (
             <div className="bg-gradient-to-br from-rose-600/60 to-pink-600/60 backdrop-blur-2xl p-8 rounded-[3rem] border border-white/20 shadow-2xl animate-fade-in-up">
               <p className="text-white text-4xl font-black tracking-tight leading-tight drop-shadow-2xl">
                 {caption}
               </p>
             </div>
           )}
           {!caption && !inputCaption && isActive && (
             <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <p className="text-white/40 text-sm font-bold uppercase tracking-widest">Listening for {sourceLang}...</p>
             </div>
           )}
        </div>
      </div>

      {/* Controls */}
      <div className="p-8 pb-12 bg-gradient-to-t from-black via-black/80 to-transparent z-30">
        <div className="flex items-center justify-between mb-8 px-4">
           <div className="flex flex-col">
              <span className="text-slate-500 text-[10px] uppercase font-bold tracking-widest mb-1.5">Translate From</span>
              <select 
                value={sourceLang} 
                onChange={(e) => setSourceLang(e.target.value as Language)}
                disabled={isActive}
                className="bg-transparent text-white font-bold outline-none cursor-pointer text-sm appearance-none"
              >
                {Object.values(Language).map(l => <option key={l} value={l} className="text-black">{l}</option>)}
              </select>
           </div>

           <div className="flex gap-4">
             <button 
               onClick={() => setIsMuted(!isMuted)} 
               className={`p-4 rounded-full transition-all ${isMuted ? 'bg-rose-500 text-white' : 'bg-white/10 text-white'}`}
             >
               {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
             </button>
             <button 
               onClick={() => setIsCameraOn(!isCameraOn)} 
               className={`p-4 rounded-full transition-all ${!isCameraOn ? 'bg-slate-700 text-white' : 'bg-white/10 text-white'}`}
             >
               {isCameraOn ? <Camera size={24} /> : <CameraOff size={24} />}
             </button>
           </div>

           <div className="flex flex-col text-right">
              <span className="text-slate-500 text-[10px] uppercase font-bold tracking-widest mb-1.5">Translate To</span>
              <select 
                value={targetLang} 
                onChange={(e) => setTargetLang(e.target.value as Language)}
                disabled={isActive}
                className="bg-transparent text-rose-400 font-bold outline-none cursor-pointer text-sm appearance-none"
              >
                {Object.values(Language).map(l => <option key={l} value={l} className="text-black">{l}</option>)}
              </select>
           </div>
        </div>

        <button 
          onClick={isActive ? stopLiveSession : startLiveSession}
          className={`w-full py-6 rounded-[2.5rem] font-black text-xl flex items-center justify-center gap-3 transition-all duration-500 shadow-2xl ${
            isActive 
              ? 'bg-rose-500 text-white shadow-rose-500/40 ring-4 ring-rose-500/20 active:scale-95' 
              : 'bg-white text-slate-950 shadow-white/20 hover:shadow-white/40 active:scale-95'
          }`}
        >
          {isActive ? <VolumeX size={24} strokeWidth={3} /> : <Radio size={24} strokeWidth={3} />}
          {isActive ? 'End Live Session' : 'Go Live Now'}
        </button>
        
        <p className="text-center text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] mt-6">
           Powered by Gemini Live &bull; Real-time AI Intelligence
        </p>
      </div>
    </div>
  );
};
