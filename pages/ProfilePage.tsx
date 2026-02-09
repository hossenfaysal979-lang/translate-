import React from 'react';
import { UserProfile } from '../types';
import { CreditCard, History, Settings, LogOut, ChevronRight, Crown, Sparkles, Zap } from 'lucide-react';

interface ProfilePageProps {
  user: UserProfile;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ user }) => {
  return (
    <div className="p-6 pb-24 space-y-6">
      <h2 className="text-3xl font-bold text-slate-900">My Profile</h2>

      {/* Profile Card */}
      <div className="bg-white p-5 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex items-center gap-5">
        <div className="w-20 h-20 rounded-full p-1 bg-gradient-to-br from-indigo-500 to-purple-600">
          <div className="w-full h-full rounded-full bg-white p-1 overflow-hidden">
             <img src={user.avatarUrl} alt="User" className="w-full h-full object-cover rounded-full" />
          </div>
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-xl text-slate-900">{user.name}</h3>
          <div className="flex items-center gap-2 mt-1">
             <span className="text-slate-500 text-xs font-semibold bg-slate-100 px-2 py-0.5 rounded-md">ID: 8839201</span>
             {user.isPremium && (
                 <span className="flex items-center gap-1 text-[10px] font-bold text-yellow-700 bg-yellow-100 px-2 py-0.5 rounded-md border border-yellow-200">
                     <Crown size={10} fill="currentColor" /> PRO
                 </span>
             )}
          </div>
        </div>
        <button className="text-slate-300 hover:text-indigo-600 transition-colors">
            <Settings size={24} />
        </button>
      </div>

      {/* Premium Points Card */}
      <div className="bg-gradient-to-br from-[#1e1b4b] via-[#312e81] to-[#4338ca] rounded-[2rem] p-8 text-white shadow-[0_20px_50px_-12px_rgba(49,46,129,0.5)] relative overflow-hidden group">
          <div className="relative z-10">
              <div className="flex justify-between items-start mb-8">
                  <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10">
                    <Sparkles size={24} className="text-yellow-300" />
                  </div>
                  <div className="text-right">
                      <p className="text-indigo-200 text-xs font-bold uppercase tracking-wider mb-1">Balance</p>
                      <h3 className="text-5xl font-extrabold tracking-tight">{user.points}</h3>
                  </div>
              </div>
              
              <div className="flex gap-3">
                  <button className="flex-1 bg-white text-indigo-900 py-3.5 rounded-xl text-sm font-bold shadow-lg hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2">
                      <Zap size={16} fill="currentColor" />
                      Top Up
                  </button>
              </div>
          </div>
          
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-indigo-500/30 transition-all duration-700"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 group-hover:bg-purple-500/30 transition-all duration-700"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
      </div>

      {/* Menu List */}
      <div className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden">
          {[
              { icon: History, label: 'Usage History', val: '' },
              { icon: CreditCard, label: 'Billing Settings', val: '' },
              { icon: Crown, label: 'Upgrade to Pro', val: 'PRO' },
          ].map((item, idx) => (
              <button key={idx} className="w-full flex items-center justify-between p-5 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-none group">
                  <div className="flex items-center gap-4">
                      <div className="p-2.5 bg-slate-50 rounded-xl text-slate-500 group-hover:text-indigo-600 group-hover:bg-indigo-50 transition-colors">
                          <item.icon size={20} />
                      </div>
                      <span className="font-bold text-slate-700 text-sm">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-3">
                      {item.val && <span className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">{item.val}</span>}
                      <ChevronRight size={18} className="text-slate-300 group-hover:text-indigo-400 transition-colors" />
                  </div>
              </button>
          ))}
      </div>

       <button className="w-full p-4 text-rose-500 font-bold bg-rose-50 rounded-2xl hover:bg-rose-100 transition-colors flex items-center justify-center gap-2 text-sm">
           <LogOut size={18} />
           Log Out
       </button>
    </div>
  );
};
