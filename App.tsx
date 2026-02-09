import React, { useState, useEffect } from 'react';
import { Navigation } from './components/Navigation';
import { HomePage } from './pages/HomePage';
import { ConversationPage } from './pages/ConversationPage';
import { ProfilePage } from './pages/ProfilePage';
import { AppRoute, UserProfile, HistoryItem, CallContext } from './types';
import { INITIAL_POINTS } from './constants';
import { TranslationCard } from './components/TranslationCard';

const App: React.FC = () => {
  const [currentRoute, setCurrentRoute] = useState<AppRoute>(AppRoute.HOME);
  const [callContext, setCallContext] = useState<CallContext>('face-to-face');
  const [user, setUser] = useState<UserProfile>({
    name: 'Alex Chen',
    points: INITIAL_POINTS,
    isPremium: true,
    avatarUrl: 'https://picsum.photos/200/200'
  });
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Load history from local storage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('translation_history');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Failed to parse history");
      }
    }
  }, []);

  const updateUserPoints = (newPoints: number) => {
    setUser({ ...user, points: newPoints });
  };

  const addToHistory = (item: HistoryItem) => {
    const newHistory = [item, ...history];
    setHistory(newHistory);
    localStorage.setItem('translation_history', JSON.stringify(newHistory));
  };

  const renderContent = () => {
    switch (currentRoute) {
      case AppRoute.HOME:
        return (
          <HomePage 
            user={user}
            updateUserPoints={updateUserPoints}
            addToHistory={addToHistory}
            history={history}
            navigate={setCurrentRoute}
            setCallContext={setCallContext}
          />
        );
      case AppRoute.CONVERSATION:
      case AppRoute.CALL_MODE:
        return (
          <ConversationPage 
             user={user}
             navigate={setCurrentRoute}
             context={callContext}
          />
        );
      case AppRoute.PROFILE:
        return <ProfilePage user={user} />;
      case AppRoute.HISTORY:
        return (
            <div className="p-6 pb-24">
                <h2 className="text-3xl font-bold mb-6 text-slate-900">History</h2>
                {history.length === 0 ? (
                    <div className="text-center text-slate-400 mt-20">
                      <p>No history yet</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
                      {history.map(item => <TranslationCard key={item.id} item={item} />)}
                    </div>
                )}
            </div>
        );
      default:
        return <HomePage 
            user={user}
            updateUserPoints={updateUserPoints}
            addToHistory={addToHistory}
            history={history}
            navigate={setCurrentRoute}
            setCallContext={setCallContext}
        />;
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9ff] max-w-md mx-auto relative shadow-2xl overflow-hidden">
      {/* App Header - Only for history/profile if needed, but we removed it for Home for a cleaner look */}
      
      {/* Main Content */}
      <main className="h-full overflow-y-auto no-scrollbar">
        {renderContent()}
      </main>

      {/* Bottom Navigation */}
      <Navigation currentRoute={currentRoute} onNavigate={setCurrentRoute} />
    </div>
  );
};

export default App;
