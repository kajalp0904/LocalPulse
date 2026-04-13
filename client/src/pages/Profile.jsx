import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

export default function Profile() {
  const { user, token, logout } = useAuth();
  const [city, setCity] = useState(user?.city || '');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const res = await axios.put(`${import.meta.env.VITE_API_URL}/api/auth/profile`, {
        city: city
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update local storage and context if necessary
      // For simplicity, we just notify the user to refresh or we could update context
      setMessage({ type: 'success', text: 'Profile preferences updated successfully!' });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to update.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
         <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
            <div className="p-8 pb-0 flex flex-col items-center">
               <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl rotate-6 flex items-center justify-center text-white text-4xl font-black shadow-lg shadow-blue-200">
                  {user?.name?.[0] || 'U'}
               </div>
               <h2 className="mt-6 text-2xl font-black text-gray-900">{user?.name}</h2>
               <p className="text-gray-500 font-medium">{user?.email}</p>
            </div>

            <form onSubmit={handleUpdate} className="p-8 space-y-6">
               {message && (
                 <div className={`p-4 rounded-xl text-sm font-bold text-center ${message.type === 'success' ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                   {message.text}
                 </div>
               )}

               <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Default City</label>
                  <input 
                    type="text" 
                    value={city} 
                    onChange={e => setCity(e.target.value)}
                    className="w-full mt-2 px-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:outline-none transition-all font-semibold"
                  />
               </div>

               <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Account Actions</label>
                  <div className="mt-4 flex gap-4">
                     <button 
                        type="submit"
                        disabled={loading}
                        className="flex-1 bg-gray-900 text-white font-bold py-4 rounded-2xl hover:bg-black transition-all shadow-lg"
                     >
                        Save Preferences
                     </button>
                     <button 
                        type="button"
                        onClick={logout}
                        className="px-6 bg-red-50 text-red-600 font-bold rounded-2xl hover:bg-red-100 transition-all border border-red-100"
                     >
                        Logout
                     </button>
                  </div>
               </div>
            </form>
         </div>

         <div className="mt-10 text-center">
            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-4">Your Usage This Month</p>
            <div className="flex justify-center gap-10">
               <div className="text-center">
                  <p className="text-2xl font-black text-gray-800">12</p>
                  <p className="text-[10px] text-gray-500 font-bold uppercase">Briefs Read</p>
               </div>
               <div className="text-center">
                  <p className="text-2xl font-black text-gray-800">4</p>
                  <p className="text-[10px] text-gray-500 font-bold uppercase">Posts Made</p>
               </div>
               <div className="text-center">
                  <p className="text-2xl font-black text-gray-800">23</p>
                  <p className="text-[10px] text-gray-500 font-bold uppercase">Upvotes Given</p>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
