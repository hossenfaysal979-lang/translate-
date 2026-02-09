import React from 'react';
import { UserProfile } from '../types';
import { CreditCard, History, Settings, LogOut, ChevronRight, Crown, Sparkles, Zap, ShieldCheck } from 'lucide-react';

interface ProfilePageProps {
  user: UserProfile;
  onLogout: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ user, onLogout }) => {
  return (
    <div className="p-8 pb-32 space-y-10 animate-fade-in-up">
      <div className="space-y-1">
        <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">Account</h2>
        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Manage your AI intelligence</p>
      </div>

      {/* Profile Card */}
      <div className="bg-white p-7 rounded-[3rem] shadow-[0_15px_40px_-15px_rgba(0,0,0,0.04)] border border-slate-50 flex items-center gap-6">
        <div className="relative">
          <div className="w-20 h-20 rounded-[2rem] p-1 bg-gradient-to-br from-indigo-500 to-violet-600 shadow-xl shadow-indigo-500/20">
            <div className="w-full h-full rounded-[1.75rem] bg-white p-1 overflow-hidden">
               <img src={user.avatarUrl} alt="User" className="w-full h-full object-cover rounded-[1.5rem]" />
            </div>
          </div>
          <div className="absolute -bottom-1 -right-1 bg-emerald-500 w-6 h-6 rounded-full border-4 border-white flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          </div>
        </div>
        
        <div className="flex-1 space-y-1">
          <h3 className="font-black text-2xl text-slate-900 tracking-tight leading-none">{user.name}</h3>
          <div className="flex items-center gap-2">
             <span className="text-slate-400 text-[9px] font-black tracking-widest uppercase">ID: PRO-8839201</span>
             {user.isPremium && (
                 <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-indigo-600">
                    <Crown size={8} fill="white" className="text-white" />
                    <span className="text-[8px] font-black text-white uppercase tracking-tighter">Elite</span>
                 </div>
             )}
          </div>
        </div>
        
        <button className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 hover:text-indigo-600 transition-colors">
            <Settings size={22} />
        </button>
      </div>

      {/* Premium Credits Card */}
      <div className="bg-slate-950 rounded-[3.5rem] p-10 text-white shadow-[0_30px_60px_-12px_rgba(0,0,0,0.4)] relative overflow-hidden group">
          <div className="relative z-10 space-y-8">
              <div className="flex justify-between items-start">
                  <div className="space-y-3">
                    <div className="w-14 h-14 bg-white/10 backdrop-blur-3xl rounded-[1.5rem] border border-white/10 flex items-center justify-center">
                      <Zap size={28} className="text-indigo-400" fill="currentColor" />
                    </div>
                    <h4 className="text-xs font-black uppercase tracking-[0.3em] text-indigo-400">Total Capacity</h4>
                  </div>
                  <div className="text-right">
                      <h3 className="text-6xl font-black tracking-tighter italic">{user.points}</h3>
                      <p className="text-indigo-200/50 text-[10px] font-black uppercase tracking-widest mt-1">Available Credits</p>
                  </div>
              </div>
              
              <div className="flex gap-4">
                  <button className="flex-1 bg-white text-slate-950 h-16 rounded-2xl text-sm font-black shadow-2xl hover:bg-indigo-50 transition-all flex items-center justify-center gap-3 active:scale-95">
                      <Zap size={18} fill="currentColor" />
                      Refill Engine
                  </button>
                  <button className="w-16 h-16 bg-white/10 border border-white/10 rounded-2xl flex items-center justify-center text-white hover:bg-white/20 transition-all">
                      <Sparkles size={20} />
                  </button>
              </div>
          </div>
          
          {/* High-end decorative overlays */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 group-hover:bg-indigo-600/20 transition-all duration-1000"></div>
          <div className="absolute bottom-0 left-0 w-60 h-60 bg-violet-600/10 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2 group-hover:bg-violet-600/20 transition-all duration-1000"></div>
          
          {/* Grainy texture overlay */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
      </div>

      {/* Menu Stack */}
      <div className="bg-white rounded-[3rem] shadow-[0_15px_40px_-15px_rgba(0,0,0,0.04)] border border-slate-50 overflow-hidden px-2">
          {[
              { icon: History, label: 'Analytics & Logs', desc: 'Detailed usage history', val: '' },
              { icon: ShieldCheck, label: 'Neural Privacy', desc: 'Secure data handling', val: 'ON' },
              { icon: CreditCard, label: 'Billing Portal', desc: 'Subscription & Invoices', val: '' },
              { icon: Crown, label: 'Upgrade Membership', desc: 'Unlimited AI power', val: 'VIP' },
          ].map((item, idx) => (
              <button key={idx} className="w-full flex items-center justify-between p-6 hover:bg-slate-50 transition-all border-b border-slate-50 last:border-none group">
                  <div className="flex items-center gap-5">
                      <div className="w-12 h-12 bg-slate-50 rounded-2xl text-slate-400 group-hover:text-indigo-600 group-hover:bg-indigo-50 transition-all flex items-center justify-center border border-transparent group-hover:border-indigo-100">
                          <item.icon size={22} />
                      </div>
                      <div className="text-left">
                        <span className="font-black text-slate-900 text-sm tracking-tight block">{item.label}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.desc}</span>
                      </div>
                  </div>
                  <div className="flex items-center gap-3">
                      {item.val && <span className="premium-gradient text-white text-[9px] font-black px-3 py-1 rounded-lg shadow-sm tracking-tighter">{item.val}</span>}
                      <ChevronRight size={18} className="text-slate-300 group-hover:text-indigo-400 transition-colors" />
                  </div>
              </button>
          ))}
      </div>

       <button 
         onClick={onLogout}
         className="w-full h-16 text-rose-500 font-black bg-rose-50 rounded-2xl hover:bg-rose-100 transition-all flex items-center justify-center gap-3 text-sm uppercase tracking-widest"
       >
           <LogOut size={20} strokeWidth={3} />
           Terminate Session
       </button>
    </div>
  );
};