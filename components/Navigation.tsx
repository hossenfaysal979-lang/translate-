import React from 'react';
import { Home, Grid, User, Mic } from 'lucide-react';
import { AppRoute } from '../types';

interface NavigationProps {
  currentRoute: AppRoute;
  onNavigate: (route: AppRoute) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ currentRoute, onNavigate }) => {
  const navItems = [
    { route: AppRoute.HOME, icon: Home, label: 'Explore' },
    { route: AppRoute.CONVERSATION, icon: Mic, label: 'Voice' },
    { route: AppRoute.HISTORY, icon: Grid, label: 'Journal' },
    { route: AppRoute.PROFILE, icon: User, label: 'Account' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none flex justify-center pb-8 pt-4">
      <div className="glass-nav pointer-events-auto flex items-center justify-between px-6 py-3 rounded-[2.5rem] w-[92%] max-w-[400px] mx-auto">
        {navItems.map((item) => {
          const isActive = currentRoute === item.route;
          return (
            <button
              key={item.route}
              onClick={() => onNavigate(item.route)}
              className="relative flex flex-col items-center justify-center py-2 px-4 transition-all duration-500 rounded-2xl group"
            >
              <div className={`transition-all duration-500 absolute inset-0 rounded-2xl ${isActive ? 'bg-indigo-600/10 scale-100' : 'bg-transparent scale-75 opacity-0'}`} />
              
              <item.icon 
                size={22} 
                className={`relative z-10 transition-all duration-500 ${
                  isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'
                }`} 
                strokeWidth={isActive ? 2.5 : 2}
              />
              
              <span className={`text-[9px] font-bold mt-1 transition-all duration-500 uppercase tracking-widest ${
                 isActive ? 'opacity-100 text-indigo-600' : 'opacity-0 scale-50'
              }`}>
                {item.label}
              </span>

              {isActive && (
                <div className="absolute -top-1 w-1 h-1 bg-indigo-600 rounded-full animate-pulse" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};