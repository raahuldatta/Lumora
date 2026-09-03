import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import History from './pages/History';
import Login from './pages/Login';
import Home from './pages/Home';
import About from './pages/About';
import Pricing from './pages/Pricing';
import JarvisChat from './components/JarvisChat';
import Footer from './components/Footer';
import { AnimatePresence, motion } from 'motion/react';
import { User, Portfolio } from './types';
import { CheckCircle2 } from 'lucide-react';

import Backtest from './pages/Backtest';

export default function App() {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('sentix_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [toasts, setToasts] = useState<{ id: string, message: string }[]>([]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        const userData = event.data.user;
        setUser(userData);
        localStorage.setItem('sentix_user', JSON.stringify(userData));
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  useEffect(() => {
    if (user) {
      fetch(`/api/portfolio/${user.id}`)
        .then(res => {
          if (!res.ok) throw new Error("Failed to fetch portfolio");
          return res.json();
        })
        .then(data => setPortfolio(data))
        .catch(err => console.error("Error fetching portfolio:", err));
    }
  }, [user]);

  useEffect(() => {
    const handleTrade = (e: CustomEvent) => {
      if (e.detail?.message) {
        const id = Math.random().toString();
        setToasts(prev => [...prev, { id, message: e.detail.message }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
      }

      if (user) {
        fetch(`/api/portfolio/${user.id}`)
          .then(res => {
            if (!res.ok) throw new Error("Failed to fetch portfolio");
            return res.json();
          })
          .then(data => setPortfolio(data))
          .catch(err => console.error("Error fetching portfolio:", err));
      }
    };
    window.addEventListener('TRADE_EXECUTED', handleTrade as EventListener);
    return () => window.removeEventListener('TRADE_EXECUTED', handleTrade as EventListener);
  }, [user]);

  const handleLogout = () => {
    setUser(null);
    setPortfolio(null);
    localStorage.removeItem('sentix_user');
  };

  const handleUpdateUser = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('sentix_user', JSON.stringify(updatedUser));
  };

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-zinc-950 text-zinc-200">
        <Navbar user={user} onLogout={handleLogout} />
        <main className="pt-20 min-h-screen">
          <Routes>
            {/* Public Routes */}
            <Route path="/home" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/pricing" element={<Pricing user={user || { id: 'guest', email: '', name: 'Guest' }} onUpdateUser={handleUpdateUser} />} />
            <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />

            {/* Protected Routes */}
            <Route 
              path="/" 
              element={user ? <Dashboard user={user} /> : <Navigate to="/home" replace />} 
            />
            <Route 
              path="/history" 
              element={user ? <History user={user} /> : <Navigate to="/login" replace />} 
            />
            <Route 
              path="/backtest" 
              element={user ? <Backtest /> : <Navigate to="/login" replace />} 
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/home" replace />} />
          </Routes>
        </main>

        {user && <JarvisChat user={user} portfolio={portfolio} />}
        <Footer />
        
        {/* Toast Container */}
        <div className="fixed top-24 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
          <AnimatePresence>
            {toasts.map(toast => (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: -20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.9 }}
                className="bg-zinc-900 border border-zinc-800 shadow-2xl rounded-xl p-4 flex items-center gap-3 text-sm font-medium text-white pointer-events-auto"
              >
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                {toast.message}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </BrowserRouter>
  );
}
