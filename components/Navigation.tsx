import React from 'react';
import { Home, Grid, User, Mic } from 'lucide-react';
import { AppRoute } from '../types';

interface NavigationProps {
  currentRoute: AppRoute;
  onNavigate: (route: AppRoute) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ currentRoute, onNavigate }) => {
  const navItems = [
    { route: AppRoute.HOME, icon: Home, label: 'Home' },
    { route: AppRoute.CONVERSATION, icon: Mic, label: 'Voice' },
    { route: AppRoute.HISTORY, icon: Grid, label: 'History' },
    { route: AppRoute.PROFILE, icon: User, label: 'Profile' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none flex justify-center pb-6 pt-4 bg-gradient-to-t from-white/80 via-white/50 to-transparent">
      <div className="glass-nav pointer-events-auto flex items-center justify-between px-8 py-4 rounded-full shadow-[0_20px_40px_-12px_rgba(0,0,0,0.1)] w-[90%] max-w-[360px] mx-auto border border-white/50">
        {navItems.map((item) => {
          const isActive = currentRoute === item.route;
          return (
            <button
              key={item.route}
              onClick={() => onNavigate(item.route)}
              className="relative flex flex-col items-center justify-center w-12 h-12"
            >
              <div className={`transition-all duration-300 absolute inset-0 rounded-full ${isActive ? 'bg-indigo-50 opacity-100 scale-100' : 'opacity-0 scale-50'}`} />
              
              <item.icon 
                size={24} 
                className={`relative z-10 transition-all duration-300 ${
                  isActive ? 'text-indigo-600 translate-y-[-2px]' : 'text-slate-400'
                }`} 
                strokeWidth={isActive ? 2.5 : 2}
              />
              
              <span className={`absolute -bottom-1 text-[10px] font-bold transition-all duration-300 ${
                 isActive ? 'opacity-100 text-indigo-600 translate-y-0' : 'opacity-0 translate-y-2'
              }`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
