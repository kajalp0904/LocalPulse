import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const { logout, user } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    }

    return (
        <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md shadow-sm z-50 border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                <Link to="/home" className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 tracking-tighter hover:opacity-80 transition-opacity">
                    LocalPulse
                </Link>
                <div className="flex gap-8 items-center">
                    <Link to="/home" className="text-gray-600 hover:text-blue-600 text-sm font-bold uppercase tracking-widest transition-colors">Home</Link>
                    <Link to="/brief" className="text-gray-600 hover:text-blue-600 text-sm font-bold uppercase tracking-widest transition-colors">Daily Brief</Link>
                    <Link to="/profile" className="flex items-center gap-2 group">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-black group-hover:bg-blue-600 group-hover:text-white transition-all">
                            {user?.name?.[0] || 'U'}
                        </div>
                        <span className="text-gray-600 text-xs font-bold uppercase tracking-widest group-hover:text-blue-600 transition-colors hidden sm:block">
                            {user?.name || 'Profile'}
                        </span>
                    </Link>
                    <div className="h-6 w-px bg-gray-200"></div>
                    <button onClick={handleLogout} className="px-5 py-2 bg-gray-900 hover:bg-black text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-gray-200">Logout</button>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;
