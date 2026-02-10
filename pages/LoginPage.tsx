import React from 'react';
import { Smartphone, Facebook, Chrome, Globe, Sparkles, ShieldCheck, Zap } from 'lucide-react';

interface LoginPageProps {
  onLogin: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden bg-slate-950">
      {/* Animated Mesh Background */}
      <div className="absolute inset-0 opacity-40 login-mesh pointer-events-none"></div>
      
      {/* Floating 3D Elements */}
      <div className="absolute top-[15%] left-[10%] w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl animate-[blob-pulse_10s_infinite]"></div>
      <div className="absolute bottom-[15%] right-[10%] w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-[blob-pulse_8s_infinite_reverse]"></div>

      {/* Decorative Floating Icons */}
      <div className="absolute top-[10%] right-[15%] text-indigo-400 opacity-20 animate-[float-slow_6s_infinite] pointer-events-none">
        <Sparkles size={120} />
      </div>
      <div className="absolute bottom-[20%] left-[5%] text-purple-400 opacity-10 animate-[float-slow_9s_infinite_reverse] pointer-events-none">
        <Globe size={180} />
      </div>

      <div className="z-10 w-full max-w-sm space-y-12 animate-fade-in-up">
        {/* Branding Stage */}
        <div className="text-center space-y-6">
          <div className="relative inline-block group">
            <div className="absolute -inset-4 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-[3rem] blur-2xl opacity-40 group-hover:opacity-75 transition duration-1000"></div>
            <div className="relative w-28 h-28 bg-white rounded-[2.5rem] flex items-center justify-center shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] transform -rotate-6 transition-transform hover:rotate-0 duration-500">
              <Globe className="text-indigo-600" size={56} strokeWidth={1.2} />
              <div className="absolute -top-2 -right-2 bg-amber-400 p-2 rounded-xl shadow-lg shadow-amber-500/30 animate-pulse">
                <Zap size={16} fill="white" className="text-white" />
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <h1 className="text-5xl font-black text-white tracking-tighter italic">
              AI live <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">Translations</span>
            </h1>
            <p className="text-slate-400 text-sm font-bold uppercase tracking-[0.3em] opacity-80">Pro Neural Network Engine</p>
          </div>
        </div>

        {/* 3D Login Card */}
        <div className="glass-card p-10 rounded-[3.5rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.5)] border border-white/10 space-y-6 relative overflow-hidden group hover:scale-[1.02] transition-all duration-500">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none"></div>
          
          <div className="space-y-4 relative">
            {/* Google */}
            <button 
              onClick={onLogin}
              className="w-full bg-white h-16 rounded-2xl flex items-center justify-between px-6 font-black text-slate-900 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1)] hover:shadow-2xl hover:-translate-y-1 transition-all active:scale-95 group/btn"
            >
               <div className="flex items-center gap-4">
                 <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center">
                   <Chrome className="text-slate-900 group-hover/btn:text-blue-500 transition-colors" size={20} />
                 </div>
                 <span className="text-sm">Sign in with Google</span>
               </div>
               <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover/btn:text-indigo-600">
                 <Zap size={14} fill="currentColor" />
               </div>
            </button>

            {/* Facebook */}
            <button 
              onClick={onLogin}
              className="w-full bg-[#1877F2] h-16 rounded-2xl flex items-center justify-between px-6 font-black text-white shadow-[0_15px_30px_-10px_rgba(24,119,242,0.4)] hover:shadow-2xl hover:-translate-y-1 transition-all active:scale-95"
            >
               <div className="flex items-center gap-4">
                 <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                   <Facebook fill="currentColor" size={20} />
                 </div>
                 <span className="text-sm">Meta Connector</span>
               </div>
               <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                 <Sparkles size={14} fill="currentColor" />
               </div>
            </button>

            {/* Phone */}
            <button 
              onClick={onLogin}
              className="w-full bg-slate-900 h-16 rounded-2xl flex items-center justify-between px-6 font-black text-white shadow-[0_15px_30px_-10px_rgba(0,0,0,0.5)] hover:shadow-2xl hover:-translate-y-1 transition-all border border-white/5 active:scale-95"
            >
               <div className="flex items-center gap-4">
                 <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center">
                   <Smartphone size={20} />
                 </div>
                 <span className="text-sm">Phone Identity</span>
               </div>
               <ShieldCheck size={18} className="text-emerald-400" />
            </button>
          </div>

          <div className="pt-4 text-center">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-relaxed">
              Secured by <span className="text-indigo-400">Enterprise AI</span> Protocol <br/>
              Version 3.4.0 (Alpha Build)
            </p>
          </div>
        </div>

        {/* System Status Footer */}
        <div className="flex items-center justify-center gap-6 opacity-60">
           <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
              <span className="text-[9px] font-black text-white uppercase tracking-tighter">Servers Live</span>
           </div>
           <div className="w-px h-3 bg-white/10"></div>
           <div className="flex items-center gap-2">
              <span className="text-[9px] font-black text-white uppercase tracking-tighter">SSL Verified</span>
              <ShieldCheck size={10} className="text-indigo-400" />
           </div>
        </div>
      </div>
    </div>
  );
};