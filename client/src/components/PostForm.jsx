import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function PostForm({ isOpen, onClose }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('general');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { token } = useAuth();

  if(!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Mock random location around center for demo
      const userLocation = { lat: 19.0760 + (Math.random()*0.02 - 0.01), lng: 72.8777 + (Math.random()*0.02 - 0.01) };
      
      await axios.post(`${import.meta.env.VITE_API_URL}/api/posts`, {
          title, content, category, location: userLocation
      }, {
          headers: { Authorization: `Bearer ${token}` }
      });
      
      setTitle(''); setContent(''); setCategory('general');
      onClose(); 
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.reason || "Post rejected.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
       <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl relative">
          <button onClick={onClose} className="absolute top-4 right-5 text-gray-400 hover:text-gray-800 text-2xl">&times;</button>
          <div className="p-8">
             <h2 className="text-2xl font-bold text-gray-900 mb-6">Post a Local Update</h2>
             {error && <div className="p-3 mb-4 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}
             
             <form onSubmit={handleSubmit} className="space-y-4">
               <div>
                  <label className="text-xs font-bold text-gray-400 uppercase">Title</label>
                  <input required type="text" value={title} onChange={e=>setTitle(e.target.value)} className="w-full mt-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="What's happening?" />
               </div>
               <div>
                  <label className="text-xs font-bold text-gray-400 uppercase">Category</label>
                  <select value={category} onChange={e=>setCategory(e.target.value)} className="w-full mt-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none">
                     <option value="general">General</option>
                     <option value="traffic">Traffic</option>
                     <option value="event">Event</option>
                     <option value="alert">Alert</option>
                  </select>
               </div>
               <div>
                  <label className="text-xs font-bold text-gray-400 uppercase">Details</label>
                  <textarea required value={content} onChange={e=>setContent(e.target.value)} rows="4" className="w-full mt-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Provide more details..."></textarea>
               </div>
               <button disabled={loading} type="submit" className="w-full mt-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-4 rounded-xl disabled:opacity-50">
                  {loading ? 'Submitting & Moderating...' : 'Post Update'}
               </button>
             </form>
          </div>
       </div>
    </div>
  );
}
