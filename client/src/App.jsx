import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

import Landing from './pages/Landing';
import Auth from './pages/Auth';
import Home from './pages/Home';
import MorningBrief from './pages/MorningBrief';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Navbar from './components/Navbar';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="h-screen flex items-center justify-center text-xl">Loading...</div>;
  return isAuthenticated ? children : <Navigate to="/auth" />;
};

const AppRoutes = () => {
  const { isAuthenticated } = useAuth();
  return (
    <div className="min-h-screen bg-neutral-50 text-gray-900 font-sans">
      {isAuthenticated && <Navbar />}
      <div className={isAuthenticated ? "pt-16" : ""}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/brief" element={<ProtectedRoute><MorningBrief /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        </Routes>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
