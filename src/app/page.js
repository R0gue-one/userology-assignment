'use client';
import { useEffect, useState, useRef } from 'react';
import WeatherDashboard from './components/weatherDashboards.js';
import CryptoDashboard from './components/cryptoDashboard';
import NewsDashboard from './components/newsDashboard';
import { ChevronDown } from 'lucide-react';
import ReduxProvider from './ReduxProvider';


export default function Dashboard() {
  const [showScrollHint, setShowScrollHint] = useState(true);
  const newsRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setShowScrollHint(false);
      } else {
        setShowScrollHint(true);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToNews = () => {
    newsRef.current?.scrollIntoView({ behavior: 'smooth' });
    setShowScrollHint(false);
  };

  return (
    <ReduxProvider>
      <main className="min-h-screen bg-gray-900 text-gray-100">
        {/* Hero section with widgets */}
        <div className="min-h-screen px-4 md:px-8 pt-8 pb-24 relative">
          <header className="text-5xl font-extrabold mb-12 px-4 text-center bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500 text-transparent bg-clip-text animate-fade-in">
            CryptoWeather Nexus
          </header>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 lg:gap-16 max-w-7xl mx-auto">
            <div className="bg-gray-800 rounded-xl shadow-xl shadow-blue-900/20 p-8 hover:shadow-blue-800/30 transition-all duration-300">
              <WeatherDashboard />
            </div>
            <div className="bg-gray-800 rounded-xl shadow-xl shadow-amber-900/20 p-8 hover:shadow-amber-800/30 transition-all duration-300">
              <CryptoDashboard />
            </div>
          </div>

          {/* Floating scroll hint */}
          {showScrollHint && (
            <div
              onClick={scrollToNews}
              className="fixed bottom-12 left-1/2 transform -translate-x-1/2 bg-gray-800/80 backdrop-blur-sm text-white px-6 py-3 rounded-full shadow-lg cursor-pointer hover:bg-gray-700 transition-all flex items-center gap-3 z-10 max-w-xs"
            >
              <span className="text-sm">Scroll for News</span>
              <ChevronDown className="animate-bounce" size={20} />
            </div>
          )}
        </div>

        {/* News section in center position */}
        <div ref={newsRef} className="py-16 px-4 md:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-gray-800 rounded-xl shadow-xl border border-gray-700/30 overflow-hidden p-6">
              <NewsDashboard />
            </div>
          </div>
        </div>
      </main>
    </ReduxProvider>
  );
}