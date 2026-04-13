import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis } from 'recharts';

const COLORS = ['#3b82f6', '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b', '#10b981'];

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCity, setSelectedCity] = useState(user?.city || 'Mumbai');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/analytics?city=${selectedCity}`);
        setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [selectedCity]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
           <div>
              <h1 className="text-3xl font-extrabold text-gray-900">City Insights</h1>
              <p className="text-gray-500">Real-time engagement and trends for {selectedCity}</p>
           </div>
           <div className="flex bg-gray-100 p-1 rounded-xl">
              <input 
                type="text" 
                placeholder="Switch city..."
                className="bg-transparent px-4 py-2 outline-none text-sm w-32 md:w-48"
                onKeyDown={(e) => e.key === 'Enter' && setSelectedCity(e.currentTarget.value)}
              />
           </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
           <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
              <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Total Posts</p>
              <h3 className="text-4xl font-extrabold text-gray-900">{data?.totalPosts || 0}</h3>
              <p className="text-green-500 text-xs font-medium mt-2">↑ Community activity</p>
           </div>
           <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
              <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Total Engagement</p>
              <h3 className="text-4xl font-extrabold text-gray-900">{data?.totalUpvotes || 0}</h3>
              <p className="text-indigo-500 text-xs font-medium mt-2">♥ Upvotes received</p>
           </div>
           <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
              <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Active Neighbors</p>
              <h3 className="text-4xl font-extrabold text-gray-900">{data?.activeUsers || 0}</h3>
              <p className="text-blue-500 text-xs font-medium mt-2">👥 Local users</p>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           {/* Category Chart */}
           <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 h-[450px]">
              <h3 className="text-xl font-bold text-gray-800 mb-6">Discourse Categories</h3>
              <ResponsiveContainer width="100%" height="80%">
                 <PieChart>
                    <Pie
                       data={data?.postsByCategory || []}
                       cx="50%"
                       cy="50%"
                       innerRadius={60}
                       outerRadius={100}
                       paddingAngle={5}
                       dataKey="value"
                    >
                       {(data?.postsByCategory || []).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                       ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ borderRadius: '15px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    />
                    <Legend />
                 </PieChart>
              </ResponsiveContainer>
              {(!data?.postsByCategory || data?.postsByCategory.length === 0) && (
                <p className="text-center text-gray-400 -mt-20">No data available for this city.</p>
              )}
           </div>

           {/* Keywords Section */}
           <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 max-h-[450px] flex flex-col">
              <h3 className="text-xl font-bold text-gray-800 mb-6 font-serif">Trending Keywords</h3>
              <div className="flex flex-wrap gap-3 overflow-y-auto">
                 {(!data?.trendingKeywords || data?.trendingKeywords.length === 0) ? (
                    <p className="text-gray-400 text-sm">Waiting for more community posts to identify trends...</p>
                 ) : (
                    data.trendingKeywords.map((kw, i) => (
                       <div key={i} className="flex items-center gap-2 bg-slate-50 border border-slate-100 px-4 py-2 rounded-2xl hover:bg-slate-100 transition-all cursor-default group">
                          <span className="text-gray-700 font-bold group-hover:text-blue-600">#{kw.text}</span>
                          <span className="text-[10px] text-gray-400 bg-white px-2 py-0.5 rounded-full border border-gray-100 shadow-sm">{kw.value}</span>
                       </div>
                    ))
                 )}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
