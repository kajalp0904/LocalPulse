import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function MorningBrief() {
  const { user, token } = useAuth();
  const [selectedCity, setSelectedCity] = useState(user?.city || 'Mumbai');
  const [savedCities, setSavedCities] = useState([]);
  const [brief, setBrief] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load saved cities from localStorage (shared with Home page)
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('savedCities') || '[]');
    if (stored.length === 0 && user?.city) {
      stored.push(user.city);
    }
    setSavedCities(stored);
    
    // Default to the first saved city if no selected city
    if (stored.length > 0 && !selectedCity) {
      setSelectedCity(stored[0]);
    }
  }, [user]);

  const generateBrief = async () => {
    try {
      setLoading(true);
      setError(null);
      setBrief(''); // Clear old brief
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/brief?city=${selectedCity}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBrief(res.data.brief);
    } catch (err) {
      console.error(err);
      setError("Failed to generate brief. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        
        {/* City Selector Tabs */}
        <div className="mb-6 flex gap-2 flex-wrap justify-center">
            {savedCities.map(city => (
              <button key={city} onClick={() => { setSelectedCity(city); setBrief(''); }}
                className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${selectedCity === city ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-gray-400 hover:bg-gray-100 border border-gray-100'}`}
              >
                {city}
              </button>
            ))}
        </div>

        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white text-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
            <h1 className="text-4xl font-black mb-2 relative z-10 tracking-tighter">Your Daily Intel</h1>
            <p className="text-blue-100 text-lg relative z-10 font-medium">Smart AI Briefing for <span className="underline decoration-blue-300 underline-offset-4">{selectedCity}</span></p>
          </div>

          <div className="p-8 md:p-12">
            {!brief && !loading && (
              <div className="text-center py-10">
                <div className="text-6xl mb-6 animate-bounce">📰</div>
                <h2 className="text-2xl font-black text-gray-900 mb-4">Ready for your morning update?</h2>
                <p className="text-gray-500 mb-8 max-w-md mx-auto font-medium">Get a concise, AI-powered summary of news, weather, and jobs specifically for {selectedCity}.</p>
                <button
                  onClick={generateBrief}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-2xl font-black text-lg transition-all shadow-xl shadow-blue-500/30 hover:-translate-y-1 active:scale-95"
                >
                  Generate {selectedCity} Brief
                </button>
              </div>
            )}

            {loading && (
              <div className="text-center py-20">
                <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mx-auto mb-6"></div>
                <p className="text-gray-900 font-bold animate-pulse text-lg">Scanning headlines in {selectedCity}...</p>
                <p className="text-gray-400 text-sm mt-2 font-medium">Llama 3.3 AI is writing your summary.</p>
              </div>
            )}

            {error && (
              <div className="bg-red-50 text-red-600 p-6 rounded-2xl mb-6 text-center border border-red-100">
                <p className="font-bold">{error}</p>
                <button onClick={generateBrief} className="mt-4 text-sm underline font-bold">Try again</button>
              </div>
            )}

            {brief && !loading && (
              <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
                <div className="flex justify-between items-center mb-10">
                   <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-4 py-1.5 rounded-full uppercase tracking-[0.2em] border border-blue-100">
                     AI Generated Summary
                   </span>
                   <button 
                     onClick={generateBrief}
                     className="text-xs font-black text-gray-400 hover:text-blue-600 transition-colors uppercase tracking-widest bg-gray-50 px-4 py-1.5 rounded-full"
                   >
                     Refresh
                   </button>
                </div>
                
                <div className="prose prose-blue max-w-none">
                   <p className="text-gray-800 text-lg md:text-2xl leading-relaxed whitespace-pre-wrap font-serif italic border-l-4 border-blue-600 pl-4 md:pl-8 pr-2 md:pr-4">
                     "{brief}"
                   </p>
                </div>

                <div className="mt-16 p-8 bg-slate-50 rounded-3xl grid grid-cols-1 md:grid-cols-3 gap-8">
                   <div className="text-center">
                      <p className="text-3xl mb-2">📊</p>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Data Source</p>
                      <p className="text-sm font-black text-gray-800 mt-1">Google News RSS</p>
                   </div>
                   <div className="text-center">
                      <p className="text-3xl mb-2">🌤️</p>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Atmosphere</p>
                      <p className="text-sm font-black text-gray-800 mt-1">Live Weather</p>
                   </div>
                   <div className="text-center">
                      <p className="text-3xl mb-2">🧠</p>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">LLM Model</p>
                      <p className="text-sm font-black text-gray-800 mt-1">Llama 3.3 70B</p>
                   </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
