import React from 'react';
import { Smartphone, Facebook, Chrome, Globe } from 'lucide-react';

interface LoginPageProps {
  onLogin: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden bg-[#f8f9ff]">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

      <div className="z-10 w-full max-w-sm space-y-8 text-center animate-fade-in-up">
        <div className="space-y-4">
          <div className="w-24 h-24 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-[2rem] mx-auto flex items-center justify-center shadow-xl shadow-indigo-500/20 mb-6 transform rotate-3">
             <Globe className="text-white" size={48} strokeWidth={1.5} />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">AI Live Translate</h1>
          <p className="text-slate-500 text-lg font-medium">Break language barriers instantly with AI power.</p>
        </div>

        <div className="space-y-4 pt-8">
            {/* Google */}
          <button 
            onClick={onLogin}
            className="w-full bg-white border border-slate-200 p-4 rounded-2xl flex items-center justify-center gap-3 font-bold text-slate-700 shadow-sm hover:bg-slate-50 transition-all active:scale-[0.98] group"
          >
             <Chrome className="text-slate-900 group-hover:text-blue-500 transition-colors" size={22} />
             <span>Continue with Google</span>
          </button>

          {/* Facebook */}
          <button 
            onClick={onLogin}
            className="w-full bg-[#1877F2] p-4 rounded-2xl flex items-center justify-center gap-3 font-bold text-white shadow-lg shadow-blue-500/30 hover:bg-[#166fe5] transition-all active:scale-[0.98]"
          >
             <Facebook fill="currentColor" size={22} />
             <span>Continue with Facebook</span>
          </button>

          {/* Mobile */}
          <button 
            onClick={onLogin}
            className="w-full bg-slate-900 p-4 rounded-2xl flex items-center justify-center gap-3 font-bold text-white shadow-lg shadow-slate-900/20 hover:bg-slate-800 transition-all active:scale-[0.98]"
          >
             <Smartphone size={22} />
             <span>Continue with Phone Number</span>
          </button>
        </div>

        <div className="pt-4">
            <p className="text-xs text-slate-400">
                By continuing, you agree to our <span className="text-indigo-600 font-bold cursor-pointer">Terms</span> and <span className="text-indigo-600 font-bold cursor-pointer">Privacy Policy</span>.
            </p>
        </div>
      </div>
    </div>
  );
};
