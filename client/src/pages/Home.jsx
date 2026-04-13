import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

import BreakingNewsBanner from '../components/BreakingNewsBanner';
import NewsCard from '../components/NewsCard';
import WeatherWidget from '../components/WeatherWidget';
import JobsPanel from '../components/JobsPanel';
import MapView from '../components/MapView';
import NewsTicker from '../components/NewsTicker';

const NEWS_CATEGORIES = ['All', 'Politics', 'Crime', 'Sports', 'Business', 'Technology', 'Entertainment', 'Education', 'General'];

export default function Home() {
  const { user } = useAuth();

  const [selectedCity, setSelectedCity] = useState(user?.city || 'Mumbai');
  const [cityInput, setCityInput] = useState('');
  const [savedCities, setSavedCities] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');

  const [allNews, setAllNews] = useState([]);
  const [weather, setWeather] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load saved cities from localStorage
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('savedCities') || '[]');
    if (stored.length === 0) {
      stored.push(user?.city || 'Mumbai');
      localStorage.setItem('savedCities', JSON.stringify(stored));
    }
    setSavedCities(stored);
  }, [user?.city]);

  const addCity = () => {
    const city = cityInput.trim();
    if (city && !savedCities.includes(city)) {
      const updated = [...savedCities, city];
      setSavedCities(updated);
      localStorage.setItem('savedCities', JSON.stringify(updated));
    }
    if (city) setSelectedCity(city);
    setCityInput('');
  };

  const removeCity = (city) => {
    const updated = savedCities.filter(c => c !== city);
    setSavedCities(updated);
    localStorage.setItem('savedCities', JSON.stringify(updated));
    if (selectedCity === city && updated.length > 0) setSelectedCity(updated[0]);
  };

  // Fetch ALL data once when city changes
  useEffect(() => {
    if (!selectedCity) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const [nRes, wRes, jRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL}/api/news?city=${selectedCity}`).catch(() => ({ data: [] })),
          axios.get(`${import.meta.env.VITE_API_URL}/api/weather?city=${selectedCity}`).catch(() => ({ data: null })),
          axios.get(`${import.meta.env.VITE_API_URL}/api/jobs?city=${selectedCity}`).catch(() => ({ data: [] }))
        ]);
        setAllNews(nRes.data || []);
        setWeather(wRes.data || null);
        setJobs(jRes.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedCity]);

  // Filter news by AI-assigned category
  const filteredNews = useMemo(() => {
    if (activeCategory === 'All') return allNews;
    return allNews.filter(a => a.detectedCategory === activeCategory);
  }, [allNews, activeCategory]);

  const categoryCounts = useMemo(() => {
    const counts = { All: allNews.length };
    NEWS_CATEGORIES.slice(1).forEach(cat => {
      counts[cat] = allNews.filter(a => a.detectedCategory === cat).length;
    });
    return counts;
  }, [allNews]);

  return (
    <div className="bg-slate-50 min-h-screen pb-20 relative">
      <BreakingNewsBanner />
      <NewsTicker news={allNews} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* City Selector */}
        <div className="mb-8 p-6 bg-white rounded-3xl shadow-sm border border-gray-100">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-5">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900">
                Latest for <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">{selectedCity}</span>
              </h1>
              <p className="text-gray-500 mt-1 font-medium">Curated local news, live weather & career opportunities.</p>
            </div>
            <div className="flex gap-2 items-center">
              <input
                type="text" value={cityInput}
                onChange={e => setCityInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addCity()}
                placeholder="Search city..."
                className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm w-48 font-semibold"
              />
              <button 
                onClick={addCity} 
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-md active:scale-95"
              >
                Go
              </button>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            {savedCities.map(city => (
              <button key={city} onClick={() => setSelectedCity(city)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all ${selectedCity === city ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/30' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                {city}
                {savedCities.length > 1 && (
                  <span onClick={(e) => { e.stopPropagation(); removeCity(city); }} className="ml-1 text-xs opacity-60 hover:opacity-100 cursor-pointer">✕</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Category Filters */}
        <div className="mb-8 flex gap-2 flex-wrap items-center">
          <span className="text-xs font-black uppercase text-gray-400 tracking-widest mr-2">Browse Categories:</span>
          {NEWS_CATEGORIES.map(cat => {
            const count = categoryCounts[cat] || 0;
            if (cat !== 'All' && count === 0) return null; // Hide empty categories
            return (
              <button key={cat} onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-1.5 ${activeCategory === cat ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200 uppercase tracking-tighter'}`}
              >
                {cat}
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${activeCategory === cat ? 'bg-white/20' : 'bg-gray-100'}`}>{count}</span>
              </button>
            );
          })}
        </div>

        {loading ? (
          <div className="flex justify-center p-20">
            <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="lg:w-3/5">
              <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-3">
                <span className="w-2 h-8 bg-blue-600 rounded-full"></span>
                {activeCategory === 'All' ? 'Latest Stories' : `Local ${activeCategory} News`}
              </h2>
              <div>
                {filteredNews.length === 0 ? (
                  <div className="bg-white p-12 rounded-3xl border border-dashed border-gray-200 text-center text-gray-400">
                    {allNews.length === 0 ? `No news currently reported for ${selectedCity}.` : `No ${activeCategory} news found. Try another category.`}
                  </div>
                ) : (
                  filteredNews.map((item, i) => <NewsCard key={i} article={item} />)
                )}
              </div>
            </div>

            <div className="lg:w-2/5 space-y-8">
              <WeatherWidget weather={weather} />
              <JobsPanel jobs={jobs} />
              
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                 <h3 className="text-lg font-bold text-gray-900 mb-4">City Map View</h3>
                 <MapView city={selectedCity} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
