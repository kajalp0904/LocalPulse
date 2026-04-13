import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '', email: '', password: ''
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/signup';
      const payload = isLogin 
        ? { email: formData.email, password: formData.password }
        : { name: formData.name, email: formData.email, password: formData.password };

      const res = await axios.post(`${import.meta.env.VITE_API_URL}${endpoint}`, payload);
      
      login(res.data, res.data.token);
      navigate('/home');
    } catch (err) {
      setError(err.response?.data?.error || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white max-w-md w-full rounded-3xl shadow-xl overflow-hidden border border-gray-100">
        <div className="flex p-2 bg-gray-50/80">
          <button 
            type="button"
            onClick={() => {setIsLogin(true); setError(null);}} 
            className={`flex-1 py-3 text-sm font-semibold rounded-2xl transition-all ${isLogin ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Login
          </button>
          <button 
            type="button"
            onClick={() => {setIsLogin(false); setError(null);}} 
            className={`flex-1 py-3 text-sm font-semibold rounded-2xl transition-all ${!isLogin ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 pb-10">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
            {isLogin ? 'Welcome Back' : 'Join LocalPulse'}
          </h2>

          {error && <div className="p-3 mb-6 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100 text-center">{error}</div>}

          <div className="space-y-5">
            {!isLogin && (
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Full Name</label>
                <input 
                  type="text" 
                  value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full mt-2 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                  required={!isLogin} 
                />
              </div>
            )}
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Email Address</label>
              <input 
                type="email" 
                value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                className="w-full mt-2 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                required 
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Password</label>
              <input 
                type="password" 
                value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})}
                className="w-full mt-2 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                required 
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full mt-10 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-blue-500/30 transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing...' : (isLogin ? 'Login' : 'Create Account')}
          </button>
        </form>
      </div>
    </div>
  );
}
